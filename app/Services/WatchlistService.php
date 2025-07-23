<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WatchlistService
{
    private $ccxtService;

    public function __construct(CCXTService $ccxtService)
    {
        $this->ccxtService = $ccxtService;
    }

    /**
     * Add coin to user's watchlist
     *
     * @param User $user
     * @param string $symbol
     * @param float|null $alertPrice
     * @return array|null
     */
    public function addToWatchlist(User $user, string $symbol, ?float $alertPrice = null): ?array
    {
        try {
            // Check if already exists
            $existing = DB::table('watchlists')
                ->where('user_id', $user->getKey())
                ->where('symbol', $symbol)
                ->first();

            if ($existing) {
                return [
                    'success' => false,
                    'message' => 'Coin already in watchlist',
                    'data' => $existing
                ];
            }

            // Validate symbol exists
            $availableSymbols = $this->ccxtService->getAvailableSymbols();
            if (!in_array($symbol, $availableSymbols)) {
                return [
                    'success' => false,
                    'message' => 'Invalid symbol',
                    'data' => null
                ];
            }

            $watchlistId = DB::table('watchlists')->insertGetId([
                'user_id' => $user->getKey(),
                'symbol' => $symbol,
                'alert_price' => $alertPrice,
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $watchlistItem = DB::table('watchlists')->find($watchlistId);

            return [
                'success' => true,
                'message' => 'Added to watchlist successfully',
                'data' => $watchlistItem
            ];

        } catch (Exception $e) {
            Log::error("Failed to add to watchlist: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to add to watchlist',
                'data' => null
            ];
        }
    }

    /**
     * Remove coin from user's watchlist
     *
     * @param User $user
     * @param int $watchlistId
     * @return bool
     */
    public function removeFromWatchlist(User $user, int $watchlistId): bool
    {
        try {
            $deleted = DB::table('watchlists')
                ->where('id', $watchlistId)
                ->where('user_id', $user->getKey())
                ->delete();

            return $deleted > 0;

        } catch (Exception $e) {
            Log::error("Failed to remove from watchlist: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user's watchlist with current prices
     *
     * @param User $user
     * @return array
     */
    public function getUserWatchlist(User $user): array
    {
        try {
            $watchlistItems = DB::table('watchlists')
                ->where('user_id', $user->getKey())
                ->orderBy('created_at', 'desc')
                ->get();

            $watchlistWithPrices = [];

            foreach ($watchlistItems as $item) {
                $currentPrice = $this->ccxtService->getCurrentPrice($item->symbol);

                $watchlistWithPrices[] = [
                    'id' => $item->id,
                    'symbol' => $item->symbol,
                    'alert_price' => $item->alert_price,
                    'enabled' => $item->enabled,
                    'created_at' => $item->created_at,
                    'current_price' => $currentPrice ? $currentPrice['price'] : null,
                    'change_24h' => $currentPrice ? $currentPrice['change_24h'] : null,
                    'price_data' => $currentPrice
                ];
            }

            return $watchlistWithPrices;

        } catch (Exception $e) {
            Log::error("Failed to get user watchlist: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Toggle alert for watchlist item
     *
     * @param User $user
     * @param int $watchlistId
     * @param bool $enabled
     * @return bool
     */
    public function toggleAlert(User $user, int $watchlistId, bool $enabled): bool
    {
        try {
            $updated = DB::table('watchlists')
                ->where('id', $watchlistId)
                ->where('user_id', $user->getKey())
                ->update([
                    'enabled' => $enabled,
                    'updated_at' => now()
                ]);

            return $updated > 0;

        } catch (Exception $e) {
            Log::error("Failed to toggle alert: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update alert price for watchlist item
     *
     * @param User $user
     * @param int $watchlistId
     * @param float|null $alertPrice
     * @return bool
     */
    public function updateAlertPrice(User $user, int $watchlistId, ?float $alertPrice): bool
    {
        try {
            $updated = DB::table('watchlists')
                ->where('id', $watchlistId)
                ->where('user_id', $user->getKey())
                ->update([
                    'alert_price' => $alertPrice,
                    'updated_at' => now()
                ]);

            return $updated > 0;

        } catch (Exception $e) {
            Log::error("Failed to update alert price: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get watchlist summary for dashboard
     *
     * @param User $user
     * @return array
     */
    public function getWatchlistSummary(User $user): array
    {
        try {
            $watchlist = $this->getUserWatchlist($user);

            $summary = [
                'total_coins' => count($watchlist),
                'alerts_active' => 0, // Changed from alerts_enabled for frontend compatibility
                'total_value' => 0,
                'top_gainers' => [],
                'top_losers' => []
            ];

            $gainers = [];
            $losers = [];
            $totalValue = 0;

            foreach ($watchlist as $item) {
                if ($item['enabled']) {
                    $summary['alerts_active']++;
                }

                // Calculate mock portfolio value (assuming 0.1 BTC worth for each coin)
                if ($item['current_price']) {
                    if ($item['symbol'] === 'BTC/USDT') {
                        $totalValue += $item['current_price'] * 0.1; // 0.1 BTC
                    } elseif ($item['symbol'] === 'ETH/USDT') {
                        $totalValue += $item['current_price'] * 3; // 3 ETH
                    } else {
                        // For other coins, assume $1000 worth
                        $totalValue += 1000;
                    }
                }

                if ($item['change_24h'] !== null) {
                    if ($item['change_24h'] > 0) {
                        $gainers[] = $item;
                    } else {
                        $losers[] = $item;
                    }
                }
            }

            $summary['total_value'] = $totalValue;

            // Sort and get top 3
            usort($gainers, fn($a, $b) => $b['change_24h'] <=> $a['change_24h']);
            usort($losers, fn($a, $b) => $a['change_24h'] <=> $b['change_24h']);

            $summary['top_gainers'] = array_slice($gainers, 0, 3);
            $summary['top_losers'] = array_slice($losers, 0, 3);

            return $summary;

        } catch (Exception $e) {
            Log::error("Failed to get watchlist summary: " . $e->getMessage());
            return [
                'total_coins' => 0,
                'alerts_active' => 0,
                'total_value' => 0,
                'top_gainers' => [],
                'top_losers' => []
            ];
        }
    }

    /**
     * Search available coins
     *
     * @param string $query
     * @return array
     */
    public function searchCoins(string $query): array
    {
        try {
            $availableSymbols = $this->ccxtService->getAvailableSymbols();

            $filtered = array_filter($availableSymbols, function ($symbol) use ($query) {
                return stripos($symbol, $query) !== false;
            });

            return array_values($filtered);

        } catch (Exception $e) {
            Log::error("Failed to search coins: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all symbols in user's watchlist
     *
     * @param User $user
     * @return array
     */
    public function getUserSymbols(User $user): array
    {
        try {
            return DB::table('watchlists')
                ->where('user_id', $user->getKey())
                ->pluck('symbol')
                ->toArray();

        } catch (Exception $e) {
            Log::error("Failed to get user symbols: " . $e->getMessage());
            return [];
        }
    }
}
