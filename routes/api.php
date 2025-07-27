<?php

use App\Http\Controllers\Api\CryptoDataController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Crypto data API routes
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
})->middleware('auth');
