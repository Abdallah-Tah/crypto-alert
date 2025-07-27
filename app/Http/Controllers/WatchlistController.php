<?php

namespace App\Http\Controllers;

use App\Services\WatchlistService;
use App\Services\CCXTService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WatchlistController extends Controller
{
    public function __construct(
        private WatchlistService $watchlistService,
        private CCXTService $ccxtService
    ) {
    }

    /**
     * Display the watchlist page
     */
    public function index()
    {
        $user = Auth::user();
        $watchlist = $this->watchlistService->getUserWatchlist($user);
        $availableSymbols = $this->ccxtService->getAvailableSymbols();

        return Inertia::render('Watchlist', [
            'watchlist' => $watchlist,
            'availableSymbols' => $availableSymbols,
        ]);
    }

    /**
     * Add coin to watchlist
     */
    public function store(Request $request)
    {
        $request->validate([
            'symbol' => 'required|string',
            'alert_price' => 'nullable|numeric|min:0',
            'holdings_amount' => 'nullable|numeric|min:0',
            'holdings_type' => 'nullable|string|in:usd_value,coin_quantity',
            'purchase_price' => 'nullable|numeric|min:0',
            'alert_type' => 'nullable|string|in:market_price,purchase_price',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $result = $this->watchlistService->addToWatchlist(
            $user,
            $request->input('symbol'),
            $request->input('alert_price'),
            $request->input('holdings_amount'),
            $request->input('holdings_type', 'usd_value'), // Default to USD value
            $request->input('purchase_price'),
            $request->input('alert_type', 'market_price'),
            $request->input('notes')
        );

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['symbol' => $result['message']]);
    }

    /**
     * Remove coin from watchlist
     */
    public function destroy($watchlistId)
    {
        $user = Auth::user();
        $success = $this->watchlistService->removeFromWatchlist($user, $watchlistId);

        if ($success) {
            return back()->with('success', 'Removed from watchlist');
        }

        return back()->withErrors(['error' => 'Failed to remove from watchlist']);
    }

    /**
     * Toggle alert for watchlist item
     */
    public function toggleAlert(Request $request, $watchlistId)
    {
        $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $user = Auth::user();
        $success = $this->watchlistService->toggleAlert(
            $user,
            $watchlistId,
            $request->input('enabled')
        );

        if ($success) {
            return back()->with('success', 'Alert updated');
        }

        return back()->withErrors(['error' => 'Failed to update alert']);
    }

    /**
     * Update alert price for watchlist item
     */
    public function updateAlertPrice(Request $request, $watchlistId)
    {
        $request->validate([
            'alert_price' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();
        $success = $this->watchlistService->updateAlertPrice(
            $user,
            $watchlistId,
            $request->input('alert_price')
        );

        if ($success) {
            return back()->with('success', 'Alert price updated');
        }

        return back()->withErrors(['error' => 'Failed to update alert price']);
    }

    /**
     * Update watchlist item with holdings and other details
     */
    public function update(Request $request, $watchlistId)
    {
        $request->validate([
            'alert_price' => 'nullable|numeric|min:0',
            'holdings_amount' => 'nullable|numeric|min:0',
            'holdings_type' => 'nullable|string|in:usd_value,coin_quantity',
            'purchase_price' => 'nullable|numeric|min:0',
            'alert_type' => 'nullable|string|in:market_price,purchase_price',
            'notes' => 'nullable|string|max:1000',
            'enabled' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        $success = $this->watchlistService->updateWatchlistItem(
            $user,
            $watchlistId,
            $request->only(['alert_price', 'holdings_amount', 'holdings_type', 'purchase_price', 'alert_type', 'notes', 'enabled'])
        );

        if ($success) {
            return back()->with('success', 'Watchlist item updated successfully');
        }

        return back()->withErrors(['error' => 'Failed to update watchlist item']);
    }

    /**
     * Search available coins for public use
     */
    public function searchCrypto(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:50',
        ]);

        $query = $request->input('q', '');

        try {
            // Direct database query for debugging
            $baseQuery = \App\Models\Cryptocurrency::active();

            if (empty($query)) {
                // Return top 100 popular coins when no query, ordered by market cap
                $cryptocurrencies = $baseQuery->orderBy('market_cap_rank')->limit(100)->get();
            } else {
                // Search by name or symbol
                $cryptocurrencies = $baseQuery->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                        ->orWhere('symbol', 'LIKE', "%{$query}%")
                        ->orWhere('trading_symbol', 'LIKE', "%{$query}%");
                })
                    ->orderBy('market_cap_rank')
                    ->limit(50)
                    ->get();
            }

            $results = $cryptocurrencies->map(function ($crypto) {
                return [
                    'symbol' => $crypto->trading_symbol,
                    'name' => $crypto->name,
                    'id' => $crypto->coingecko_id,
                    'display_symbol' => $crypto->symbol,
                    'current_price' => $crypto->current_price,
                    'formatted_price' => $crypto->current_price ?
                        '$' . number_format($crypto->current_price, $crypto->current_price >= 1 ? 2 : 6) : null,
                    'market_cap_rank' => $crypto->market_cap_rank,
                    'price_change_24h' => $crypto->price_change_24h,
                    'image_url' => $crypto->image_url,
                ];
            })->toArray();

            return response()->json([
                'results' => $results,
                'debug' => [
                    'query' => $query,
                    'total_found' => count($results),
                    'total_cryptocurrencies' => \App\Models\Cryptocurrency::count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'results' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search available coins for authenticated users
     */
    public function searchCoins(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:50',
        ]);

        $results = $this->watchlistService->searchCoins($request->input('query'));

        return response()->json([
            'results' => $results
        ]);
    }
}
