<?php

use App\Http\Controllers\AIAdvisorController;
use App\Http\Controllers\Api\CryptoDataController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebugController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PortfolioManagementController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\TaxReportController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/about', [PublicController::class, 'about'])->name('about');
Route::get('/contact', [PublicController::class, 'contact'])->name('contact');
Route::post('/contact', [PublicController::class, 'submitContact'])->name('contact.submit');
Route::get('/pricing', [PublicController::class, 'pricing'])->name('pricing');
Route::get('/features', [PublicController::class, 'features'])->name('features');
Route::get('/privacy', [PublicController::class, 'privacy'])->name('privacy');

// Debug route for testing cryptocurrency search
Route::get('/test-crypto-search', function () {
    $count = \App\Models\Cryptocurrency::count();
    $sample = \App\Models\Cryptocurrency::take(5)->get(['symbol', 'name', 'trading_symbol']);
    $btcSearch = \App\Models\Cryptocurrency::where('symbol', 'LIKE', '%BTC%')->get(['symbol', 'name', 'trading_symbol']);

    return response()->json([
        'total_cryptocurrencies' => $count,
        'sample_data' => $sample,
        'btc_search_results' => $btcSearch,
        'api_search_test' => app(WatchlistController::class)->searchCrypto(new \Illuminate\Http\Request(['q' => 'bitcoin']))->getData()
    ]);
});
Route::get('/terms', [PublicController::class, 'terms'])->name('terms');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // Chart data for performance graph
    Route::get('dashboard/chart-data', [DashboardController::class, 'chartData'])->name('dashboard.chart-data');

    // AI Advisor routes
    Route::prefix('advisor')->name('advisor.')->group(function () {
        Route::get('/', [AIAdvisorController::class, 'index'])->name('index');
        Route::post('/generate', [AIAdvisorController::class, 'generateAdvice'])->name('generate');
        Route::post('/analyze-portfolio', [AIAdvisorController::class, 'analyzePortfolio'])->name('analyze-portfolio');
        Route::get('/market-sentiment', [AIAdvisorController::class, 'getMarketSentiment'])->name('market-sentiment');
        Route::get('/suggestions', [AIAdvisorController::class, 'getSuggestionHistory'])->name('suggestions');
        Route::delete('/suggestions/{suggestion}', [AIAdvisorController::class, 'deleteSuggestion'])->name('suggestions.delete');
    });

    // Watchlist routes
    Route::prefix('watchlist')->name('watchlist.')->group(function () {
        Route::get('/', [WatchlistController::class, 'index'])->name('index');
        Route::post('/add', [WatchlistController::class, 'store'])->name('add');
        Route::delete('/{watchlist}', [WatchlistController::class, 'destroy'])->name('remove');
        Route::patch('/{watchlist}/toggle', [WatchlistController::class, 'toggleAlert'])->name('toggle-alert');
        Route::patch('/{watchlist}/price', [WatchlistController::class, 'updateAlertPrice'])->name('update-price');
        Route::patch('/{watchlist}', [WatchlistController::class, 'update'])->name('update');
    });

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/api', [NotificationController::class, 'getNotifications'])->name('api');
        Route::post('/{notificationId}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
        Route::post('/check-alerts', [NotificationController::class, 'checkAlerts'])->name('check-alerts');
    });

    // Tax Reporting routes
    Route::prefix('tax-report')->name('tax-report.')->group(function () {
        Route::get('/', [TaxReportController::class, 'index'])->name('index');
        Route::post('/generate', [TaxReportController::class, 'generate'])->name('generate');
        Route::post('/export-csv', [TaxReportController::class, 'exportCSV'])->name('export-csv');
        Route::get('/optimization-suggestions', [TaxReportController::class, 'getOptimizationSuggestions'])->name('optimization-suggestions');
    });

    // Portfolio Management routes (Enterprise Features)
    Route::prefix('portfolio')->name('portfolio.')->group(function () {
        // Page routes
        Route::get('/optimize-tax', [PortfolioManagementController::class, 'showTaxOptimization'])->name('optimize-tax.page');
        Route::get('/full-analysis', [PortfolioManagementController::class, 'showFullAnalysis'])->name('full-analysis.page');
        Route::get('/tax-loss-harvesting', [PortfolioManagementController::class, 'showTaxLossHarvesting'])->name('tax-loss-harvesting.page');
        Route::get('/rebalancing', [PortfolioManagementController::class, 'showRebalancing'])->name('rebalancing.page');

        // API routes for functionality
        Route::post('/optimize-tax', [PortfolioManagementController::class, 'optimizeTax'])->name('optimize-tax');
        Route::get('/full-analysis', [PortfolioManagementController::class, 'getFullAnalysis'])->name('full-analysis');
        Route::post('/setup-alerts', [PortfolioManagementController::class, 'setupSmartAlerts'])->name('setup-alerts');
        Route::get('/optimization-recommendations', [PortfolioManagementController::class, 'getOptimizationRecommendations'])->name('optimization-recommendations');

        // Tax Loss Harvesting
        Route::post('/tax-loss-harvesting/execute', [PortfolioManagementController::class, 'executeTaxLossHarvesting'])->name('tax-loss-harvesting.execute');

        // Portfolio Rebalancing
        Route::post('/rebalancing/execute', [PortfolioManagementController::class, 'executeRebalancing'])->name('rebalancing.execute');
    });

    // Debug routes
    Route::prefix('debug')->name('debug.')->group(function () {
        Route::get('/portfolio', [DebugController::class, 'debugPortfolio'])->name('portfolio');
        Route::get('/price', [DebugController::class, 'debugPrice'])->name('price');
        Route::get('/price-comparison', [App\Http\Controllers\PriceComparisonController::class, 'comparePrices'])->name('price-comparison');
    });

    // Crypto API routes (for AJAX calls from frontend)
    Route::prefix('api/crypto')->group(function () {
        Route::get('/live-prices', [CryptoDataController::class, 'getLivePrices']);
        Route::get('/price/{symbol}', [CryptoDataController::class, 'getCoinPrice']);
    });

    // Public API routes for live crypto data (no auth required for reading prices)
    Route::prefix('api/crypto')->group(function () {
        Route::get('/live-prices', [CryptoDataController::class, 'getLivePrices']);
        Route::get('/price/{symbol}', [CryptoDataController::class, 'getCoinPrice']);
    });
});



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
