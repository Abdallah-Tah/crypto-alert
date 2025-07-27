<?php

namespace App\Http\Controllers;

use App\Services\CCXTService;
use App\Services\WatchlistService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DebugController extends Controller
{
    public function __construct(
        private CCXTService $ccxtService,
        private WatchlistService $watchlistService
    ) {
    }

    /**
     * Debug portfolio calculations
     */
    public function debugPortfolio()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        // Get raw watchlist data
        $watchlist = $this->watchlistService->getUserWatchlist($user);
        $summary = $this->watchlistService->getWatchlistSummary($user);

        // Debug each coin calculation
        $debug = [];
        $totalCalculated = 0;

        foreach ($watchlist as $item) {
            $calculation = [
                'symbol' => $item['symbol'],
                'holdings_amount' => $item['holdings_amount'],
                'holdings_type' => $item['holdings_type'],
                'purchase_price' => $item['purchase_price'],
                'current_price' => $item['current_price'],
                'price_change_24h' => $item['price_change_24h'],
                'calculated_quantity' => 0,
                'calculated_value' => 0,
                'total_value_from_backend' => $item['total_value'] ?? 0,
            ];

            if ($item['current_price'] && $item['holdings_amount'] && $item['holdings_amount'] > 0) {
                if ($item['holdings_type'] === 'usd_value' && $item['purchase_price'] && $item['purchase_price'] > 0) {
                    $calculation['calculated_quantity'] = $item['holdings_amount'] / $item['purchase_price'];
                    $calculation['calculated_value'] = $item['current_price'] * $calculation['calculated_quantity'];
                } elseif ($item['holdings_type'] === 'coin_quantity') {
                    $calculation['calculated_quantity'] = $item['holdings_amount'];
                    $calculation['calculated_value'] = $item['current_price'] * $item['holdings_amount'];
                } else {
                    $calculation['calculated_value'] = $item['holdings_amount'];
                    $calculation['calculated_quantity'] = $item['holdings_amount'] / ($item['current_price'] ?? 1);
                }
            }

            $totalCalculated += $calculation['calculated_value'];
            $debug[] = $calculation;
        }

        return response()->json([
            'summary' => $summary,
            'total_calculated' => $totalCalculated,
            'robinhood_expected' => 8505.46,
            'difference' => 8505.46 - $totalCalculated,
            'difference_percent' => ((8505.46 - $totalCalculated) / 8505.46) * 100,
            'price_source' => 'KuCoin → CoinGecko fallback',
            'debug_calculations' => $debug,
            'raw_watchlist' => $watchlist,
        ]);
    }

    /**
     * Debug specific coin price
     */
    public function debugPrice(Request $request)
    {
        $symbol = $request->input('symbol', 'BTC');

        $price = $this->ccxtService->getCurrentPrice($symbol, true); // Force refresh

        return response()->json([
            'symbol' => $symbol,
            'price_data' => $price,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
