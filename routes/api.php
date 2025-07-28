<?php

use App\Http\Controllers\Api\CryptoDataController;
use App\Http\Controllers\Api\MarketIntelligenceController;
use App\Http\Controllers\Api\AdvancedPortfolioMetricsController;
use App\Http\Controllers\Api\PortfolioAnalyticsController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Crypto data API routes - These can work without authentication
Route::prefix('crypto')->group(function () {
    Route::get('/live-prices', [CryptoDataController::class, 'getLivePrices']);
    Route::get('/price/{symbol}', [CryptoDataController::class, 'getCoinPrice']);
    Route::get('/search', [WatchlistController::class, 'searchCrypto']);

    // Debug route to test database
    Route::get('/debug', function () {
        $count = App\Models\Cryptocurrency::count();
        $sample = App\Models\Cryptocurrency::take(3)->get(['symbol', 'name', 'trading_symbol']);
        $searchTest = App\Models\Cryptocurrency::where('symbol', 'LIKE', '%BTC%')->first();
        return response()->json([
            'count' => $count,
            'sample' => $sample,
            'search_test' => $searchTest
        ]);
    });
});

// Portfolio Analytics API routes
Route::prefix('portfolio')->middleware(['web', 'auth'])->group(function () {
    Route::get('/performance', [PortfolioAnalyticsController::class, 'getPerformanceTimeline']);
    Route::post('/snapshot', [PortfolioAnalyticsController::class, 'storeSnapshot']);
    Route::get('/metrics', [PortfolioAnalyticsController::class, 'getMetrics']);
});

// Dashboard API routes - Public endpoint that mirrors live-prices
Route::get('/dashboard/live-data', [CryptoDataController::class, 'getLivePrices']);

// Market Intelligence routes - Make these public as they're general market data
Route::get('/market/intelligence', [MarketIntelligenceController::class, 'getMarketIntelligence']);
Route::get('/market/fear-greed', [MarketIntelligenceController::class, 'getFearGreedIndex']);
Route::get('/market/global', [MarketIntelligenceController::class, 'getGlobalMarketData']);
Route::get('/market/gainers', [MarketIntelligenceController::class, 'getTopGainers']);
Route::get('/market/losers', [MarketIntelligenceController::class, 'getTopLosers']);

// Advanced Portfolio Metrics routes - Return mock data for unauthenticated users
Route::get('/portfolio/advanced-metrics', [AdvancedPortfolioMetricsController::class, 'getAdvancedMetrics']);
Route::get('/portfolio/risk-analysis', [AdvancedPortfolioMetricsController::class, 'getRiskAnalysis']);
Route::get('/portfolio/performance-attribution', [AdvancedPortfolioMetricsController::class, 'getPerformanceAttribution']);
Route::get('/portfolio/benchmark-comparison', [AdvancedPortfolioMetricsController::class, 'getBenchmarkComparison']);
