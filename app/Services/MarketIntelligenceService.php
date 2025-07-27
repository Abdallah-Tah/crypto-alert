<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MarketIntelligenceService
{
    /**
     * Get comprehensive market intelligence data
     */
    public function getMarketIntelligence(): array
    {
        try {
            return [
                'fearGreed' => $this->getFearGreedIndex(),
                'globalMarket' => $this->getGlobalMarketData(),
                'topGainers' => $this->getTopGainers(),
                'topLosers' => $this->getTopLosers(),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to fetch market intelligence: ' . $e->getMessage());
            return [
                'fearGreed' => null,
                'globalMarket' => null,
                'topGainers' => [],
                'topLosers' => [],
            ];
        }
    }

    /**
     * Get Fear & Greed Index from API
     */
    public function getFearGreedIndex(): ?array
    {
        $cacheKey = 'fear_greed_index';

        return Cache::remember($cacheKey, now()->addMinutes(30), function () {
            try {
                // Using Alternative.me Fear & Greed Index API (free)
                $response = Http::timeout(10)->get('https://api.alternative.me/fng/?limit=1');

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['data'][0])) {
                        $fearGreed = $data['data'][0];
                        return [
                            'value' => (int) $fearGreed['value'],
                            'value_classification' => $fearGreed['value_classification'],
                            'timestamp' => $fearGreed['timestamp'],
                            'time_until_update' => $fearGreed['time_until_update'] ?? null,
                        ];
                    }
                }

                return null;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch Fear & Greed Index: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Get global market data from CoinGecko
     */
    public function getGlobalMarketData(): ?array
    {
        $cacheKey = 'global_market_data';

        return Cache::remember($cacheKey, now()->addMinutes(15), function () {
            try {
                $response = Http::timeout(10)->get('https://api.coingecko.com/api/v3/global');

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['data'])) {
                        $global = $data['data'];
                        return [
                            'total_market_cap' => $global['total_market_cap']['usd'] ?? 0,
                            'total_volume_24h' => $global['total_volume']['usd'] ?? 0,
                            'market_cap_change_24h' => $global['market_cap_change_percentage_24h_usd'] ?? 0,
                            'active_cryptocurrencies' => $global['active_cryptocurrencies'] ?? 0,
                            'btc_dominance' => $global['market_cap_percentage']['btc'] ?? 0,
                            'eth_dominance' => $global['market_cap_percentage']['eth'] ?? 0,
                            'markets' => $global['markets'] ?? 0,
                            'ongoing_icos' => $global['ongoing_icos'] ?? 0,
                            'ended_icos' => $global['ended_icos'] ?? 0,
                        ];
                    }
                }

                return null;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch global market data: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Get top gainers from CoinGecko
     */
    public function getTopGainers(int $limit = 10): array
    {
        $cacheKey = "top_gainers_{$limit}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($limit) {
            try {
                $response = Http::timeout(15)->get('https://api.coingecko.com/api/v3/coins/markets', [
                    'vs_currency' => 'usd',
                    'order' => 'percent_change_24h_desc',
                    'per_page' => $limit,
                    'page' => 1,
                    'sparkline' => false,
                    'price_change_percentage' => '24h',
                ]);

                if ($response->successful()) {
                    $coins = $response->json();
                    return array_map(function ($coin) {
                        return [
                            'id' => $coin['id'],
                            'symbol' => strtoupper($coin['symbol']),
                            'name' => $coin['name'],
                            'image' => $coin['image'],
                            'current_price' => $coin['current_price'],
                            'price_change_percentage_24h' => $coin['price_change_percentage_24h'],
                            'market_cap' => $coin['market_cap'],
                            'total_volume' => $coin['total_volume'],
                            'market_cap_rank' => $coin['market_cap_rank'],
                        ];
                    }, $coins);
                }

                return [];
            } catch (\Exception $e) {
                Log::warning('Failed to fetch top gainers: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get top losers from CoinGecko
     */
    public function getTopLosers(int $limit = 10): array
    {
        $cacheKey = "top_losers_{$limit}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($limit) {
            try {
                $response = Http::timeout(15)->get('https://api.coingecko.com/api/v3/coins/markets', [
                    'vs_currency' => 'usd',
                    'order' => 'percent_change_24h_asc',
                    'per_page' => $limit,
                    'page' => 1,
                    'sparkline' => false,
                    'price_change_percentage' => '24h',
                ]);

                if ($response->successful()) {
                    $coins = $response->json();
                    return array_map(function ($coin) {
                        return [
                            'id' => $coin['id'],
                            'symbol' => strtoupper($coin['symbol']),
                            'name' => $coin['name'],
                            'image' => $coin['image'],
                            'current_price' => $coin['current_price'],
                            'price_change_percentage_24h' => $coin['price_change_percentage_24h'],
                            'market_cap' => $coin['market_cap'],
                            'total_volume' => $coin['total_volume'],
                            'market_cap_rank' => $coin['market_cap_rank'],
                        ];
                    }, $coins);
                }

                return [];
            } catch (\Exception $e) {
                Log::warning('Failed to fetch top losers: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get market trends and insights
     */
    public function getMarketTrends(): array
    {
        $cacheKey = 'market_trends';

        return Cache::remember($cacheKey, now()->addMinutes(30), function () {
            try {
                // Get trending coins from CoinGecko
                $response = Http::timeout(10)->get('https://api.coingecko.com/api/v3/search/trending');

                if ($response->successful()) {
                    $data = $response->json();
                    $trends = [];

                    if (isset($data['coins'])) {
                        foreach ($data['coins'] as $trendingCoin) {
                            $coin = $trendingCoin['item'];
                            $trends[] = [
                                'id' => $coin['id'],
                                'name' => $coin['name'],
                                'symbol' => strtoupper($coin['symbol']),
                                'market_cap_rank' => $coin['market_cap_rank'],
                                'thumb' => $coin['thumb'],
                                'score' => $coin['score'] ?? 0,
                            ];
                        }
                    }

                    return $trends;
                }

                return [];
            } catch (\Exception $e) {
                Log::warning('Failed to fetch market trends: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get detailed market sentiment analysis
     */
    public function getMarketSentiment(): array
    {
        try {
            $fearGreed = $this->getFearGreedIndex();
            $globalMarket = $this->getGlobalMarketData();

            $sentiment = 'neutral';
            $confidence = 50;

            if ($fearGreed) {
                $fearValue = $fearGreed['value'];
                if ($fearValue <= 25) {
                    $sentiment = 'extremely_bearish';
                    $confidence = 90;
                } elseif ($fearValue <= 45) {
                    $sentiment = 'bearish';
                    $confidence = 75;
                } elseif ($fearValue <= 55) {
                    $sentiment = 'neutral';
                    $confidence = 60;
                } elseif ($fearValue <= 75) {
                    $sentiment = 'bullish';
                    $confidence = 75;
                } else {
                    $sentiment = 'extremely_bullish';
                    $confidence = 90;
                }
            }

            // Adjust sentiment based on market cap change
            if ($globalMarket && isset($globalMarket['market_cap_change_24h'])) {
                $marketChange = $globalMarket['market_cap_change_24h'];
                if ($marketChange > 5) {
                    $confidence = min(95, $confidence + 10);
                } elseif ($marketChange < -5) {
                    $confidence = min(95, $confidence + 10);
                }
            }

            return [
                'sentiment' => $sentiment,
                'confidence' => $confidence,
                'fear_greed_value' => $fearGreed['value'] ?? null,
                'market_change_24h' => $globalMarket['market_cap_change_24h'] ?? null,
                'summary' => $this->generateSentimentSummary($sentiment, $confidence),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to analyze market sentiment: ' . $e->getMessage());
            return [
                'sentiment' => 'neutral',
                'confidence' => 50,
                'summary' => 'Unable to analyze market sentiment at this time.',
            ];
        }
    }

    /**
     * Generate human-readable sentiment summary
     */
    private function generateSentimentSummary(string $sentiment, int $confidence): string
    {
        $summaries = [
            'extremely_bearish' => 'The market is in extreme fear with very negative sentiment. Consider waiting for better opportunities.',
            'bearish' => 'Market sentiment is bearish with high fear levels. Exercise caution with new investments.',
            'neutral' => 'Market sentiment is balanced. Good time for measured investment decisions.',
            'bullish' => 'Market sentiment is positive with growing optimism. Favorable conditions for investments.',
            'extremely_bullish' => 'Extreme greed in the market. Consider taking profits and be cautious of overvaluation.',
        ];

        $base = $summaries[$sentiment] ?? $summaries['neutral'];
        $confidenceText = $confidence > 80 ? ' High confidence.' : ($confidence > 60 ? ' Moderate confidence.' : ' Low confidence.');

        return $base . $confidenceText;
    }
}
