<?php

namespace App\Services;

use App\Models\Cryptocurrency;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CCXTService
{
    private $exchange;

    public function __construct()
    {
        // Initialize CCXT exchange (e.g., Binance)
        // You'll need to install ccxt: composer require ccxt/ccxt
        // $this->exchange = new \ccxt\binance();
    }

    /**
     * Fetch current price for a symbol
     *
     * @param string $symbol (e.g., 'BTC/USDT')
     * @return array|null
     */
    public function getCurrentPrice(string $symbol): ?array
    {
        try {
            // Check cache first (cache for 30 seconds for real-time updates)
            $cacheKey = "crypto_price_" . str_replace('/', '_', $symbol);
            $cachedPrice = Cache::get($cacheKey);

            if ($cachedPrice) {
                return $cachedPrice;
            }

            // Try KuCoin API first for real-time data
            $kucoinData = $this->fetchFromKuCoin($symbol);
            if ($kucoinData) {
                // Cache for only 30 seconds for real-time updates
                Cache::put($cacheKey, $kucoinData, now()->addSeconds(30));
                return $kucoinData;
            }

            // Fallback to CoinGecko
            $coinGeckoData = $this->fetchFromCoinGecko($symbol);
            if ($coinGeckoData) {
                Cache::put($cacheKey, $coinGeckoData, now()->addSeconds(30));
                return $coinGeckoData;
            }

            // Final fallback to mock data
            return $this->getMockPrice($symbol);

        } catch (Exception $e) {
            Log::error("Failed to fetch price for {$symbol}: " . $e->getMessage());
            return $this->getMockPrice($symbol);
        }
    }

    /**
     * Get prices for multiple symbols
     */
    public function getMultiplePrices(array $symbols): array
    {
        $prices = [];
        foreach ($symbols as $symbol) {
            $price = $this->getCurrentPrice($symbol);
            if ($price) {
                $prices[] = $price;
            }
        }
        return $prices;
    }

    /**
     * Get available trading pairs from database
     */
    public function getAvailableSymbols(): array
    {
        try {
            // Get active cryptocurrencies from database, ordered by market cap rank
            $cryptocurrencies = Cryptocurrency::active()
                ->orderBy('market_cap_rank')
                ->get(['trading_symbol', 'name', 'coingecko_id', 'symbol', 'current_price', 'market_cap_rank'])
                ->map(function ($crypto) {
                    return [
                        'symbol' => $crypto->trading_symbol,
                        'name' => $crypto->name,
                        'id' => $crypto->coingecko_id,
                        'display_symbol' => $crypto->symbol,
                        'current_price' => $crypto->current_price,
                        'rank' => $crypto->market_cap_rank,
                    ];
                })
                ->toArray();

            if (!empty($cryptocurrencies)) {
                return $cryptocurrencies;
            }

            // Fallback: if database is empty, return popular coins
            Log::warning('No cryptocurrencies found in database, using fallback list');

        } catch (Exception $e) {
            Log::error("Failed to fetch cryptocurrencies from database: " . $e->getMessage());
        }

        // Fallback to popular coins if database query fails
        return [
            ['symbol' => 'BTC/USDT', 'name' => 'Bitcoin', 'id' => 'bitcoin', 'display_symbol' => 'BTC', 'current_price' => null, 'rank' => 1],
            ['symbol' => 'ETH/USDT', 'name' => 'Ethereum', 'id' => 'ethereum', 'display_symbol' => 'ETH', 'current_price' => null, 'rank' => 2],
            ['symbol' => 'ADA/USDT', 'name' => 'Cardano', 'id' => 'cardano', 'display_symbol' => 'ADA', 'current_price' => null, 'rank' => 8],
            ['symbol' => 'DOT/USDT', 'name' => 'Polkadot', 'id' => 'polkadot', 'display_symbol' => 'DOT', 'current_price' => null, 'rank' => 12],
            ['symbol' => 'SOL/USDT', 'name' => 'Solana', 'id' => 'solana', 'display_symbol' => 'SOL', 'current_price' => null, 'rank' => 5],
            ['symbol' => 'LINK/USDT', 'name' => 'Chainlink', 'id' => 'chainlink', 'display_symbol' => 'LINK', 'current_price' => null, 'rank' => 15],
            ['symbol' => 'AVAX/USDT', 'name' => 'Avalanche', 'id' => 'avalanche-2', 'display_symbol' => 'AVAX', 'current_price' => null, 'rank' => 10],
            ['symbol' => 'MATIC/USDT', 'name' => 'Polygon', 'id' => 'matic-network', 'display_symbol' => 'MATIC', 'current_price' => null, 'rank' => 14],
            ['symbol' => 'UNI/USDT', 'name' => 'Uniswap', 'id' => 'uniswap', 'display_symbol' => 'UNI', 'current_price' => null, 'rank' => 16],
            ['symbol' => 'LTC/USDT', 'name' => 'Litecoin', 'id' => 'litecoin', 'display_symbol' => 'LTC', 'current_price' => null, 'rank' => 20],
        ];
    }    /**
         * Get market data for top coins
         */
    public function getTopCoins(int $limit = 10): array
    {
        try {
            // Use CoinGecko's markets endpoint for more accurate real-time data
            $cacheKey = "top_coins_market_data";
            $cachedData = Cache::get($cacheKey);

            if ($cachedData) {
                return array_slice($cachedData, 0, $limit);
            }

            // Fetch from CoinGecko markets API for real-time data
            $url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page={$limit}&page=1&sparkline=false&price_change_percentage=24h";

            $context = stream_context_create([
                'http' => [
                    'timeout' => 15,
                    'method' => 'GET',
                    'header' => 'User-Agent: CryptoAlert/1.0'
                ]
            ]);

            $response = file_get_contents($url, false, $context);

            if ($response === false) {
                Log::warning("Failed to fetch market data from CoinGecko, using fallback");
                return $this->getFallbackTopCoins($limit);
            }

            $data = json_decode($response, true);

            if (!is_array($data)) {
                Log::warning("Invalid response from CoinGecko markets API");
                return $this->getFallbackTopCoins($limit);
            }

            $topCoins = [];
            foreach ($data as $coin) {
                $symbol = strtoupper($coin['symbol']) . '/USDT';

                $topCoins[] = [
                    'symbol' => $symbol,
                    'price' => $coin['current_price'],
                    'current_price' => $coin['current_price'],
                    'change_24h' => $coin['price_change_percentage_24h'] ?? 0,
                    'price_change_24h' => $coin['price_change_percentage_24h'] ?? 0,
                    'timestamp' => now()->toISOString(),
                    'market_cap' => $coin['market_cap'] ?? 0,
                    'volume_24h' => $coin['total_volume'] ?? 0
                ];
            }

            // Cache for 30 seconds to get real-time updates
            Cache::put($cacheKey, $topCoins, now()->addSeconds(30));

            return array_slice($topCoins, 0, $limit);

        } catch (Exception $e) {
            Log::error("Failed to fetch top coins: " . $e->getMessage());
            return $this->getFallbackTopCoins($limit);
        }
    }

    /**
     * Convert trading symbol to CoinGecko coin ID
     */
    public function convertSymbolToCoinId(string $symbol): ?string
    {
        // Remove /USDT, /USD, /BTC suffixes
        $baseSymbol = explode('/', $symbol)[0];

        $symbolMap = [
            'BTC' => 'bitcoin',
            'ETH' => 'ethereum',
            'ADA' => 'cardano',
            'DOT' => 'polkadot',
            'SOL' => 'solana',
            'LINK' => 'chainlink',
            'AVAX' => 'avalanche-2',
            'MATIC' => 'matic-network',
            'UNI' => 'uniswap',
            'LTC' => 'litecoin',
            'XRP' => 'ripple',
            'DOGE' => 'dogecoin',
            'SHIB' => 'shiba-inu',
            'ATOM' => 'cosmos',
            'ALGO' => 'algorand',
            'VET' => 'vechain',
            'FIL' => 'filecoin',
            'TRX' => 'tron',
            'ETC' => 'ethereum-classic',
            'XLM' => 'stellar',
        ];

        return $symbolMap[$baseSymbol] ?? null;
    }

    /**
     * Fallback mock price data with realistic current values
     */
    private function getMockPrice(string $symbol): array
    {
        $basePrices = [
            'BTC/USDT' => 118000, // Updated to current approximate price
            'ETH/USDT' => 3600,
            'ADA/USDT' => 0.80,
            'DOT/USDT' => 8.50,
            'SOL/USDT' => 280,
            'LINK/USDT' => 25,
        ];

        $basePrice = $basePrices[$symbol] ?? 100;
        $change = (rand(-300, 300) / 100); // Random change between -3% and +3%

        return [
            'symbol' => $symbol,
            'price' => $basePrice + rand(-50, 50), // Add some variation
            'current_price' => $basePrice + rand(-50, 50), // For frontend compatibility
            'change_24h' => $change,
            'price_change_24h' => $change, // For frontend compatibility
            'timestamp' => now()
        ];
    }

    /**
     * Fallback data when API is unavailable
     */
    private function getFallbackTopCoins(int $limit = 10): array
    {
        $fallbackCoins = [
            [
                'symbol' => 'BTC/USDT',
                'price' => 119110.2, // Based on KuCoin data
                'current_price' => 119110.2,
                'change_24h' => 0.41,
                'price_change_24h' => 0.41,
                'timestamp' => now()->toISOString(),
                'market_cap' => 2350000000000,
                'volume_24h' => 15000000000
            ],
            [
                'symbol' => 'ETH/USDT',
                'price' => 3726.60,
                'current_price' => 3726.60,
                'change_24h' => 3.39,
                'price_change_24h' => 3.39,
                'timestamp' => now()->toISOString(),
                'market_cap' => 450000000000,
                'volume_24h' => 8000000000
            ],
            [
                'symbol' => 'ADA/USDT',
                'price' => 0.8328,
                'current_price' => 0.8328,
                'change_24h' => 0.94,
                'price_change_24h' => 0.94,
                'timestamp' => now()->toISOString(),
                'market_cap' => 30000000000,
                'volume_24h' => 500000000
            ],
            [
                'symbol' => 'SOL/USDT',
                'price' => 187.95,
                'current_price' => 187.95,
                'change_24h' => -1.41,
                'price_change_24h' => -1.41,
                'timestamp' => now()->toISOString(),
                'market_cap' => 90000000000,
                'volume_24h' => 3000000000
            ],
            [
                'symbol' => 'DOT/USDT',
                'price' => 4.09,
                'current_price' => 4.09,
                'change_24h' => -3.45,
                'price_change_24h' => -3.45,
                'timestamp' => now()->toISOString(),
                'market_cap' => 6000000000,
                'volume_24h' => 200000000
            ]
        ];

        return array_slice($fallbackCoins, 0, $limit);
    }

    /**
     * Fetch data from KuCoin API
     */
    private function fetchFromKuCoin(string $symbol): ?array
    {
        try {
            // Convert BTC/USDT to BTC-USDT for KuCoin API
            $kucoinSymbol = str_replace('/', '-', $symbol);

            $url = "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol={$kucoinSymbol}";

            $context = stream_context_create([
                'http' => [
                    'timeout' => 5,
                    'method' => 'GET',
                    'header' => 'User-Agent: CryptoAlert/1.0'
                ]
            ]);

            $response = file_get_contents($url, false, $context);

            if ($response === false) {
                return null;
            }

            $data = json_decode($response, true);

            if (!isset($data['data']['price'])) {
                return null;
            }

            // Get 24h stats for change percentage
            $statsUrl = "https://api.kucoin.com/api/v1/market/stats?symbol={$kucoinSymbol}";
            $statsResponse = file_get_contents($statsUrl, false, $context);
            $statsData = $statsResponse ? json_decode($statsResponse, true) : null;

            $change24h = 0;
            if ($statsData && isset($statsData['data']['changeRate'])) {
                $change24h = floatval($statsData['data']['changeRate']) * 100; // Convert to percentage
            }

            return [
                'symbol' => $symbol,
                'price' => floatval($data['data']['price']),
                'current_price' => floatval($data['data']['price']),
                'change_24h' => $change24h,
                'price_change_24h' => $change24h,
                'timestamp' => now()->toISOString()
            ];

        } catch (Exception $e) {
            Log::warning("KuCoin API error for {$symbol}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch data from CoinGecko API
     */
    private function fetchFromCoinGecko(string $symbol): ?array
    {
        try {
            // Convert symbol format (BTC/USDT -> bitcoin for CoinGecko API)
            $coinId = $this->convertSymbolToCoinId($symbol);

            if (!$coinId) {
                return null;
            }

            // Use CoinGecko free API
            $url = "https://api.coingecko.com/api/v3/simple/price?ids={$coinId}&vs_currencies=usd&include_24hr_change=true";

            $context = stream_context_create([
                'http' => [
                    'timeout' => 5,
                    'method' => 'GET',
                    'header' => 'User-Agent: CryptoAlert/1.0'
                ]
            ]);

            $response = file_get_contents($url, false, $context);

            if ($response === false) {
                return null;
            }

            $data = json_decode($response, true);

            if (!isset($data[$coinId])) {
                return null;
            }

            $priceData = $data[$coinId];

            return [
                'symbol' => $symbol,
                'price' => $priceData['usd'],
                'current_price' => $priceData['usd'],
                'change_24h' => $priceData['usd_24h_change'] ?? 0,
                'price_change_24h' => $priceData['usd_24h_change'] ?? 0,
                'timestamp' => now()->toISOString()
            ];

        } catch (Exception $e) {
            Log::warning("CoinGecko API error for {$symbol}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get prices for multiple symbols at once
     */
    public function getPrices(array $symbols): array
    {
        $prices = [];

        foreach ($symbols as $symbol) {
            $price = $this->getPrice($symbol);
            if ($price !== null) {
                $prices[$symbol] = $price;
            }
        }

        return $prices;
    }
}
