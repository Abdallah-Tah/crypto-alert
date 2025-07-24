<?php

use App\Http\Controllers\Api\CryptoDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Crypto data API routes
Route::prefix('crypto')->group(function () {
    Route::get('/live-prices', [CryptoDataController::class, 'getLivePrices']);
    Route::get('/price/{symbol}', [CryptoDataController::class, 'getCoinPrice']);
});
