<?php

namespace App\Services\Analytics;

use App\Models\User;
use App\Services\WatchlistService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PortfolioAnalyticsService
{
    public function __construct(
        private WatchlistService $watchlistService
    ) {
    }

    /**
     * Get portfolio performance data for different timeframes
     */
    public function getPerformanceTimeline(User $user, string $timeframe = '1M'): array
    {
        try {
            $snapshots = $this->getPortfolioSnapshots($user, $timeframe);

            // If no historical data, create current snapshot
            if (empty($snapshots)) {
                $currentSnapshot = $this->createCurrentSnapshot($user);
                return [$currentSnapshot];
            }

            return $snapshots;
        } catch (\Exception $e) {
            Log::error("Failed to get performance timeline: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get portfolio snapshots based on timeframe
     */
    private function getPortfolioSnapshots(User $user, string $timeframe): array
    {
        $endDate = Carbon::now();
        $startDate = $this->getStartDateForTimeframe($timeframe, $endDate);
        $interval = $this->getIntervalForTimeframe($timeframe);

        $snapshots = DB::table('portfolio_snapshots')
            ->where('user_id', $user->id)
            ->where('snapshot_date', '>=', $startDate)
            ->where('snapshot_date', '<=', $endDate)
            ->orderBy('snapshot_date', 'asc')
            ->get();

        $result = [];
        foreach ($snapshots as $snapshot) {
            $result[] = [
                'date' => $snapshot->snapshot_date,
                'portfolioValue' => (float) $snapshot->total_value,
                'change24h' => (float) ($snapshot->metadata['change_24h'] ?? 0),
                'changePercent' => (float) ($snapshot->metadata['change_percent'] ?? 0),
                'btcPrice' => (float) ($snapshot->metadata['btc_price'] ?? 0),
                'ethPrice' => (float) ($snapshot->metadata['eth_price'] ?? 0),
            ];
        }

        return $result;
    }

    /**
     * Create a current portfolio snapshot
     */
    public function createCurrentSnapshot(User $user): array
    {
        $summary = $this->watchlistService->getWatchlistSummary($user);

        return [
            'date' => Carbon::now()->toISOString(),
            'portfolioValue' => (float) ($summary['total_value'] ?? 0),
            'change24h' => 0, // Will be calculated with historical data
            'changePercent' => 0,
            'btcPrice' => $this->getBTCPrice(),
            'ethPrice' => $this->getETHPrice(),
        ];
    }

    /**
     * Store portfolio snapshot for historical tracking
     */
    public function storePortfolioSnapshot(User $user): void
    {
        try {
            $summary = $this->watchlistService->getWatchlistSummary($user);

            // Check if snapshot already exists for today
            $today = Carbon::now()->startOfDay();
            $existingSnapshot = DB::table('portfolio_snapshots')
                ->where('user_id', $user->id)
                ->where('snapshot_date', '>=', $today)
                ->where('snapshot_date', '<', $today->copy()->addDay())
                ->first();

            if ($existingSnapshot) {
                // Update existing snapshot
                DB::table('portfolio_snapshots')
                    ->where('id', $existingSnapshot->id)
                    ->update([
                        'total_value' => $summary['total_value'] ?? 0,
                        'metadata' => json_encode([
                            'total_coins' => $summary['total_coins'] ?? 0,
                            'alerts_active' => $summary['alerts_active'] ?? 0,
                            'change_24h' => 0, // Calculate from previous day
                            'change_percent' => 0,
                            'btc_price' => $this->getBTCPrice(),
                            'eth_price' => $this->getETHPrice(),
                            'updated_at' => Carbon::now()->toISOString(),
                        ]),
                        'updated_at' => Carbon::now(),
                    ]);
            } else {
                // Create new snapshot
                DB::table('portfolio_snapshots')->insert([
                    'user_id' => $user->id,
                    'total_value' => $summary['total_value'] ?? 0,
                    'snapshot_date' => Carbon::now(),
                    'metadata' => json_encode([
                        'total_coins' => $summary['total_coins'] ?? 0,
                        'alerts_active' => $summary['alerts_active'] ?? 0,
                        'change_24h' => 0,
                        'change_percent' => 0,
                        'btc_price' => $this->getBTCPrice(),
                        'eth_price' => $this->getETHPrice(),
                        'created_at' => Carbon::now()->toISOString(),
                    ]),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Failed to store portfolio snapshot: " . $e->getMessage());
        }
    }

    /**
     * Get start date based on timeframe
     */
    private function getStartDateForTimeframe(string $timeframe, Carbon $endDate): Carbon
    {
        return match ($timeframe) {
            '1D' => $endDate->copy()->subDay(),
            '1W' => $endDate->copy()->subWeek(),
            '1M' => $endDate->copy()->subMonth(),
            '3M' => $endDate->copy()->subMonths(3),
            '6M' => $endDate->copy()->subMonths(6),
            '1Y' => $endDate->copy()->subYear(),
            'YTD' => Carbon::create($endDate->year, 1, 1),
            default => $endDate->copy()->subMonth(),
        };
    }

    /**
     * Get appropriate interval for timeframe
     */
    private function getIntervalForTimeframe(string $timeframe): string
    {
        return match ($timeframe) {
            '1D' => '1 hour',
            '1W' => '4 hours',
            '1M' => '1 day',
            '3M' => '3 days',
            '6M' => '1 week',
            '1Y' => '1 week',
            'YTD' => '1 week',
            default => '1 day',
        };
    }

    /**
     * Get current BTC price for comparison
     */
    private function getBTCPrice(): float
    {
        try {
            // Use your existing CCXTService
            $ccxtService = app(\App\Services\CCXTService::class);
            $priceData = $ccxtService->getCurrentPrice('BTC/USDT');
            return (float) ($priceData['current_price'] ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get current ETH price for comparison
     */
    private function getETHPrice(): float
    {
        try {
            $ccxtService = app(\App\Services\CCXTService::class);
            $priceData = $ccxtService->getCurrentPrice('ETH/USDT');
            return (float) ($priceData['current_price'] ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Calculate portfolio performance metrics
     */
    public function getPerformanceMetrics(User $user, string $timeframe = '1M'): array
    {
        $timeline = $this->getPerformanceTimeline($user, $timeframe);

        if (empty($timeline)) {
            return [
                'current_value' => 0,
                'period_return' => 0,
                'period_return_percent' => 0,
                'total_change' => 0,
                'volatility' => 0,
                'max_value' => 0,
                'min_value' => 0,
            ];
        }

        $values = array_column($timeline, 'portfolioValue');
        $currentValue = end($values);
        $initialValue = reset($values);

        $totalChange = $currentValue - $initialValue;
        $periodReturnPercent = $initialValue > 0 ? (($totalChange / $initialValue) * 100) : 0;

        // Calculate volatility (standard deviation)
        $mean = array_sum($values) / count($values);
        $variance = array_sum(array_map(fn($val) => pow($val - $mean, 2), $values)) / count($values);
        $volatility = sqrt($variance);

        return [
            'current_value' => $currentValue,
            'period_return' => $totalChange,
            'period_return_percent' => $periodReturnPercent,
            'total_change' => $totalChange,
            'volatility' => $volatility,
            'max_value' => max($values),
            'min_value' => min($values),
            'data_points' => count($timeline),
        ];
    }
}
