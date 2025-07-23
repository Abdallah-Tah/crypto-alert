<?php

use App\Http\Controllers\AIAdvisorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

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
        Route::post('/add', [WatchlistController::class, 'add'])->name('add');
        Route::delete('/{watchlist}', [WatchlistController::class, 'remove'])->name('remove');
        Route::patch('/{watchlist}/toggle', [WatchlistController::class, 'toggleAlert'])->name('toggle-alert');
        Route::patch('/{watchlist}/price', [WatchlistController::class, 'updateAlertPrice'])->name('update-price');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
