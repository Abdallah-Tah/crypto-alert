<?php

namespace App\Http\Controllers;

use App\Services\CCXTService;
use Illuminate\Http\Request;
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

        // Get user's watchlist summary with fresh real-time data
        $watchlistSummary = $this->watchlistService->getWatchlistSummary($user);

        // Get detailed portfolio holdings for portfolio display
        $portfolioHoldings = $this->watchlistService->getUserWatchlist($user);

        // Get top coins from market with real-time data
        $topMovers = $this->ccxtService->getTopCoins(5);

        // Get recent alerts
        $recentAlerts = $this->alertService->getUserAlerts($user, 5);

        // Get recent AI suggestions
        $aiSuggestions = $this->aiAdvisorService->getRecentSuggestions($user, 3);

        // Create market summary (this could also be made real-time)
        $marketSummary = [
            'total_market_cap' => 2500000000000, // 2.5T placeholder
            'btc_dominance' => 45.2,
            'market_change' => 2.5,
        ];

        return Inertia::render('dashboard', [
            'watchlistSummary' => $watchlistSummary,
            'portfolioHoldings' => $portfolioHoldings,
            'topMovers' => $topMovers,
            'recentAlerts' => $recentAlerts,
            'aiSuggestions' => $aiSuggestions,
            'marketSummary' => $marketSummary,
        ]);
    }

    /**
     * Get chart data
     */
    public function chartData(Request $request)
    {
        $symbol = $request->input('symbol');
        $range = $request->input('range', '1D');
        // Map ranges to days
        $daysMap = ['1D' => 1, '1W' => 7, '1M' => 30, '3M' => 90, '1Y' => 365];
        $days = $daysMap[$range] ?? 1;
        // Convert symbol to CoinGecko ID
        $coinId = $this->ccxtService->convertSymbolToCoinId($symbol);
        if (!$coinId) {
            return response()->json([], 400);
        }
        // Fetch historical market data from CoinGecko
        $url = "https://api.coingecko.com/api/v3/coins/{$coinId}/market_chart?vs_currency=usd&days={$days}";
        try {
            $context = stream_context_create(['http' => ['timeout' => 10]]);
            $resp = file_get_contents($url, false, $context);
            $json = json_decode($resp, true);
            $points = [];
            if (!empty($json['prices']) && is_array($json['prices'])) {
                foreach ($json['prices'] as $item) {
                    // item: [ timestamp_ms, price ]
                    $points[] = ['time' => $item[0], 'price' => $item[1]];
                }
            }
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
        return response()->json($points);
    }
}
