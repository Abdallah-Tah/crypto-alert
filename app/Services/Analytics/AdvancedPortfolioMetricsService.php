<?php

namespace App\Services\Analytics;

use App\Models\Watchlist;
use App\Services\CCXTService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdvancedPortfolioMetricsService
{
    protected $ccxtService;
    protected $portfolioAnalyticsService;

    public function __construct(CCXTService $ccxtService, PortfolioAnalyticsService $portfolioAnalyticsService)
    {
        $this->ccxtService = $ccxtService;
        $this->portfolioAnalyticsService = $portfolioAnalyticsService;
    }

    /**
     * Calculate comprehensive portfolio metrics
     */
    public function calculateAdvancedMetrics($userId)
    {
        try {
            $cacheKey = "advanced_portfolio_metrics_{$userId}";

            return Cache::remember($cacheKey, 600, function () use ($userId) { // Cache for 10 minutes
                $holdings = Watchlist::where('user_id', $userId)->get();

                if ($holdings->isEmpty()) {
                    return $this->getDefaultMetrics();
                }

                // Get current portfolio data
                $portfolioData = $this->getPortfolioData($holdings);
                $historicalData = $this->getHistoricalPriceData($holdings);

                return [
                    'sharpe_ratio' => $this->calculateSharpeRatio($portfolioData, $historicalData),
                    'beta_coefficient' => $this->calculateBetaCoefficient($portfolioData, $historicalData),
                    'volatility' => $this->calculateVolatility($historicalData),
                    'max_drawdown' => $this->calculateMaxDrawdown($historicalData),
                    'sortino_ratio' => $this->calculateSortinoRatio($portfolioData, $historicalData),
                    'value_at_risk' => $this->calculateValueAtRisk($historicalData),
                    'diversification_ratio' => $this->calculateDiversificationRatio($portfolioData),
                    'concentration_index' => $this->calculateConcentrationIndex($portfolioData),
                    'risk_metrics' => $this->calculateRiskDistribution($portfolioData),
                    'performance_attribution' => $this->calculatePerformanceAttribution($portfolioData),
                ];
            });
        } catch (\Exception $e) {
            Log::error('Failed to calculate advanced portfolio metrics', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return $this->getDefaultMetrics();
        }
    }

    /**
     * Calculate Sharpe Ratio
     */
    protected function calculateSharpeRatio($portfolioData, $historicalData)
    {
        try {
            // Risk-free rate (approximate 5% annually)
            $riskFreeRate = 0.05;

            // Calculate portfolio returns
            $returns = $this->calculatePortfolioReturns($historicalData);

            if (empty($returns) || count($returns) < 2) {
                return 0.0;
            }

            $meanReturn = array_sum($returns) / count($returns);
            $annualizedReturn = $meanReturn * 365; // Daily to annual

            $volatility = $this->calculateVolatilityFromReturns($returns);

            if ($volatility == 0) {
                return 0.0;
            }

            $sharpeRatio = ($annualizedReturn - $riskFreeRate) / ($volatility / 100);

            return round($sharpeRatio, 2);
        } catch (\Exception $e) {
            Log::warning('Sharpe ratio calculation failed', ['error' => $e->getMessage()]);
            return 0.0;
        }
    }

    /**
     * Calculate Beta Coefficient (vs BTC as market proxy)
     */
    protected function calculateBetaCoefficient($portfolioData, $historicalData)
    {
        try {
            // Get BTC historical data as market benchmark
            $btcData = $this->getBitcoinHistoricalData();
            $portfolioReturns = $this->calculatePortfolioReturns($historicalData);
            $btcReturns = $this->calculateAssetReturns($btcData);

            if (empty($portfolioReturns) || empty($btcReturns)) {
                return 1.0;
            }

            // Align data lengths
            $minLength = min(count($portfolioReturns), count($btcReturns));
            $portfolioReturns = array_slice($portfolioReturns, -$minLength);
            $btcReturns = array_slice($btcReturns, -$minLength);

            if ($minLength < 2) {
                return 1.0;
            }

            // Calculate covariance and variance
            $covariance = $this->calculateCovariance($portfolioReturns, $btcReturns);
            $btcVariance = $this->calculateVariance($btcReturns);

            if ($btcVariance == 0) {
                return 1.0;
            }

            $beta = $covariance / $btcVariance;

            return round($beta, 2);
        } catch (\Exception $e) {
            Log::warning('Beta calculation failed', ['error' => $e->getMessage()]);
            return 1.0;
        }
    }

    /**
     * Calculate portfolio volatility (annualized)
     */
    protected function calculateVolatility($historicalData)
    {
        try {
            $returns = $this->calculatePortfolioReturns($historicalData);

            if (empty($returns) || count($returns) < 2) {
                return 25.0; // Default moderate volatility
            }

            $volatility = $this->calculateVolatilityFromReturns($returns);

            return round($volatility, 1);
        } catch (\Exception $e) {
            Log::warning('Volatility calculation failed', ['error' => $e->getMessage()]);
            return 25.0;
        }
    }

    /**
     * Calculate Maximum Drawdown
     */
    protected function calculateMaxDrawdown($historicalData)
    {
        try {
            $portfolioValues = $this->getPortfolioValueHistory($historicalData);

            if (empty($portfolioValues) || count($portfolioValues) < 2) {
                return 15.0; // Default drawdown
            }

            $peak = $portfolioValues[0];
            $maxDrawdown = 0;

            foreach ($portfolioValues as $value) {
                if ($value > $peak) {
                    $peak = $value;
                }

                $drawdown = (($peak - $value) / $peak) * 100;
                $maxDrawdown = max($maxDrawdown, $drawdown);
            }

            return round($maxDrawdown, 1);
        } catch (\Exception $e) {
            Log::warning('Max drawdown calculation failed', ['error' => $e->getMessage()]);
            return 15.0;
        }
    }

    /**
     * Calculate Sortino Ratio
     */
    protected function calculateSortinoRatio($portfolioData, $historicalData)
    {
        try {
            $returns = $this->calculatePortfolioReturns($historicalData);

            if (empty($returns)) {
                return 0.0;
            }

            $meanReturn = array_sum($returns) / count($returns);
            $annualizedReturn = $meanReturn * 365;

            // Calculate downside deviation (only negative returns)
            $negativeReturns = array_filter($returns, fn($r) => $r < 0);

            if (empty($negativeReturns)) {
                return 2.0; // High Sortino if no negative returns
            }

            $downsideVariance = array_sum(array_map(fn($r) => $r * $r, $negativeReturns)) / count($negativeReturns);
            $downsideDeviation = sqrt($downsideVariance) * sqrt(365); // Annualized

            if ($downsideDeviation == 0) {
                return 2.0;
            }

            $riskFreeRate = 0.05; // 5% annual
            $sortinoRatio = ($annualizedReturn - $riskFreeRate) / $downsideDeviation;

            return round($sortinoRatio, 2);
        } catch (\Exception $e) {
            Log::warning('Sortino ratio calculation failed', ['error' => $e->getMessage()]);
            return 0.0;
        }
    }

    /**
     * Calculate Value at Risk (5% confidence level)
     */
    protected function calculateValueAtRisk($historicalData)
    {
        try {
            $returns = $this->calculatePortfolioReturns($historicalData);

            if (empty($returns) || count($returns) < 10) {
                return 8.0; // Default VaR
            }

            // Sort returns in ascending order
            sort($returns);

            // 5% VaR is the 5th percentile
            $varIndex = max(0, floor(count($returns) * 0.05));
            $var5 = abs($returns[$varIndex]) * 100; // Convert to percentage

            return round($var5, 1);
        } catch (\Exception $e) {
            Log::warning('VaR calculation failed', ['error' => $e->getMessage()]);
            return 8.0;
        }
    }

    /**
     * Calculate diversification ratio
     */
    protected function calculateDiversificationRatio($portfolioData)
    {
        try {
            if (empty($portfolioData) || count($portfolioData) < 2) {
                return 0.3;
            }

            $totalValue = array_sum(array_column($portfolioData, 'total_value'));

            if ($totalValue == 0) {
                return 0.3;
            }

            // Calculate Herfindahl-Hirschman Index
            $hhi = 0;
            foreach ($portfolioData as $holding) {
                $weight = $holding['total_value'] / $totalValue;
                $hhi += $weight * $weight;
            }

            // Convert HHI to diversification ratio (1 - HHI for equal weights)
            $diversificationRatio = 1 - $hhi;

            return round($diversificationRatio, 2);
        } catch (\Exception $e) {
            Log::warning('Diversification ratio calculation failed', ['error' => $e->getMessage()]);
            return 0.5;
        }
    }

    /**
     * Calculate concentration index (HHI)
     */
    protected function calculateConcentrationIndex($portfolioData)
    {
        try {
            if (empty($portfolioData)) {
                return 100.0;
            }

            $totalValue = array_sum(array_column($portfolioData, 'total_value'));

            if ($totalValue == 0) {
                return 100.0;
            }

            $hhi = 0;
            foreach ($portfolioData as $holding) {
                $weight = ($holding['total_value'] / $totalValue) * 100;
                $hhi += $weight * $weight;
            }

            return round($hhi, 1);
        } catch (\Exception $e) {
            Log::warning('Concentration index calculation failed', ['error' => $e->getMessage()]);
            return 50.0;
        }
    }

    /**
     * Calculate risk distribution
     */
    protected function calculateRiskDistribution($portfolioData)
    {
        try {
            if (empty($portfolioData)) {
                return ['low' => 0, 'medium' => 0, 'high' => 100];
            }

            $totalValue = array_sum(array_column($portfolioData, 'total_value'));

            if ($totalValue == 0) {
                return ['low' => 0, 'medium' => 0, 'high' => 100];
            }

            $lowRisk = 0;
            $mediumRisk = 0;
            $highRisk = 0;

            // Risk categorization
            $stableCoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD'];
            $majorCoins = ['BTC', 'ETH'];

            foreach ($portfolioData as $holding) {
                $weight = $holding['total_value'];
                $symbol = strtoupper($holding['symbol']);

                if (in_array($symbol, $stableCoins)) {
                    $lowRisk += $weight;
                } elseif (in_array($symbol, $majorCoins)) {
                    $mediumRisk += $weight;
                } else {
                    $highRisk += $weight;
                }
            }

            return [
                'low' => round(($lowRisk / $totalValue) * 100, 1),
                'medium' => round(($mediumRisk / $totalValue) * 100, 1),
                'high' => round(($highRisk / $totalValue) * 100, 1),
            ];
        } catch (\Exception $e) {
            Log::warning('Risk distribution calculation failed', ['error' => $e->getMessage()]);
            return ['low' => 20, 'medium' => 50, 'high' => 30];
        }
    }

    /**
     * Calculate performance attribution
     */
    protected function calculatePerformanceAttribution($portfolioData)
    {
        try {
            // Simplified performance attribution
            $attribution = [];
            $totalValue = array_sum(array_column($portfolioData, 'total_value'));

            foreach ($portfolioData as $holding) {
                $weight = $totalValue > 0 ? ($holding['total_value'] / $totalValue) * 100 : 0;
                $contribution = $weight * ($holding['price_change_24h'] ?? 0) / 100;

                $attribution[] = [
                    'symbol' => $holding['symbol'],
                    'weight' => round($weight, 1),
                    'return' => round($holding['price_change_24h'] ?? 0, 2),
                    'contribution' => round($contribution, 2),
                ];
            }

            // Sort by contribution
            usort($attribution, fn($a, $b) => $b['contribution'] <=> $a['contribution']);

            return array_slice($attribution, 0, 5); // Top 5 contributors
        } catch (\Exception $e) {
            Log::warning('Performance attribution calculation failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    // Helper methods

    protected function getPortfolioData($holdings)
    {
        $portfolioData = [];

        foreach ($holdings as $holding) {
            $currentPrice = $this->ccxtService->getCurrentPrice($holding->symbol);
            $totalValue = $currentPrice * $holding->quantity;

            // Get 24h price change
            $priceChange24h = $this->ccxtService->getPriceChange24h($holding->symbol);

            $portfolioData[] = [
                'symbol' => $holding->symbol,
                'quantity' => $holding->quantity,
                'current_price' => $currentPrice,
                'total_value' => $totalValue,
                'price_change_24h' => $priceChange24h,
            ];
        }

        return $portfolioData;
    }

    protected function getHistoricalPriceData($holdings)
    {
        // Simplified - in production, fetch actual historical data
        $historicalData = [];

        foreach ($holdings as $holding) {
            // Mock historical data - replace with actual API calls
            $historicalData[$holding->symbol] = $this->generateMockHistoricalData();
        }

        return $historicalData;
    }

    protected function generateMockHistoricalData()
    {
        $data = [];
        $basePrice = 100;

        for ($i = 30; $i >= 0; $i--) {
            $change = (rand(-500, 500) / 100); // -5% to +5%
            $basePrice *= (1 + $change / 100);
            $data[] = $basePrice;
        }

        return $data;
    }

    protected function getBitcoinHistoricalData()
    {
        // Mock BTC data - replace with actual API call
        return $this->generateMockHistoricalData();
    }

    protected function calculatePortfolioReturns($historicalData)
    {
        if (empty($historicalData)) {
            return [];
        }

        // Calculate portfolio value for each day
        $portfolioValues = $this->getPortfolioValueHistory($historicalData);

        return $this->calculateAssetReturns($portfolioValues);
    }

    protected function getPortfolioValueHistory($historicalData)
    {
        if (empty($historicalData)) {
            return [];
        }

        $firstAsset = array_values($historicalData)[0];
        $days = count($firstAsset);
        $portfolioValues = [];

        for ($i = 0; $i < $days; $i++) {
            $totalValue = 0;
            foreach ($historicalData as $symbol => $prices) {
                if (isset($prices[$i])) {
                    $totalValue += $prices[$i]; // Simplified - should use actual quantities
                }
            }
            $portfolioValues[] = $totalValue;
        }

        return $portfolioValues;
    }

    protected function calculateAssetReturns($prices)
    {
        if (count($prices) < 2) {
            return [];
        }

        $returns = [];
        for ($i = 1; $i < count($prices); $i++) {
            if ($prices[$i - 1] != 0) {
                $return = ($prices[$i] - $prices[$i - 1]) / $prices[$i - 1];
                $returns[] = $return;
            }
        }

        return $returns;
    }

    protected function calculateVolatilityFromReturns($returns)
    {
        if (count($returns) < 2) {
            return 0;
        }

        $mean = array_sum($returns) / count($returns);
        $variance = array_sum(array_map(fn($r) => pow($r - $mean, 2), $returns)) / count($returns);
        $volatility = sqrt($variance) * sqrt(365) * 100; // Annualized percentage

        return $volatility;
    }

    protected function calculateCovariance($returns1, $returns2)
    {
        if (count($returns1) !== count($returns2) || count($returns1) < 2) {
            return 0;
        }

        $mean1 = array_sum($returns1) / count($returns1);
        $mean2 = array_sum($returns2) / count($returns2);

        $covariance = 0;
        for ($i = 0; $i < count($returns1); $i++) {
            $covariance += ($returns1[$i] - $mean1) * ($returns2[$i] - $mean2);
        }

        return $covariance / count($returns1);
    }

    protected function calculateVariance($returns)
    {
        if (count($returns) < 2) {
            return 0;
        }

        $mean = array_sum($returns) / count($returns);
        $variance = array_sum(array_map(fn($r) => pow($r - $mean, 2), $returns)) / count($returns);

        return $variance;
    }

    protected function getDefaultMetrics()
    {
        return [
            'sharpe_ratio' => 0.0,
            'beta_coefficient' => 1.0,
            'volatility' => 25.0,
            'max_drawdown' => 15.0,
            'sortino_ratio' => 0.0,
            'value_at_risk' => 8.0,
            'diversification_ratio' => 0.5,
            'concentration_index' => 50.0,
            'risk_metrics' => ['low' => 20, 'medium' => 50, 'high' => 30],
            'performance_attribution' => [],
        ];
    }
}
