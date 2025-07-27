<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Analytics\PortfolioAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PortfolioAnalyticsController extends Controller
{
    public function __construct(
        private PortfolioAnalyticsService $analyticsService
    ) {
    }

    /**
     * Get portfolio performance timeline
     */
    public function getPerformanceTimeline(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $timeframe = $request->query('timeframe', '1M');

        // Validate timeframe
        $validTimeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'];
        if (!in_array($timeframe, $validTimeframes)) {
            return response()->json(['error' => 'Invalid timeframe'], 400);
        }

        try {
            $timeline = $this->analyticsService->getPerformanceTimeline($user, $timeframe);
            $metrics = $this->analyticsService->getPerformanceMetrics($user, $timeframe);

            return response()->json([
                'success' => true,
                'timeframe' => $timeframe,
                'timeline' => $timeline,
                'metrics' => $metrics,
                'data_points' => count($timeline),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch performance data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store current portfolio snapshot
     */
    public function storeSnapshot(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        try {
            $this->analyticsService->storePortfolioSnapshot($user);

            return response()->json([
                'success' => true,
                'message' => 'Portfolio snapshot stored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to store snapshot',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get portfolio performance metrics only
     */
    public function getMetrics(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $timeframe = $request->query('timeframe', '1M');

        try {
            $metrics = $this->analyticsService->getPerformanceMetrics($user, $timeframe);

            return response()->json([
                'success' => true,
                'timeframe' => $timeframe,
                'metrics' => $metrics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch metrics',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
