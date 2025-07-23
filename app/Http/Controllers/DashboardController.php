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

        // Get top coins from market
        $topCoins = $this->ccxtService->getTopCoins(5);

        // Get recent alerts
        $recentAlerts = $this->alertService->getUserAlerts($user, 5);

        // Get AI market sentiment (if available)
        $marketSentiment = $this->aiAdvisorService->getMarketSentiment($topCoins);

        return Inertia::render('dashboard', [
            'watchlistSummary' => $watchlistSummary,
            'topCoins' => $topCoins,
            'recentAlerts' => $recentAlerts,
            'marketSentiment' => $marketSentiment,
        ]);
    }
}
