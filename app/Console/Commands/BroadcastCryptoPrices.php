<?php

namespace App\Console\Commands;

use App\Events\CryptoPriceUpdated;
use App\Services\CCXTService;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BroadcastCryptoPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crypto:broadcast-prices 
                            {--interval=30 : Broadcast interval in seconds}
                            {--user= : Specific user ID to broadcast to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Broadcast real-time cryptocurrency prices via Laravel Reverb';

    protected CCXTService $ccxtService;

    public function __construct(CCXTService $ccxtService)
    {
        parent::__construct();
        $this->ccxtService = $ccxtService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $interval = (int) $this->option('interval');
        $specificUserId = $this->option('user');

        $this->info("Starting crypto price broadcasting (interval: {$interval}s)");
        $this->info("Press Ctrl+C to stop broadcasting");

        $running = true;

        // Handle graceful shutdown
        pcntl_signal(SIGTERM, function () use (&$running) {
            $running = false;
        });
        pcntl_signal(SIGINT, function () use (&$running) {
            $running = false;
        });

        while ($running) {
            try {
                if ($specificUserId) {
                    $this->broadcastForUser((int) $specificUserId);
                } else {
                    $this->broadcastForAllUsers();
                }

                $this->line('Prices broadcasted at ' . now()->format('H:i:s'));
                sleep($interval);

                // Process signals
                pcntl_signal_dispatch();
            } catch (\Exception $e) {
                $this->error('Error broadcasting prices: ' . $e->getMessage());
                Log::error('Crypto price broadcast error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                sleep(5); // Wait before retrying
            }
        }

        $this->info('Crypto price broadcasting stopped');
        return Command::SUCCESS;
    }

    /**
     * Broadcast prices for all users
     */
    protected function broadcastForAllUsers(): void
    {
        $users = User::whereHas('watchlist')->get();

        foreach ($users as $user) {
            $this->broadcastForUser($user->id);
        }
    }

    /**
     * Broadcast prices for a specific user
     */
    protected function broadcastForUser(int $userId): void
    {
        $watchlistSymbols = Watchlist::where('user_id', $userId)
            ->pluck('symbol')
            ->unique()
            ->toArray();

        if (empty($watchlistSymbols)) {
            return;
        }

        $priceData = [];

        foreach ($watchlistSymbols as $symbol) {
            try {
                $priceInfo = $this->ccxtService->getCurrentPrice($symbol);
                if ($priceInfo) {
                    $priceData[] = [
                        'symbol' => $symbol,
                        'current_price' => $priceInfo['current_price'] ?? 0,
                        'price_change_24h' => $priceInfo['price_change_24h'] ?? 0,
                        'volume_24h' => $priceInfo['volume_24h'] ?? 0,
                        'high_24h' => $priceInfo['high_24h'] ?? 0,
                        'low_24h' => $priceInfo['low_24h'] ?? 0,
                        'market_cap' => $priceInfo['market_cap'] ?? null,
                        'updated_at' => now()->toISOString(),
                    ];
                }
            } catch (\Exception $e) {
                Log::warning("Failed to fetch price for {$symbol}", [
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (!empty($priceData)) {
            event(new CryptoPriceUpdated($priceData, $userId));
        }
    }
}
