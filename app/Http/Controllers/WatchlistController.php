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
        ]);

        $user = Auth::user();
        $result = $this->watchlistService->addToWatchlist(
            $user,
            $request->input('symbol'),
            $request->input('alert_price')
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
     * Search available coins
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
