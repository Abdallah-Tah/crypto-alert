<?php

use App\Models\User;
use App\Services\WatchlistService;
use App\Services\CCXTService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->ccxtService = $this->mock(CCXTService::class);
    $this->watchlistService = new WatchlistService($this->ccxtService);

    // Mock CCXT service responses
    $this->ccxtService->shouldReceive('getAvailableSymbols')
        ->andReturn(['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT']);

    $this->ccxtService->shouldReceive('getCurrentPrice')
        ->with('BTC/USDT')
        ->andReturn([
            'symbol' => 'BTC/USDT',
            'price' => 45000.00,
            'change_24h' => 2.5,
            'timestamp' => now()
        ]);
});

describe('WatchlistService', function () {
    it('can add coin to watchlist', function () {
        $result = $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);

        expect($result)->toHaveKeys(['success', 'message', 'data'])
            ->and($result['success'])->toBeTrue()
            ->and($result['message'])->toBe('Added to watchlist successfully');

        $this->assertDatabaseHas('watchlists', [
            'user_id' => $this->user->id,
            'symbol' => 'BTC/USDT',
            'alert_price' => 50000.00,
            'enabled' => true
        ]);
    });

    it('prevents duplicate coins in watchlist', function () {
        // Add coin first time
        $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);

        // Try to add same coin again
        $result = $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 55000.00);

        expect($result['success'])->toBeFalse()
            ->and($result['message'])->toBe('Coin already in watchlist');
    });

    it('validates symbol exists', function () {
        $result = $this->watchlistService->addToWatchlist($this->user, 'INVALID/SYMBOL', 1000.00);

        expect($result['success'])->toBeFalse()
            ->and($result['message'])->toBe('Invalid symbol');
    });

    it('can remove coin from watchlist', function () {
        // First add a coin
        $result = $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);
        $watchlistId = $result['data']->id;

        // Then remove it
        $removed = $this->watchlistService->removeFromWatchlist($this->user, $watchlistId);

        expect($removed)->toBeTrue();

        $this->assertDatabaseMissing('watchlists', [
            'id' => $watchlistId,
            'user_id' => $this->user->id
        ]);
    });

    it('can get user watchlist with prices', function () {
        // Add some coins to watchlist
        $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);

        $watchlist = $this->watchlistService->getUserWatchlist($this->user);

        expect($watchlist)->toBeArray()
            ->and(count($watchlist))->toBe(1)
            ->and($watchlist[0])->toHaveKeys([
                    'id',
                    'symbol',
                    'alert_price',
                    'enabled',
                    'created_at',
                    'current_price',
                    'change_24h',
                    'price_data'
                ])
            ->and($watchlist[0]['symbol'])->toBe('BTC/USDT')
            ->and($watchlist[0]['current_price'])->toBe(45000.00);
    });

    it('can toggle alert for watchlist item', function () {
        $result = $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);
        $watchlistId = $result['data']->id;

        // Disable alert
        $updated = $this->watchlistService->toggleAlert($this->user, $watchlistId, false);
        expect($updated)->toBeTrue();

        $this->assertDatabaseHas('watchlists', [
            'id' => $watchlistId,
            'enabled' => false
        ]);

        // Enable alert again
        $updated = $this->watchlistService->toggleAlert($this->user, $watchlistId, true);
        expect($updated)->toBeTrue();

        $this->assertDatabaseHas('watchlists', [
            'id' => $watchlistId,
            'enabled' => true
        ]);
    });

    it('can update alert price', function () {
        $result = $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);
        $watchlistId = $result['data']->id;

        $updated = $this->watchlistService->updateAlertPrice($this->user, $watchlistId, 55000.00);
        expect($updated)->toBeTrue();

        $this->assertDatabaseHas('watchlists', [
            'id' => $watchlistId,
            'alert_price' => 55000.00
        ]);
    });

    it('can get watchlist summary', function () {
        // Add multiple coins
        $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);

        // Mock different price responses
        $this->ccxtService->shouldReceive('getCurrentPrice')
            ->andReturn([
                'symbol' => 'ETH/USDT',
                'price' => 3000.00,
                'change_24h' => -1.5,
                'timestamp' => now()
            ]);

        $summary = $this->watchlistService->getWatchlistSummary($this->user);

        expect($summary)->toHaveKeys([
            'total_coins',
            'alerts_enabled',
            'total_value',
            'top_gainers',
            'top_losers'
        ])
            ->and($summary['total_coins'])->toBeGreaterThan(0)
            ->and($summary['alerts_enabled'])->toBeGreaterThan(0);
    });

    it('can search coins', function () {
        $results = $this->watchlistService->searchCoins('BTC');

        expect($results)->toBeArray()
            ->and($results)->toContain('BTC/USDT');
    });

    it('can get user symbols', function () {
        $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);

        $symbols = $this->watchlistService->getUserSymbols($this->user);

        expect($symbols)->toBeArray()
            ->and($symbols)->toContain('BTC/USDT');
    });

    it('handles user isolation correctly', function () {
        $anotherUser = User::factory()->create();

        // Add coin to first user's watchlist
        $this->watchlistService->addToWatchlist($this->user, 'BTC/USDT', 50000.00);

        // Check second user has empty watchlist
        $watchlist = $this->watchlistService->getUserWatchlist($anotherUser);
        expect($watchlist)->toBeArray()
            ->and(count($watchlist))->toBe(0);
    });
});
