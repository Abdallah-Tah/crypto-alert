<?php

namespace App\Http\Controllers;

use App\Services\AIAdvisorService;
use App\Services\EnhancedAIAdvisorService;
use App\Services\CCXTService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AIAdvisorController extends Controller
{
    public function __construct(
        private AIAdvisorService $aiAdvisorService,
        private EnhancedAIAdvisorService $enhancedAIAdvisorService,
        private CCXTService $ccxtService
    ) {
    }

    /**
     * Display the AI advisor page
     */
    public function index()
    {
        $user = Auth::user();

        // Get recent AI suggestions for this user
        $recentSuggestions = DB::table('ai_suggestions')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get user's portfolio symbols from watchlist
        $watchlistService = app(\App\Services\WatchlistService::class);
        $portfolio = $watchlistService->getUserWatchlist($user);
        $portfolioSymbols = array_map(fn($item) => $item['symbol'], $portfolio);
        return Inertia::render('AIAdvisor', [
            'riskLevels' => config('crypto-advisor.ai_advisor.risk_levels'),
            'timeHorizons' => config('crypto-advisor.ai_advisor.time_horizons'),
            'recentSuggestions' => $recentSuggestions,
            'availableSymbols' => $this->ccxtService->getAvailableSymbols(),
            'portfolioSymbols' => $portfolioSymbols,
        ]);
    }

    /**
     * Generate AI advice for a specific coin or portfolio
     */
    public function generateAdvice(Request $request)
    {
        $request->validate([
            'analysis_mode' => 'required|in:single,portfolio,multi-select',
            'symbol' => 'required_if:analysis_mode,single|string',
            'selected_coins' => 'required_if:analysis_mode,multi-select|array',
            'selected_coins.*' => 'string',
            'risk_level' => 'required|in:low,moderate,high',
            'time_horizon' => 'required|in:short,medium,long',
        ]);

        // Check rate limiting (max suggestions per day)
        $user = Auth::user();
        $todayCount = DB::table('ai_suggestions')
            ->where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        $maxSuggestions = config('crypto-advisor.ai_advisor.max_suggestions_per_day', 10);
        if ($todayCount >= $maxSuggestions) {
            return back()->withErrors(['error' => "Daily limit of {$maxSuggestions} AI suggestions reached"]);
        }

        $analysisMode = $request->input('analysis_mode');

        // Handle different analysis modes
        switch ($analysisMode) {
            case 'single':
                return $this->analyzeSingleCoin($request);

            case 'portfolio':
                return $this->analyzePortfolio($request);

            case 'multi-select':
                return $this->analyzeSelectedCoins($request);

            default:
                return back()->withErrors(['error' => 'Invalid analysis mode']);
        }
    }

    /**
     * Analyze a single coin with enhanced AI capabilities
     */
    private function analyzeSingleCoin(Request $request)
    {
        $user = Auth::user();

        // Get current price data
        $priceData = $this->ccxtService->getCurrentPrice($request->input('symbol'));

        if (!$priceData) {
            return back()->withErrors(['symbol' => 'Unable to fetch price data for this symbol']);
        }

        // Use enhanced AI service for comprehensive analysis
        $advice = $this->enhancedAIAdvisorService->generateEnhancedAdvice(
            $request->input('symbol'),
            $priceData['price'],
            $priceData['change_24h'],
            $request->input('risk_level'),
            $request->input('time_horizon')
        );

        if (!$advice) {
            return back()->withErrors(['error' => 'Failed to generate enhanced AI advice. Please try again.']);
        }

        // Store the suggestion
        $suggestionId = DB::table('ai_suggestions')->insertGetId([
            'user_id' => $user->id,
            'symbol' => $request->input('symbol'),
            'suggestion' => $advice['suggestion'],
            'model_used' => $advice['model_used'],
            'risk_level' => $request->input('risk_level'),
            'time_horizon' => $request->input('time_horizon'),
            'price_at_time' => $priceData['price'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Enhanced AI analysis completed successfully')
            ->with('advice', $advice)
            ->with('suggestion_id', $suggestionId);
    }    /**
         * Analyze selected coins from portfolio
         */
    private function analyzeSelectedCoins(Request $request)
    {
        $user = Auth::user();
        $selectedCoins = $request->input('selected_coins', []);

        if (empty($selectedCoins)) {
            return back()->withErrors(['error' => 'No coins selected for analysis']);
        }

        // Get price data for selected coins
        $coinData = [];
        foreach ($selectedCoins as $symbol) {
            $priceData = $this->ccxtService->getCurrentPrice($symbol);
            if ($priceData) {
                $coinData[] = [
                    'symbol' => $symbol,
                    'price' => $priceData['price'],
                    'change_24h' => $priceData['change_24h']
                ];
            }
        }

        if (empty($coinData)) {
            return back()->withErrors(['error' => 'Unable to fetch price data for selected coins']);
        }

        // Generate enhanced portfolio advice for selected coins
        $advice = $this->enhancedAIAdvisorService->generateEnhancedPortfolioAdvice(
            $coinData,
            $request->input('risk_level'),
            $request->input('time_horizon'),
            'Selected portfolio coins analysis'
        );

        if (!$advice) {
            return back()->withErrors(['error' => 'Failed to generate enhanced portfolio advice. Please try again.']);
        }

        // Store the suggestion with a combined symbol
        $combinedSymbol = implode(', ', $selectedCoins);
        $suggestionId = DB::table('ai_suggestions')->insertGetId([
            'user_id' => $user->id,
            'symbol' => $combinedSymbol,
            'suggestion' => $advice['suggestion'],
            'model_used' => $advice['model_used'],
            'risk_level' => $request->input('risk_level'),
            'time_horizon' => $request->input('time_horizon'),
            'price_at_time' => null, // No single price for multiple coins
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Enhanced portfolio analysis for selected coins completed successfully')
            ->with('advice', $advice)
            ->with('suggestion_id', $suggestionId);
    }

    /**
     * Analyze user's portfolio
     */
    public function analyzePortfolio(Request $request)
    {
        $request->validate([
            'risk_level' => 'required|in:low,moderate,high',
        ]);

        $user = Auth::user();

        // Get user's watchlist as portfolio proxy
        $watchlistService = app(\App\Services\WatchlistService::class);
        $watchlist = $watchlistService->getUserWatchlist($user);

        if (empty($watchlist)) {
            return back()->withErrors(['error' => 'No coins in watchlist to analyze']);
        }

        // Convert watchlist to portfolio format
        $portfolio = array_map(function ($item) {
            return [
                'symbol' => $item['symbol'],
                'value' => $item['current_price'] ?? 0,
                'percentage' => 0, // Calculate based on total value
            ];
        }, $watchlist);

        // Calculate percentages
        $totalValue = array_sum(array_column($portfolio, 'value'));
        foreach ($portfolio as &$item) {
            $item['percentage'] = $totalValue > 0 ? ($item['value'] / $totalValue) * 100 : 0;
        }

        // Generate portfolio analysis
        $analysis = $this->aiAdvisorService->analyzePortfolio(
            $portfolio,
            $request->input('risk_level')
        );

        if (!$analysis) {
            return back()->withErrors(['error' => 'Failed to analyze portfolio']);
        }

        // Store the analysis
        DB::table('ai_suggestions')->insert([
            'user_id' => $user->id,
            'symbol' => 'PORTFOLIO',
            'suggestion' => $analysis['analysis'],
            'model_used' => $analysis['model_used'],
            'risk_level' => $request->input('risk_level'),
            'time_horizon' => 'medium',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Portfolio analysis completed')
            ->with('analysis', $analysis);
    }

    /**
     * Get market sentiment
     */
    public function getMarketSentiment()
    {
        $topCoins = $this->ccxtService->getTopCoins(10);
        $sentiment = $this->aiAdvisorService->getMarketSentiment($topCoins);

        return response()->json([
            'sentiment' => $sentiment,
            'market_data' => $topCoins,
        ]);
    }

    /**
     * Get suggestion history
     */
    public function getSuggestionHistory(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->input('per_page', 20);

        $suggestions = DB::table('ai_suggestions')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($suggestions);
    }

    /**
     * Delete a suggestion
     */
    public function deleteSuggestion($suggestionId)
    {
        $user = Auth::user();

        $deleted = DB::table('ai_suggestions')
            ->where('id', $suggestionId)
            ->where('user_id', $user->id)
            ->delete();

        if ($deleted) {
            return back()->with('success', 'Suggestion deleted');
        }

        return back()->withErrors(['error' => 'Failed to delete suggestion']);
    }
}
