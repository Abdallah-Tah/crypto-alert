<?php

namespace App\Http\Controllers;

use App\Services\CCXTService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PriceComparisonController extends Controller
{
    public function __construct(
        private CCXTService $ccxtService
    ) {
    }

    /**
     * Compare prices from multiple sources
     */
    public function comparePrices(Request $request)
    {
        $symbols = ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT', 'ETC/USDT'];
        $holdings = [
            'BTC/USDT' => 0.02986411,
            'ETH/USDT' => 1.103112,
            'DOGE/USDT' => 1792.13,
            'ETC/USDT' => 10.699535,
        ];

        $comparison = [];
        $totals = [
            'current' => 0,
            'coinbase' => 0,
            'binance' => 0,
        ];

        foreach ($symbols as $symbol) {
            $currentPrice = $this->ccxtService->getCurrentPrice($symbol, true);
            $coinbasePrice = $this->getCoinbasePrice($symbol);
            $binancePrice = $this->getBinancePrice($symbol);

            $holding = $holdings[$symbol];

            $comparison[$symbol] = [
                'holding_amount' => $holding,
                'current_source' => [
                    'price' => $currentPrice['current_price'] ?? 0,
                    'value' => ($currentPrice['current_price'] ?? 0) * $holding,
                ],
                'coinbase' => [
                    'price' => $coinbasePrice,
                    'value' => $coinbasePrice * $holding,
                ],
                'binance' => [
                    'price' => $binancePrice,
                    'value' => $binancePrice * $holding,
                ],
            ];

            $totals['current'] += $comparison[$symbol]['current_source']['value'];
            $totals['coinbase'] += $comparison[$symbol]['coinbase']['value'];
            $totals['binance'] += $comparison[$symbol]['binance']['value'];
        }

        return response()->json([
            'robinhood_target' => 8505.46,
            'price_comparison' => $comparison,
            'portfolio_totals' => $totals,
            'differences_from_robinhood' => [
                'current' => 8505.46 - $totals['current'],
                'coinbase' => 8505.46 - $totals['coinbase'],
                'binance' => 8505.46 - $totals['binance'],
            ],
        ]);
    }

    private function getCoinbasePrice(string $symbol): float
    {
        try {
            // Convert ETH/USDT to ETH-USD format for Coinbase
            $coinbaseSymbol = str_replace(['/', 'USDT'], ['', 'USD'], $symbol);
            if ($coinbaseSymbol === 'ETCUSD')
                $coinbaseSymbol = 'ETC-USD';
            if ($coinbaseSymbol === 'DOGEUSD')
                $coinbaseSymbol = 'DOGE-USD';
            if ($coinbaseSymbol === 'BTCUSD')
                $coinbaseSymbol = 'BTC-USD';
            if ($coinbaseSymbol === 'ETHUSD')
                $coinbaseSymbol = 'ETH-USD';

            $response = Http::timeout(5)->get("https://api.coinbase.com/v2/exchange-rates?currency=" . explode('-', $coinbaseSymbol)[0]);

            if ($response->successful()) {
                $data = $response->json();
                return (float) ($data['data']['rates']['USD'] ?? 0);
            }
        } catch (\Exception $e) {
            // Ignore errors
        }

        return 0;
    }

    private function getBinancePrice(string $symbol): float
    {
        try {
            $response = Http::timeout(5)->get("https://api.binance.com/api/v3/ticker/price?symbol=" . str_replace('/', '', $symbol));

            if ($response->successful()) {
                $data = $response->json();
                return (float) ($data['price'] ?? 0);
            }
        } catch (\Exception $e) {
            // Ignore errors
        }

        return 0;
    }
}
