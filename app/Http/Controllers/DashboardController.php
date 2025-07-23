<?php

namespace App\Http\Controllers;

use App\Services\CCXTService;
use App\Services\AIAdvisorService;
use App\Services\AlertService;
use App\Services\WatchlistService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private CCXTService $ccxtService,
        private AIAdvisorService $aiAdvisorService,
        private AlertService $alertService,
        private WatchlistService $watchlistService
    ) {
    }

    /**
     * Display the dashboard
     */
    public function index()
    {
        $user = Auth::user();

        // Get user's watchlist summary
        $watchlistSummary = $this->watchlistService->getWatchlistSummary($user);

        // Get top coins from market (as top movers)
        $topMovers = $this->ccxtService->getTopCoins(5);

        // Get recent alerts
        $recentAlerts = $this->alertService->getUserAlerts($user, 5);

        // Get recent AI suggestions
        $aiSuggestions = $this->aiAdvisorService->getRecentSuggestions($user, 3);

        // Create market summary
        $marketSummary = [
            'total_market_cap' => 2500000000000, // 2.5T placeholder
            'btc_dominance' => 45.2,
            'market_change' => 2.5,
        ];

        return Inertia::render('dashboard', [
            'watchlistSummary' => $watchlistSummary,
            'topMovers' => $topMovers,
            'recentAlerts' => $recentAlerts,
            'aiSuggestions' => $aiSuggestions,
            'marketSummary' => $marketSummary,
        ]);
    }
}
