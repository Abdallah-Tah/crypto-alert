<?php

namespace App\Services;

use App\Models\User;
use App\Models\Cryptocurrency;
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
     * @param float|null $holdingsAmount
     * @param string $holdingsType
     * @param float|null $purchasePrice
     * @param string $alertType
     * @param string|null $notes
     * @return array|null
     */
    public function addToWatchlist(
        User $user,
        string $symbol,
        ?float $alertPrice = null,
        ?float $holdingsAmount = null,
        string $holdingsType = 'usd_value',
        ?float $purchasePrice = null,
        string $alertType = 'market_price',
        ?string $notes = null
    ): ?array {
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

            // Validate symbol exists in our cryptocurrency database
            $availableSymbols = $this->ccxtService->getAvailableSymbols();
            $symbolExists = collect($availableSymbols)->pluck('symbol')->contains($symbol);

            if (!$symbolExists) {
                return [
                    'success' => false,
                    'message' => 'Invalid symbol',
                    'data' => null
                ];
            }

            // Calculate initial_investment_usd based on holdings_type
            $initialInvestmentUsd = null;
            if ($holdingsAmount && $holdingsType === 'usd_value') {
                $initialInvestmentUsd = $holdingsAmount;
            } elseif ($holdingsAmount && $purchasePrice && $holdingsType === 'coin_quantity') {
                $initialInvestmentUsd = $holdingsAmount * $purchasePrice;
            }

            $watchlistId = DB::table('watchlists')->insertGetId([
                'user_id' => $user->getKey(),
                'symbol' => $symbol,
                'alert_price' => $alertPrice,
                'holdings_amount' => $holdingsAmount,
                'holdings_type' => $holdingsType,
                'initial_investment_usd' => $initialInvestmentUsd,
                'purchase_price' => $purchasePrice,
                'alert_type' => $alertType,
                'notes' => $notes,
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

                // Calculate current portfolio value for this holding
                $currentValue = 0;
                $quantity = 0;

                if ($currentPrice && $item->holdings_amount && $item->holdings_amount > 0) {
                    if ($item->holdings_type === 'usd_value' && $item->purchase_price && $item->purchase_price > 0) {
                        // Holdings stored as USD value - calculate coin quantity from purchase
                        $quantity = $item->holdings_amount / $item->purchase_price;
                        $currentValue = $currentPrice['current_price'] * $quantity;
                    } elseif ($item->holdings_type === 'coin_quantity') {
                        // Holdings stored as coin quantity
                        $quantity = $item->holdings_amount;
                        $currentValue = $currentPrice['current_price'] * $quantity;
                    } else {
                        // Fallback: treat as USD value
                        $currentValue = $item->holdings_amount;
                        $quantity = $item->holdings_amount / ($currentPrice['current_price'] ?? 1);
                    }
                }

                $watchlistWithPrices[] = [
                    'id' => $item->id,
                    'symbol' => $item->symbol,
                    'name' => $this->getCoinName($item->symbol), // Add coin name
                    'alert_price' => $item->alert_price,
                    'holdings_amount' => $item->holdings_amount,
                    'holdings_type' => $item->holdings_type ?? 'usd_value',
                    'initial_investment_usd' => $item->initial_investment_usd,
                    'purchase_price' => $item->purchase_price,
                    'alert_type' => $item->alert_type,
                    'notes' => $item->notes,
                    'enabled' => $item->enabled,
                    'created_at' => $item->created_at,
                    'current_price' => $currentPrice ? $currentPrice['current_price'] : null,
                    'price_change_24h' => $currentPrice ? $currentPrice['price_change_24h'] : null,
                    'quantity' => $quantity, // For dashboard compatibility
                    'total_value' => $currentValue, // For dashboard compatibility
                    'logo' => $this->getCoinLogo($item->symbol), // Add logo URL
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
     * Update watchlist item with holdings and other details
     *
     * @param User $user
     * @param int $watchlistId
     * @param array $data
     * @return bool
     */
    public function updateWatchlistItem(User $user, int $watchlistId, array $data): bool
    {
        try {
            $updateData = [
                'updated_at' => now()
            ];

            // Only update fields that are provided
            if (isset($data['alert_price'])) {
                $updateData['alert_price'] = $data['alert_price'];
            }
            if (isset($data['holdings_amount'])) {
                $updateData['holdings_amount'] = $data['holdings_amount'];
            }
            if (isset($data['holdings_type'])) {
                $updateData['holdings_type'] = $data['holdings_type'];
            }
            if (isset($data['purchase_price'])) {
                $updateData['purchase_price'] = $data['purchase_price'];
            }
            if (isset($data['alert_type'])) {
                $updateData['alert_type'] = $data['alert_type'];
            }
            if (isset($data['notes'])) {
                $updateData['notes'] = $data['notes'];
            }
            if (isset($data['enabled'])) {
                $updateData['enabled'] = $data['enabled'];
            }

            // Recalculate initial_investment_usd if holdings info changes
            if (isset($data['holdings_amount']) || isset($data['holdings_type']) || isset($data['purchase_price'])) {
                $item = DB::table('watchlists')
                    ->where('id', $watchlistId)
                    ->where('user_id', $user->getKey())
                    ->first();

                if ($item) {
                    $holdingsAmount = $data['holdings_amount'] ?? $item->holdings_amount;
                    $holdingsType = $data['holdings_type'] ?? $item->holdings_type;
                    $purchasePrice = $data['purchase_price'] ?? $item->purchase_price;

                    if ($holdingsAmount && $holdingsType === 'usd_value') {
                        $updateData['initial_investment_usd'] = $holdingsAmount;
                    } elseif ($holdingsAmount && $purchasePrice && $holdingsType === 'coin_quantity') {
                        $updateData['initial_investment_usd'] = $holdingsAmount * $purchasePrice;
                    }
                }
            }

            $updated = DB::table('watchlists')
                ->where('id', $watchlistId)
                ->where('user_id', $user->getKey())
                ->update($updateData);

            return $updated > 0;

        } catch (Exception $e) {
            Log::error("Failed to update watchlist item: " . $e->getMessage());
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
                'top_losers' => [],
                'initial_investment' => 0,
                'total_profit' => 0,
                'profit_percent' => 0,
            ];

            $gainers = [];
            $losers = [];
            $totalValue = 0;
            $initialInvestment = 0;

            foreach ($watchlist as $item) {
                if ($item['enabled']) {
                    $summary['alerts_active']++;
                }

                // Sum initial investment
                if (!empty($item['initial_investment_usd'])) {
                    $initialInvestment += $item['initial_investment_usd'];
                }
                // Calculate portfolio value based on holdings type
                if ($item['current_price'] && $item['holdings_amount'] && $item['holdings_amount'] > 0) {
                    if ($item['holdings_type'] === 'usd_value') {
                        // If holdings are stored as USD value, calculate current value based on price change
                        if ($item['purchase_price'] && $item['purchase_price'] > 0) {
                            // Calculate how many coins the USD amount represents
                            $coinQuantity = $item['holdings_amount'] / $item['purchase_price'];
                            $totalValue += $item['current_price'] * $coinQuantity;
                        } else {
                            // If no purchase price, use the USD value as-is (conservative approach)
                            $totalValue += $item['holdings_amount'];
                        }
                    } else {
                        // Holdings are stored as coin quantity
                        $totalValue += $item['current_price'] * $item['holdings_amount'];
                    }
                }

                if ($item['price_change_24h'] !== null) {
                    if ($item['price_change_24h'] > 0) {
                        $gainers[] = $item;
                    } else {
                        $losers[] = $item;
                    }
                }
            }

            $summary['total_value'] = $totalValue;
            $summary['initial_investment'] = $initialInvestment;
            $summary['total_profit'] = $totalValue - $initialInvestment;
            $summary['profit_percent'] = $initialInvestment > 0 ? (($totalValue - $initialInvestment) / $initialInvestment) * 100 : 0;

            // Sort and get top 3
            usort($gainers, fn($a, $b) => $b['price_change_24h'] <=> $a['price_change_24h']);
            usort($losers, fn($a, $b) => $a['price_change_24h'] <=> $b['price_change_24h']);

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
     * Get coin name from symbol
     */
    private function getCoinName(string $symbol): string
    {
        $coinMap = [
            'BTC' => 'Bitcoin',
            'ETH' => 'Ethereum',
            'DOGE' => 'Dogecoin',
            'ETC' => 'Ethereum Classic',
            'ADA' => 'Cardano',
            'DOT' => 'Polkadot',
            'SOL' => 'Solana',
            'MATIC' => 'Polygon',
            'AVAX' => 'Avalanche',
            'LTC' => 'Litecoin'
        ];

        return $coinMap[$symbol] ?? $symbol;
    }

    /**
     * Get coin logo URL
     */
    private function getCoinLogo(string $symbol): string
    {
        $logoMap = [
            'BTC' => 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
            'ETH' => 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
            'DOGE' => 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
            'ETC' => 'https://cryptologos.cc/logos/ethereum-classic-etc-logo.png',
            'ADA' => 'https://cryptologos.cc/logos/cardano-ada-logo.png',
            'DOT' => 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
            'SOL' => 'https://cryptologos.cc/logos/solana-sol-logo.png',
            'MATIC' => 'https://cryptologos.cc/logos/polygon-matic-logo.png',
            'AVAX' => 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
            'LTC' => 'https://cryptologos.cc/logos/litecoin-ltc-logo.png'
        ];

        return $logoMap[$symbol] ?? '';
    }

    /**
     * Search available coins using database
     *
     * @param string $query
     * @return array
     */
    public function searchCoins(string $query): array
    {
        try {
            $baseQuery = Cryptocurrency::active();

            if (empty($query)) {
                // Return top 100 popular coins when no query, ordered by market cap
                $cryptocurrencies = $baseQuery->topByMarketCap(100)->get();
            } else {
                // Search by name or symbol with full-text search for better performance
                $cryptocurrencies = $baseQuery->search($query)
                    ->orderBy('market_cap_rank')
                    ->limit(50)
                    ->get();
            }

            return $cryptocurrencies->map(function ($crypto) {
                return [
                    'symbol' => $crypto->trading_symbol,
                    'name' => $crypto->name,
                    'id' => $crypto->coingecko_id,
                    'display_symbol' => $crypto->symbol,
                    'current_price' => $crypto->current_price,
                    'formatted_price' => $crypto->formatted_price,
                    'market_cap_rank' => $crypto->market_cap_rank,
                    'price_change_24h' => $crypto->price_change_24h,
                    'image_url' => $crypto->image_url,
                ];
            })->toArray();

        } catch (Exception $e) {
            Log::error("Failed to search coins in database: " . $e->getMessage());

            // Fallback to old method if database search fails
            return $this->searchCoinsLegacy($query);
        }
    }

    /**
     * Legacy search method as fallback
     */
    private function searchCoinsLegacy(string $query): array
    {
        try {
            $availableSymbols = $this->ccxtService->getAvailableSymbols();

            if (empty($query)) {
                return array_slice($availableSymbols, 0, 50);
            }

            $filtered = array_filter($availableSymbols, function ($coin) use ($query) {
                $queryLower = strtolower($query);

                if (is_string($coin)) {
                    return stripos($coin, $queryLower) !== false;
                }

                $symbolMatch = stripos($coin['symbol'], $queryLower) !== false;
                $nameMatch = stripos($coin['name'], $queryLower) !== false;

                return $symbolMatch || $nameMatch;
            });

            return array_values($filtered);

        } catch (Exception $e) {
            Log::error("Failed to search coins with legacy method: " . $e->getMessage());
            return [];
        }
    }    /**
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
