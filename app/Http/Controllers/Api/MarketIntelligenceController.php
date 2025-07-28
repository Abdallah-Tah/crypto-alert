<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MarketIntelligenceService;
use Illuminate\Http\Request;

class MarketIntelligenceController extends Controller
{
    public function __construct(
        private MarketIntelligenceService $marketIntelligenceService
    ) {
    }

    /**
     * Get comprehensive market intelligence data
     */
    public function getMarketIntelligence(Request $request)
    {
        try {
            $data = $this->marketIntelligenceService->getMarketIntelligence();
            return response()->json($data);
        } catch (\Exception $e) {
            // Return mock data on service failure
            return response()->json([
                'success' => true,
                'data' => [
                    'fear_greed' => [
                        'value' => 73,
                        'classification' => 'Greed',
                        'timestamp' => now()->toISOString()
                    ],
                    'global_market' => [
                        'total_market_cap' => 2840000000000,
                        'total_volume' => 87000000000,
                        'btc_dominance' => 51.2,
                        'market_cap_change_24h' => 2.3
                    ],
                    'top_gainers' => [
                        ['symbol' => 'ETH', 'change' => 5.2],
                        ['symbol' => 'BNB', 'change' => 3.8],
                        ['symbol' => 'ADA', 'change' => 7.1]
                    ],
                    'top_losers' => [
                        ['symbol' => 'DOGE', 'change' => -2.1],
                        ['symbol' => 'XRP', 'change' => -1.8]
                    ]
                ],
                'mock_data' => true
            ]);
        }
    }

    /**
     * Get Fear & Greed Index only
     */
    public function getFearGreedIndex()
    {
        try {
            $fearGreed = $this->marketIntelligenceService->getFearGreedIndex();

            return response()->json([
                'success' => true,
                'data' => $fearGreed,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch Fear & Greed Index',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get global market data only
     */
    public function getGlobalMarketData()
    {
        try {
            $globalMarket = $this->marketIntelligenceService->getGlobalMarketData();

            return response()->json([
                'success' => true,
                'data' => $globalMarket,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch global market data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top gainers and losers
     */
    public function getTopMovers(Request $request)
    {
        try {
            $limit = (int) $request->query('limit', 10);
            $limit = min(50, max(5, $limit)); // Limit between 5 and 50

            $topGainers = $this->marketIntelligenceService->getTopGainers($limit);
            $topLosers = $this->marketIntelligenceService->getTopLosers($limit);

            return response()->json([
                'success' => true,
                'data' => [
                    'top_gainers' => $topGainers,
                    'top_losers' => $topLosers,
                ],
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch top movers',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get market trends
     */
    public function getMarketTrends()
    {
        try {
            $trends = $this->marketIntelligenceService->getMarketTrends();

            return response()->json([
                'success' => true,
                'data' => $trends,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch market trends',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get market sentiment analysis
     */
    public function getMarketSentiment()
    {
        try {
            $sentiment = $this->marketIntelligenceService->getMarketSentiment();

            return response()->json([
                'success' => true,
                'data' => $sentiment,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to analyze market sentiment',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
