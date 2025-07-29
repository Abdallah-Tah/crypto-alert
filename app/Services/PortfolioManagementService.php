<?php

namespace App\Services;

use App\Models\User;
use App\Models\Watchlist;
use App\Models\Cryptocurrency;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PortfolioManagementService
{
    private CCXTService $ccxtService;
    private TaxReportingService $taxReportingService;

    public function __construct(CCXTService $ccxtService, TaxReportingService $taxReportingService)
    {
        $this->ccxtService = $ccxtService;
        $this->taxReportingService = $taxReportingService;
    }

    /**
     * Generate tax optimization suggestions for a user's portfolio
     */
    public function generateTaxOptimizations(int $userId): array
    {
        $user = User::find($userId);
        $holdings = $this->getUserHoldings($userId);

        if (empty($holdings)) {
            return [
                'potential_savings' => 0,
                'tax_loss_harvesting' => [],
                'long_term_holds' => [],
                'short_term_optimization' => [],
                'recommended_actions' => []
            ];
        }

        $taxLossOpportunities = [];
        $longTermHolds = [];
        $shortTermOptimizations = [];
        $totalUnrealizedLosses = 0;
        $harvestableLosses = 0;

        foreach ($holdings as $holding) {
            $currentPrice = $this->ccxtService->getCurrentPrice($holding['symbol']);
            $averageCost = $holding['average_cost'] ?? $currentPrice;
            $amount = $holding['holdings_amount'];
            $unrealizedPnL = ($currentPrice - $averageCost) * $amount;

            // Tax-loss harvesting opportunities
            if ($unrealizedPnL < -50) { // Losses greater than $50
                $totalUnrealizedLosses += abs($unrealizedPnL);

                if ($unrealizedPnL < -100) { // Significant losses
                    $harvestableLosses += abs($unrealizedPnL);
                    $taxLossOpportunities[] = [
                        'symbol' => $holding['symbol'],
                        'current_price' => $currentPrice,
                        'average_cost' => $averageCost,
                        'amount' => $amount,
                        'unrealized_loss' => $unrealizedPnL,
                        'potential_tax_savings' => abs($unrealizedPnL) * 0.22, // Assuming 22% tax rate
                        'recommendation' => 'Consider harvesting for tax deduction',
                        'wash_sale_risk' => $this->checkWashSaleRisk($holding['symbol'], $userId),
                        'priority' => abs($unrealizedPnL) > 1000 ? 'high' : 'medium'
                    ];
                }
            }

            // Long-term capital gains optimization
            if ($unrealizedPnL > 100) { // Gains greater than $100
                $holdPeriod = $this->estimateHoldPeriod($holding);
                if ($holdPeriod < 365) { // Less than 1 year
                    $longTermHolds[] = [
                        'symbol' => $holding['symbol'],
                        'current_price' => $currentPrice,
                        'unrealized_gain' => $unrealizedPnL,
                        'days_to_long_term' => 365 - $holdPeriod,
                        'potential_tax_savings' => $unrealizedPnL * 0.17, // Long-term vs short-term rate difference
                        'recommendation' => 'Hold for long-term capital gains treatment'
                    ];
                }
            }

            // Short-term optimization strategies
            if (abs($unrealizedPnL) > 200) {
                $shortTermOptimizations[] = [
                    'symbol' => $holding['symbol'],
                    'strategy' => $unrealizedPnL > 0 ? 'profit_taking' : 'loss_cutting',
                    'current_value' => $currentPrice * $amount,
                    'pnl' => $unrealizedPnL,
                    'volatility' => $this->calculateVolatility($holding['symbol']),
                    'recommendation' => $this->generateShortTermRecommendation($holding, $unrealizedPnL)
                ];
            }
        }

        $projectedTaxSavings = $harvestableLosses * 0.22; // Estimated tax savings

        return [
            'potential_savings' => $projectedTaxSavings,
            'tax_loss_harvesting' => $taxLossOpportunities,
            'long_term_holds' => $longTermHolds,
            'short_term_optimization' => $shortTermOptimizations,
            'total_unrealized_losses' => $totalUnrealizedLosses,
            'harvestable_losses' => $harvestableLosses,
            'projected_tax_savings' => $projectedTaxSavings,
            'recommended_actions' => $this->generateRecommendedActions($taxLossOpportunities, $longTermHolds, $shortTermOptimizations)
        ];
    }

    /**
     * Execute tax-loss harvesting strategy
     */
    public function executeTaxLossHarvesting(int $userId, array $holdings, string $strategy): array
    {
        $transactions = [];
        $lossesHarvested = 0;
        $taxSavings = 0;
        $washSaleWarnings = [];

        foreach ($holdings as $holding) {
            $symbol = $holding['symbol'];
            $amount = $holding['amount'];

            // Check for wash sale rule violations
            if ($this->checkWashSaleRisk($symbol, $userId)) {
                $washSaleWarnings[] = [
                    'symbol' => $symbol,
                    'warning' => 'Potential wash sale rule violation - consider waiting 30 days'
                ];
                continue;
            }

            $currentPrice = $this->ccxtService->getCurrentPrice($symbol);
            $averageCost = $this->getAverageCost($userId, $symbol);
            $unrealizedLoss = ($currentPrice - $averageCost) * $amount;

            if ($unrealizedLoss < 0) {
                $shouldExecute = $this->shouldExecuteHarvesting($unrealizedLoss, $strategy);

                if ($shouldExecute) {
                    $transactions[] = [
                        'type' => 'sell',
                        'symbol' => $symbol,
                        'amount' => $amount,
                        'price' => $currentPrice,
                        'realized_loss' => abs($unrealizedLoss),
                        'tax_benefit' => abs($unrealizedLoss) * 0.22,
                        'timestamp' => Carbon::now()
                    ];

                    $lossesHarvested += abs($unrealizedLoss);
                    $taxSavings += abs($unrealizedLoss) * 0.22;
                }
            }
        }

        $newAllocation = $this->calculateNewAllocation($userId, $transactions);

        return [
            'transactions' => $transactions,
            'losses_harvested' => $lossesHarvested,
            'tax_savings' => $taxSavings,
            'new_allocation' => $newAllocation,
            'wash_sale_warnings' => $washSaleWarnings
        ];
    }

    /**
     * Rebalance portfolio based on target allocation
     */
    public function rebalancePortfolio(int $userId, array $targetAllocation, string $strategy, float $threshold): array
    {
        $currentHoldings = $this->getUserHoldings($userId);
        $totalPortfolioValue = $this->calculateTotalPortfolioValue($currentHoldings);

        $currentAllocation = $this->calculateCurrentAllocation($currentHoldings, $totalPortfolioValue);
        $recommendedTrades = [];
        $rebalanceNeeded = false;

        foreach ($targetAllocation as $target) {
            $symbol = $target['symbol'];
            $targetPercentage = $target['percentage'];
            $currentPercentage = $currentAllocation[$symbol] ?? 0;

            $deviation = abs($targetPercentage - $currentPercentage);

            if ($deviation > $threshold) {
                $rebalanceNeeded = true;
                $targetValue = ($targetPercentage / 100) * $totalPortfolioValue;
                $currentValue = ($currentPercentage / 100) * $totalPortfolioValue;
                $difference = $targetValue - $currentValue;

                $currentPrice = $this->ccxtService->getCurrentPrice($symbol);
                $amountToTrade = abs($difference) / $currentPrice;

                $recommendedTrades[] = [
                    'symbol' => $symbol,
                    'action' => $difference > 0 ? 'buy' : 'sell',
                    'amount' => $amountToTrade,
                    'price' => $currentPrice,
                    'value' => abs($difference),
                    'current_percentage' => $currentPercentage,
                    'target_percentage' => $targetPercentage,
                    'deviation' => $deviation
                ];
            }
        }

        $costAnalysis = $this->calculateRebalancingCosts($recommendedTrades);
        $taxImplications = $this->calculateTaxImplications($userId, $recommendedTrades);

        return [
            'rebalance_needed' => $rebalanceNeeded,
            'current_allocation' => $currentAllocation,
            'target_allocation' => $targetAllocation,
            'recommended_trades' => $recommendedTrades,
            'cost_analysis' => $costAnalysis,
            'tax_implications' => $taxImplications,
            'estimated_costs' => $costAnalysis['total_costs'],
            'deviation_percentage' => $this->calculateOverallDeviation($currentAllocation, $targetAllocation)
        ];
    }

    /**
     * Generate full portfolio analysis
     */
    public function generateFullPortfolioAnalysis(int $userId): array
    {
        $holdings = $this->getUserHoldings($userId);

        return [
            'performance' => $this->calculatePerformanceMetrics($holdings),
            'risk' => $this->calculateRiskMetrics($holdings),
            'diversification' => $this->analyzeDiversification($holdings),
            'correlations' => $this->calculateCorrelationMatrix($holdings),
            'var' => $this->calculateValueAtRisk($holdings),
            'sharpe_ratio' => $this->calculateSharpeRatio($holdings),
            'volatility' => $this->calculatePortfolioVolatility($holdings),
            'trends' => $this->analyzeTrends($holdings),
            'sectors' => $this->analyzeSectorAllocation($holdings),
            'recommendations' => $this->generateAnalysisRecommendations($holdings),
            'benchmark' => $this->compareToBenchmark($holdings),
            'liquidity' => $this->analyzeLiquidity($holdings)
        ];
    }

    /**
     * Generate optimization recommendations
     */
    public function generateOptimizationRecommendations(int $userId): array
    {
        $holdings = $this->getUserHoldings($userId);
        $analysis = $this->generateFullPortfolioAnalysis($userId);

        return [
            'diversification' => $this->generateDiversificationRecommendations($holdings, $analysis),
            'cost_reduction' => $this->generateCostReductionRecommendations($holdings),
            'performance' => $this->generatePerformanceRecommendations($holdings, $analysis),
            'risk_management' => $this->generateRiskManagementRecommendations($holdings, $analysis),
            'tax_efficiency' => $this->generateTaxEfficiencyRecommendations($userId),
            'priority_actions' => $this->prioritizeRecommendations($holdings, $analysis),
            'long_term_strategy' => $this->generateLongTermStrategy($holdings, $analysis)
        ];
    }

    /**
     * Public method to get user holdings for external services
     */
    public function getUserPortfolioHoldings(int $userId): array
    {
        return $this->getUserHoldings($userId);
    }

    // Private helper methods

    private function getUserHoldings(int $userId): array
    {
        return Watchlist::where('user_id', $userId)
            ->where('holdings_amount', '>', 0)
            ->with('cryptocurrency')
            ->get()
            ->map(function ($watchlist) {
                return [
                    'symbol' => $watchlist->cryptocurrency->symbol,
                    'holdings_amount' => $watchlist->holdings_amount,
                    'average_cost' => $watchlist->average_cost,
                    'current_price' => $watchlist->cryptocurrency->current_price,
                    'price_change_24h' => $watchlist->cryptocurrency->price_change_24h
                ];
            })
            ->toArray();
    }

    private function checkWashSaleRisk(string $symbol, int $userId): bool
    {
        // Check if user has sold this asset in the last 30 days
        // This would require a transaction history table in a real implementation
        return false; // Placeholder
    }

    private function estimateHoldPeriod(array $holding): int
    {
        // Estimate hold period based on when the position was first established
        // This would require transaction history in a real implementation
        return rand(30, 400); // Placeholder
    }

    private function calculateVolatility(string $symbol): float
    {
        // Calculate 30-day volatility for the symbol
        // This would require historical price data
        return rand(10, 80) / 100; // Placeholder percentage
    }

    private function generateShortTermRecommendation(array $holding, float $pnl): string
    {
        if ($pnl > 500) {
            return 'Consider taking partial profits';
        } elseif ($pnl < -500) {
            return 'Consider cutting losses or averaging down';
        }
        return 'Monitor position closely';
    }

    private function generateRecommendedActions(array $taxLoss, array $longTerm, array $shortTerm): array
    {
        $actions = [];

        if (!empty($taxLoss)) {
            $actions[] = [
                'type' => 'tax_loss_harvesting',
                'priority' => 'high',
                'description' => 'Execute tax-loss harvesting on ' . count($taxLoss) . ' positions',
                'potential_benefit' => array_sum(array_column($taxLoss, 'potential_tax_savings'))
            ];
        }

        if (!empty($longTerm)) {
            $actions[] = [
                'type' => 'long_term_hold',
                'priority' => 'medium',
                'description' => 'Hold ' . count($longTerm) . ' positions for long-term capital gains',
                'potential_benefit' => array_sum(array_column($longTerm, 'potential_tax_savings'))
            ];
        }

        return $actions;
    }

    private function shouldExecuteHarvesting(float $loss, string $strategy): bool
    {
        switch ($strategy) {
            case 'aggressive':
                return abs($loss) > 50;
            case 'moderate':
                return abs($loss) > 200;
            case 'conservative':
                return abs($loss) > 500;
            default:
                return abs($loss) > 200;
        }
    }

    private function getAverageCost(int $userId, string $symbol): float
    {
        $watchlist = Watchlist::where('user_id', $userId)
            ->whereHas('cryptocurrency', function ($query) use ($symbol) {
                $query->where('symbol', $symbol);
            })
            ->first();

        return $watchlist ? $watchlist->average_cost : 0;
    }

    private function calculateNewAllocation(int $userId, array $transactions): array
    {
        $holdings = $this->getUserHoldings($userId);

        // Apply transactions to calculate new allocation
        foreach ($transactions as $transaction) {
            // Update holdings based on transactions
            // This would modify the portfolio state
        }

        return $holdings; // Placeholder
    }

    private function calculateTotalPortfolioValue(array $holdings): float
    {
        return array_sum(array_map(function ($holding) {
            return $holding['current_price'] * $holding['holdings_amount'];
        }, $holdings));
    }

    private function calculateCurrentAllocation(array $holdings, float $totalValue): array
    {
        $allocation = [];

        foreach ($holdings as $holding) {
            $value = $holding['current_price'] * $holding['holdings_amount'];
            $allocation[$holding['symbol']] = ($value / $totalValue) * 100;
        }

        return $allocation;
    }

    private function calculateRebalancingCosts(array $trades): array
    {
        $totalCosts = 0;
        $breakdown = [];

        foreach ($trades as $trade) {
            $tradingFee = $trade['value'] * 0.001; // 0.1% trading fee
            $totalCosts += $tradingFee;
            $breakdown[] = [
                'symbol' => $trade['symbol'],
                'action' => $trade['action'],
                'trading_fee' => $tradingFee
            ];
        }

        return [
            'total_costs' => $totalCosts,
            'breakdown' => $breakdown
        ];
    }

    private function calculateTaxImplications(int $userId, array $trades): array
    {
        // Calculate tax implications of rebalancing trades
        return [
            'realized_gains' => 0,
            'realized_losses' => 0,
            'tax_liability' => 0
        ]; // Placeholder
    }

    private function calculateOverallDeviation(array $current, array $target): float
    {
        $totalDeviation = 0;

        foreach ($target as $targetItem) {
            $symbol = $targetItem['symbol'];
            $targetPercentage = $targetItem['percentage'];
            $currentPercentage = $current[$symbol] ?? 0;
            $totalDeviation += abs($targetPercentage - $currentPercentage);
        }

        return $totalDeviation / count($target);
    }

    // Placeholder methods for full analysis
    private function calculatePerformanceMetrics(array $holdings): array
    {
        return [
            'total_return' => 12.5,
            'ytd_return' => 8.3,
            'daily_return' => 0.2
        ];
    }

    private function calculateRiskMetrics(array $holdings): array
    {
        return [
            'portfolio_beta' => 1.2,
            'max_drawdown' => -15.2,
            'risk_score' => 7.5
        ];
    }

    private function analyzeDiversification(array $holdings): array
    {
        return [
            'diversification_score' => 0.7,
            'concentration_risk' => 0.3,
            'recommended_additions' => []
        ];
    }

    private function calculateCorrelationMatrix(array $holdings): array
    {
        return []; // Placeholder for correlation matrix
    }

    private function calculateValueAtRisk(array $holdings): array
    {
        return [
            'var_1d' => -2.5,
            'var_7d' => -8.2,
            'confidence_level' => 95
        ];
    }

    private function calculateSharpeRatio(array $holdings): float
    {
        return 1.2; // Placeholder
    }

    private function calculatePortfolioVolatility(array $holdings): float
    {
        return 0.25; // Placeholder
    }

    private function analyzeTrends(array $holdings): array
    {
        return [
            'trend_direction' => 'bullish',
            'momentum_score' => 0.6
        ];
    }

    private function analyzeSectorAllocation(array $holdings): array
    {
        return [
            'DeFi' => 30,
            'Layer1' => 25,
            'Gaming' => 15,
            'NFT' => 10,
            'Others' => 20
        ];
    }

    private function generateAnalysisRecommendations(array $holdings): array
    {
        return [
            'top_recommendation' => 'Consider reducing concentration in top 3 holdings',
            'risk_recommendations' => ['Add defensive assets', 'Set stop losses'],
            'growth_recommendations' => ['Consider DCA strategy', 'Explore new sectors']
        ];
    }

    private function compareToBenchmark(array $holdings): array
    {
        return [
            'vs_btc' => 5.2,
            'vs_eth' => 2.8,
            'vs_total_market' => 3.1
        ];
    }

    private function analyzeLiquidity(array $holdings): array
    {
        return [
            'liquidity_score' => 0.8,
            'low_liquidity_holdings' => []
        ];
    }

    private function generateDiversificationRecommendations(array $holdings, array $analysis): array
    {
        return [
            'add_sectors' => ['Infrastructure', 'Privacy'],
            'reduce_concentration' => ['Reduce BTC allocation by 5%']
        ];
    }

    private function generateCostReductionRecommendations(array $holdings): array
    {
        return [
            'lower_fee_exchanges' => [],
            'batch_transactions' => []
        ];
    }

    private function generatePerformanceRecommendations(array $holdings, array $analysis): array
    {
        return [
            'underperformers' => [],
            'reallocation_suggestions' => []
        ];
    }

    private function generateRiskManagementRecommendations(array $holdings, array $analysis): array
    {
        return [
            'stop_loss_suggestions' => [],
            'hedge_recommendations' => []
        ];
    }

    private function generateTaxEfficiencyRecommendations(int $userId): array
    {
        return $this->generateTaxOptimizations($userId);
    }

    private function prioritizeRecommendations(array $holdings, array $analysis): array
    {
        return [
            [
                'priority' => 'high',
                'action' => 'Reduce portfolio concentration',
                'impact' => 'Risk reduction',
                'effort' => 'medium'
            ]
        ];
    }

    private function generateLongTermStrategy(array $holdings, array $analysis): array
    {
        return [
            'time_horizon' => '3-5 years',
            'strategy' => 'Growth with risk management',
            'milestones' => []
        ];
    }
}
