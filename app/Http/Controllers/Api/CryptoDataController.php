<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CCXTService;
use App\Services\WatchlistService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CryptoDataController extends Controller
{
    public function __construct(
        private CCXTService $ccxtService,
        private WatchlistService $watchlistService
    ) {
    }

    /**
     * Get live crypto prices for dashboard
     */
    public function getLivePrices()
    {
        try {
            // Get top movers with real-time data
            $topMovers = $this->ccxtService->getTopCoins(5);

            // Get user's watchlist summary if authenticated
            $watchlistSummary = null;
            if (Auth::check()) {
                $user = Auth::user();
                $watchlistSummary = $this->watchlistService->getWatchlistSummary($user);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'topMovers' => $topMovers,
                    'watchlistSummary' => $watchlistSummary,
                    'timestamp' => now()->toISOString(),
                    'lastUpdate' => now()->format('H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to fetch live crypto prices: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch live data'
            ], 500);
        }
    }

    /**
     * Get specific coin price
     */
    public function getCoinPrice(string $symbol)
    {
        try {
            $priceData = $this->ccxtService->getCurrentPrice($symbol);

            if (!$priceData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Symbol not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $priceData
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to fetch price for {$symbol}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch price data'
            ], 500);
        }
    }
}
