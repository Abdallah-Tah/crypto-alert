<?php

namespace App\Services;

use App\Models\User;
use App\Models\Watchlist;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TaxReportingService
{
    private WatchlistService $watchlistService;
    private CCXTService $ccxtService;

    public function __construct(WatchlistService $watchlistService, CCXTService $ccxtService)
    {
        $this->watchlistService = $watchlistService;
        $this->ccxtService = $ccxtService;
    }

    /**
     * Generate comprehensive tax report for a user
     */
    public function generateTaxReport(int $userId, int $taxYear): array
    {
        $user = User::find($userId);
        if (!$user) {
            throw new \Exception('User not found');
        }

        $startDate = Carbon::create($taxYear, 1, 1)->startOfDay();
        $endDate = Carbon::create($taxYear, 12, 31)->endOfDay();

        $holdingsSummary = $this->getHoldingsSummary($userId);
        $unrealizedData = $this->calculateUnrealizedGainsLosses($userId);
        $realizedData = $this->calculateRealizedGainsLosses($userId, $startDate, $endDate);

        // Check if user has any transactions for more accurate reporting
        $transactionCount = Transaction::forUser($userId)->count();
        $hasTransactions = $transactionCount > 0;

        return [
            'user_id' => $userId,
            'tax_year' => $taxYear,
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString()
            ],
            'holdings_summary' => $holdingsSummary,
            'realized_gains_losses' => $realizedData,
            'unrealized_gains_losses' => $unrealizedData,
            'tax_forms' => $this->generateTaxForms($userId, $taxYear),
            'tax_optimization' => $this->generateTaxOptimizationSuggestions($userId),
            'portfolio_summary' => [
                'current_portfolio_value' => $holdingsSummary['total_current_value'],
                'total_unrealized_gains' => $unrealizedData['total_unrealized_gains'],
                'total_unrealized_losses' => $unrealizedData['total_unrealized_losses'],
                'note' => $hasTransactions
                    ? 'These are unrealized gains/losses from holdings you still own. They become taxable only when you sell.'
                    : 'Add your buy/sell transactions in the Transaction Management section for accurate tax calculations.'
            ],
            'data_completeness' => [
                'has_transactions' => $hasTransactions,
                'transaction_count' => $transactionCount,
                'watchlist_entries' => $holdingsSummary['total_holdings'],
                'recommendation' => $hasTransactions
                    ? 'Your tax report is based on actual transaction data.'
                    : 'For accurate tax reporting, please add your cryptocurrency buy and sell transactions.'
            ],
            'generated_at' => now()
        ];
    }

    /**
     * Get summary of all holdings using watchlist data (since no transactions exist)
     */
    private function getHoldingsSummary(int $userId): array
    {
        $user = User::find($userId);

        // Get watchlist entries with holdings
        $watchlistItems = Watchlist::where('user_id', $userId)
            ->whereNotNull('holdings_amount')
            ->where('holdings_amount', '>', 0)
            ->get();

        $totalCurrentValue = 0;
        $totalCostBasis = 0;
        $holdingsCount = $watchlistItems->count();
        $byAsset = [];

        foreach ($watchlistItems as $item) {
            // Get current price
            $currentPrice = $this->getCurrentPrice($item->symbol);

            // Calculate values based on holdings type
            if ($item->holdings_type === 'usd_value' && $item->purchase_price) {
                // User entered USD value, calculate coin quantity
                $coinQuantity = $item->holdings_amount / $item->purchase_price;
                $currentValue = $coinQuantity * $currentPrice;
                $costBasis = $item->holdings_amount; // Original USD investment
            } elseif ($item->holdings_type === 'coin_quantity') {
                // User entered coin quantity
                $coinQuantity = $item->holdings_amount;
                $currentValue = $coinQuantity * $currentPrice;
                $costBasis = $item->purchase_price ? ($coinQuantity * $item->purchase_price) : $currentValue;
            } else {
                // Fallback
                $coinQuantity = $item->holdings_amount;
                $currentValue = $currentPrice * $coinQuantity;
                $costBasis = $currentValue; // Assume break-even if no purchase price
            }

            $gainLoss = $currentValue - $costBasis;
            $gainLossPercent = $costBasis > 0 ? ($gainLoss / $costBasis) * 100 : 0;

            $totalCurrentValue += $currentValue;
            $totalCostBasis += $costBasis;

            $byAsset[] = [
                'symbol' => $item->symbol,
                'quantity' => $coinQuantity,
                'current_price' => $currentPrice,
                'current_value' => $currentValue,
                'cost_basis' => $costBasis,
                'gain_loss' => $gainLoss,
                'gain_loss_percent' => $gainLossPercent
            ];
        }

        $unrealizedGainLoss = $totalCurrentValue - $totalCostBasis;
        $unrealizedPercentage = $totalCostBasis > 0 ? ($unrealizedGainLoss / $totalCostBasis) * 100 : 0;

        return [
            'total_holdings' => $holdingsCount,
            'total_current_value' => $totalCurrentValue,
            'total_cost_basis' => $totalCostBasis,
            'unrealized_gain_loss' => $unrealizedGainLoss,
            'unrealized_percentage' => $unrealizedPercentage,
            'by_asset' => $byAsset
        ];
    }

    /**
     * Get current holdings from transaction history (FIFO method)
     */
    private function getCurrentHoldingsFromTransactions(int $userId): array
    {
        $holdings = [];

        // Get all transactions for this user, ordered by date
        $transactions = Transaction::forUser($userId)
            ->orderBy('transaction_date', 'asc')
            ->get();

        foreach ($transactions as $transaction) {
            $symbol = $transaction->symbol;

            if (!isset($holdings[$symbol])) {
                $holdings[$symbol] = [
                    'quantity' => 0,
                    'total_cost' => 0,
                    'transactions' => []
                ];
            }

            if ($transaction->type === 'buy') {
                $holdings[$symbol]['quantity'] += $transaction->quantity;
                $holdings[$symbol]['total_cost'] += $transaction->total_value + $transaction->fees;
                $holdings[$symbol]['transactions'][] = $transaction;
            } elseif ($transaction->type === 'sell') {
                // Reduce holdings using FIFO
                $sellQuantity = $transaction->quantity;
                $remainingToSell = $sellQuantity;

                // Calculate cost basis of sold coins using FIFO
                foreach ($holdings[$symbol]['transactions'] as $key => $buyTransaction) {
                    if ($remainingToSell <= 0)
                        break;

                    $availableFromThisBuy = min($buyTransaction->quantity, $remainingToSell);
                    $costBasisReduction = ($buyTransaction->total_value + $buyTransaction->fees) * ($availableFromThisBuy / $buyTransaction->quantity);

                    $holdings[$symbol]['total_cost'] -= $costBasisReduction;
                    $holdings[$symbol]['quantity'] -= $availableFromThisBuy;
                    $remainingToSell -= $availableFromThisBuy;

                    // Update or remove this buy transaction
                    $buyTransaction->quantity -= $availableFromThisBuy;
                    if ($buyTransaction->quantity <= 0) {
                        unset($holdings[$symbol]['transactions'][$key]);
                    }
                }
            }
        }

        return $holdings;
    }

    /**
     * Get current market price for a symbol
     */
    private function getCurrentPrice(string $symbol): float
    {
        try {
            $priceData = $this->ccxtService->getCurrentPrice($symbol);
            if (is_array($priceData) && isset($priceData['price'])) {
                return (float) $priceData['price'];
            } elseif (is_numeric($priceData)) {
                return (float) $priceData;
            }
            return 0;
        } catch (\Exception $e) {
            Log::error("Failed to get current price for {$symbol}: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Format holdings for display
     */
    private function formatHoldingsByAsset(array $holdings): array
    {
        $formatted = [];

        foreach ($holdings as $symbol => $holding) {
            if ($holding['quantity'] > 0) {
                $currentPrice = $this->getCurrentPrice($symbol);
                $currentValue = $holding['quantity'] * $currentPrice;
                $gainLoss = $currentValue - $holding['total_cost'];

                $formatted[] = [
                    'symbol' => $symbol,
                    'quantity' => $holding['quantity'],
                    'current_price' => $currentPrice,
                    'current_value' => $currentValue,
                    'cost_basis' => $holding['total_cost'],
                    'gain_loss' => $gainLoss,
                    'gain_loss_percent' => $holding['total_cost'] > 0 ? ($gainLoss / $holding['total_cost']) * 100 : 0
                ];
            }
        }

        return $formatted;
    }

    /**
     * Calculate realized gains and losses from actual sell transactions
     */
    private function calculateRealizedGainsLosses(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        // Get all sell transactions within the tax year
        $sellTransactions = Transaction::forUser($userId)
            ->where('type', 'sell')
            ->inDateRange($startDate, $endDate)
            ->orderBy('transaction_date', 'asc')
            ->get();

        $realizedGainsLosses = [];
        $summary = [
            'short_term_gains' => 0,
            'short_term_losses' => 0,
            'short_term_net' => 0,
            'long_term_gains' => 0,
            'long_term_losses' => 0,
            'long_term_net' => 0,
            'total_net_gain_loss' => 0
        ];

        foreach ($sellTransactions as $sellTransaction) {
            $gainsLosses = $this->calculateGainsForSale($userId, $sellTransaction);
            $realizedGainsLosses = array_merge($realizedGainsLosses, $gainsLosses);

            // Update summary
            foreach ($gainsLosses as $gainLoss) {
                $amount = $gainLoss['gain_loss'];
                $isLongTerm = $gainLoss['holding_period'] === 'long_term';

                if ($amount > 0) {
                    // Gain
                    if ($isLongTerm) {
                        $summary['long_term_gains'] += $amount;
                    } else {
                        $summary['short_term_gains'] += $amount;
                    }
                } else {
                    // Loss
                    $lossAmount = abs($amount);
                    if ($isLongTerm) {
                        $summary['long_term_losses'] += $lossAmount;
                    } else {
                        $summary['short_term_losses'] += $lossAmount;
                    }
                }
            }
        }

        // Calculate net amounts
        $summary['short_term_net'] = $summary['short_term_gains'] - $summary['short_term_losses'];
        $summary['long_term_net'] = $summary['long_term_gains'] - $summary['long_term_losses'];
        $summary['total_net_gain_loss'] = $summary['short_term_net'] + $summary['long_term_net'];

        return [
            'transactions' => $realizedGainsLosses,
            'summary' => $summary
        ];
    }

    /**
     * Calculate unrealized gains and losses from watchlist data
     */
    private function calculateUnrealizedGainsLosses(int $userId): array
    {
        $holdingsSummary = $this->getHoldingsSummary($userId);
        $holdings = $holdingsSummary['by_asset'];

        $unrealizedGains = [];
        $unrealizedLosses = [];

        foreach ($holdings as $holding) {
            if ($holding['gain_loss'] > 0) {
                $unrealizedGains[] = $holding;
            } elseif ($holding['gain_loss'] < 0) {
                $unrealizedLosses[] = $holding;
            }
        }

        return [
            'unrealized_gains' => $unrealizedGains,
            'unrealized_losses' => $unrealizedLosses,
            'total_unrealized_gains' => array_sum(array_column($unrealizedGains, 'gain_loss')),
            'total_unrealized_losses' => abs(array_sum(array_column($unrealizedLosses, 'gain_loss')))
        ];
    }

    /**
     * Generate tax forms (Form 8949, Schedule D, etc.)
     */
    private function generateTaxForms(int $userId, int $taxYear): array
    {
        $realizedGainsLosses = $this->calculateRealizedGainsLosses(
            $userId,
            Carbon::create($taxYear, 1, 1),
            Carbon::create($taxYear, 12, 31)
        );

        return [
            'form_8949' => [
                'name' => 'Form 8949 - Sales and Other Dispositions of Capital Assets',
                'short_term_transactions' => array_filter(
                    $realizedGainsLosses['transactions'],
                    fn($t) => $t['holding_period'] === 'short_term'
                ),
                'long_term_transactions' => array_filter(
                    $realizedGainsLosses['transactions'],
                    fn($t) => $t['holding_period'] === 'long_term'
                )
            ],
            'schedule_d' => [
                'name' => 'Schedule D - Capital Gains and Losses',
                'short_term_summary' => [
                    'total_gains' => $realizedGainsLosses['summary']['short_term_gains'],
                    'total_losses' => $realizedGainsLosses['summary']['short_term_losses'],
                    'net_gain_loss' => $realizedGainsLosses['summary']['short_term_net']
                ],
                'long_term_summary' => [
                    'total_gains' => $realizedGainsLosses['summary']['long_term_gains'],
                    'total_losses' => $realizedGainsLosses['summary']['long_term_losses'],
                    'net_gain_loss' => $realizedGainsLosses['summary']['long_term_net']
                ],
                'overall_net_gain_loss' => $realizedGainsLosses['summary']['total_net_gain_loss']
            ]
        ];
    }

    /**
     * Generate tax optimization suggestions
     */
    private function generateTaxOptimizationSuggestions(int $userId): array
    {
        $unrealized = $this->calculateUnrealizedGainsLosses($userId);
        $suggestions = [];

        // Tax-loss harvesting suggestions
        if (!empty($unrealized['unrealized_losses'])) {
            $potentialLossHarvesting = array_filter(
                $unrealized['unrealized_losses'],
                fn($loss) => abs($loss['gain_loss']) > 100 // Only suggest for losses > $100
            );

            if (!empty($potentialLossHarvesting)) {
                $suggestions[] = [
                    'type' => 'tax_loss_harvesting',
                    'title' => 'Consider Tax-Loss Harvesting',
                    'description' => 'You have unrealized losses that could offset capital gains',
                    'potential_savings' => $this->calculateTaxSavings(
                        array_sum(array_column($potentialLossHarvesting, 'gain_loss'))
                    ),
                    'assets' => $potentialLossHarvesting,
                    'priority' => 'high'
                ];
            }
        }

        // Long-term holding suggestions
        $recentPurchases = array_filter(
            $unrealized['unrealized_gains'],
            function ($gain) {
                $purchaseDate = Carbon::parse($gain['purchase_date'] ?? now()->subDays(30));
                $daysSincePurchase = $purchaseDate->diffInDays(now());
                return $daysSincePurchase < 365 && $daysSincePurchase > 300; // Close to 1 year
            }
        );

        if (!empty($recentPurchases)) {
            $suggestions[] = [
                'type' => 'long_term_holding',
                'title' => 'Consider Waiting for Long-Term Capital Gains',
                'description' => 'Some assets are close to qualifying for long-term capital gains treatment',
                'potential_savings' => 'Up to 20% tax rate reduction',
                'assets' => $recentPurchases,
                'priority' => 'medium'
            ];
        }

        // Portfolio rebalancing suggestions
        if ($unrealized['total_unrealized_gains'] > 10000) {
            $suggestions[] = [
                'type' => 'portfolio_rebalancing',
                'title' => 'Consider Strategic Portfolio Rebalancing',
                'description' => 'Your portfolio has significant unrealized gains that could be strategically managed',
                'recommendation' => 'Consider taking some profits and diversifying',
                'priority' => 'low'
            ];
        }

        return $suggestions;
    }

    /**
     * Calculate potential tax savings from loss harvesting
     */
    private function calculateTaxSavings(float $lossAmount): array
    {
        $lossAmount = abs($lossAmount);

        // Estimated tax rates (simplified)
        $shortTermRate = 0.24; // Ordinary income tax rate
        $longTermRate = 0.15;  // Long-term capital gains rate

        return [
            'short_term_offset_savings' => $lossAmount * $shortTermRate,
            'long_term_offset_savings' => $lossAmount * $longTermRate,
            'max_annual_deduction' => min($lossAmount, 3000), // IRS limit
            'carryforward_amount' => max(0, $lossAmount - 3000)
        ];
    }

    /**
     * Export tax report to CSV format
     */
    public function exportToCSV(array $taxReport): string
    {
        $filename = "tax_report_{$taxReport['tax_year']}_user_{$taxReport['user_id']}.csv";
        $filepath = storage_path("app/tax_reports/{$filename}");

        // Ensure directory exists
        if (!file_exists(dirname($filepath))) {
            mkdir(dirname($filepath), 0755, true);
        }

        $file = fopen($filepath, 'w');

        // Write headers
        fputcsv($file, [
            'Date Acquired',
            'Date Sold',
            'Description',
            'Proceeds',
            'Cost Basis',
            'Gain/Loss',
            'Term'
        ]);

        // Write transaction data
        foreach ($taxReport['realized_gains_losses']['transactions'] as $transaction) {
            fputcsv($file, [
                $transaction['purchase_date'],
                $transaction['sale_date'],
                "{$transaction['quantity']} {$transaction['symbol']}",
                $transaction['quantity'] * $transaction['sale_price'],
                $transaction['quantity'] * $transaction['purchase_price'],
                $transaction['gain_loss'],
                $transaction['holding_period']
            ]);
        }

        fclose($file);

        return $filepath;
    }

    /**
     * Calculate gains/losses for a specific sale using FIFO method
     */
    private function calculateGainsForSale(int $userId, Transaction $sellTransaction): array
    {
        $gainsLosses = [];
        $remainingQuantity = $sellTransaction->quantity;

        // Get buy transactions for this symbol in FIFO order (oldest first)
        $buyTransactions = Transaction::forUser($userId)
            ->forSymbol($sellTransaction->symbol)
            ->where('type', 'buy')
            ->where('transaction_date', '<', $sellTransaction->transaction_date)
            ->orderBy('transaction_date', 'asc')
            ->get();

        foreach ($buyTransactions as $buy) {
            if ($remainingQuantity <= 0) {
                break;
            }

            $quantityToMatch = min($remainingQuantity, $buy->quantity);
            $costBasis = ($buy->price_per_unit * $quantityToMatch) + ($buy->fees * ($quantityToMatch / $buy->quantity));
            $proceeds = ($sellTransaction->price_per_unit * $quantityToMatch) - ($sellTransaction->fees * ($quantityToMatch / $sellTransaction->quantity));
            $gainLoss = $proceeds - $costBasis;

            $holdingPeriod = $buy->transaction_date->diffInDays($sellTransaction->transaction_date) > 365 ? 'long_term' : 'short_term';

            $gainsLosses[] = [
                'symbol' => $sellTransaction->symbol,
                'type' => 'sell',
                'quantity' => $quantityToMatch,
                'sale_price' => $sellTransaction->price_per_unit,
                'purchase_price' => $buy->price_per_unit,
                'sale_date' => $sellTransaction->transaction_date->toDateString(),
                'purchase_date' => $buy->transaction_date->toDateString(),
                'holding_period' => $holdingPeriod,
                'cost_basis' => $costBasis,
                'proceeds' => $proceeds,
                'gain_loss' => $gainLoss,
                'sell_transaction_id' => $sellTransaction->id,
                'buy_transaction_id' => $buy->id
            ];

            $remainingQuantity -= $quantityToMatch;
        }

        return $gainsLosses;
    }
}
