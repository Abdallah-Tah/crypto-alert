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

        return [
            'user_id' => $userId,
            'tax_year' => $taxYear,
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString()
            ],
            'holdings_summary' => $this->getHoldingsSummary($userId),
            'realized_gains_losses' => $this->calculateRealizedGainsLosses($userId, $startDate, $endDate),
            'unrealized_gains_losses' => $this->calculateUnrealizedGainsLosses($userId),
            'tax_forms' => $this->generateTaxForms($userId, $taxYear),
            'tax_optimization' => $this->generateTaxOptimizationSuggestions($userId),
            'generated_at' => now()
        ];
    }

    /**
     * Get summary of all holdings
     */
    private function getHoldingsSummary(int $userId): array
    {
        $portfolio = $this->watchlistService->getPortfolioSummary($userId);

        return [
            'total_holdings' => $portfolio['holdings_count'],
            'total_current_value' => $portfolio['total_value'],
            'total_cost_basis' => $portfolio['total_invested'],
            'unrealized_gain_loss' => $portfolio['total_gain_loss'],
            'unrealized_percentage' => $portfolio['percentage_change'],
            'by_asset' => $portfolio['portfolio']
        ];
    }

    /**
     * Calculate realized gains and losses (from actual sales/trades)
     * Note: This is a mock implementation. In production, you'd track actual transactions.
     */
    private function calculateRealizedGainsLosses(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        // Mock data - in production, this would come from actual transaction records
        $mockTransactions = [
            [
                'symbol' => 'BTC',
                'type' => 'sell',
                'quantity' => 0.1,
                'sale_price' => 45000,
                'purchase_price' => 40000,
                'sale_date' => '2024-06-15',
                'purchase_date' => '2024-01-15',
                'holding_period' => 'long_term', // > 1 year
                'gain_loss' => 500
            ],
            [
                'symbol' => 'ETH',
                'type' => 'sell',
                'quantity' => 2,
                'sale_price' => 2500,
                'purchase_price' => 2800,
                'sale_date' => '2024-08-20',
                'purchase_date' => '2024-07-01',
                'holding_period' => 'short_term', // < 1 year
                'gain_loss' => -600
            ]
        ];

        $shortTermGains = 0;
        $shortTermLosses = 0;
        $longTermGains = 0;
        $longTermLosses = 0;

        foreach ($mockTransactions as $transaction) {
            if ($transaction['holding_period'] === 'short_term') {
                if ($transaction['gain_loss'] > 0) {
                    $shortTermGains += $transaction['gain_loss'];
                } else {
                    $shortTermLosses += abs($transaction['gain_loss']);
                }
            } else {
                if ($transaction['gain_loss'] > 0) {
                    $longTermGains += $transaction['gain_loss'];
                } else {
                    $longTermLosses += abs($transaction['gain_loss']);
                }
            }
        }

        return [
            'transactions' => $mockTransactions,
            'summary' => [
                'short_term_gains' => $shortTermGains,
                'short_term_losses' => $shortTermLosses,
                'short_term_net' => $shortTermGains - $shortTermLosses,
                'long_term_gains' => $longTermGains,
                'long_term_losses' => $longTermLosses,
                'long_term_net' => $longTermGains - $longTermLosses,
                'total_net_gain_loss' => ($shortTermGains - $shortTermLosses) + ($longTermGains - $longTermLosses)
            ]
        ];
    }

    /**
     * Calculate unrealized gains and losses (current holdings)
     */
    private function calculateUnrealizedGainsLosses(int $userId): array
    {
        $portfolio = $this->watchlistService->getPortfolioSummary($userId);

        $unrealizedGains = [];
        $unrealizedLosses = [];

        foreach ($portfolio['portfolio'] as $holding) {
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
}
