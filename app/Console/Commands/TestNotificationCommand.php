<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Console\Command;

class TestNotificationCommand extends Command
{
    protected $signature = 'test:notification {user_id=1}';
    protected $description = 'Test notification creation and broadcasting';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }

        // Create a test watchlist entry if none exists
        $watchlist = Watchlist::firstOrCreate([
            'user_id' => $user->id,
            'symbol' => 'BTC'
        ], [
            'enabled' => true,
            'alert_type' => 'market_price',
            'alert_price' => 50000,
            'holdings_amount' => 0.1,
            'holdings_type' => 'coin_quantity',
            'purchase_price' => 45000
        ]);

        $this->info("Created/found watchlist: {$watchlist->symbol} for user {$user->name}");

        // Test notification service
        $notificationService = app(NotificationService::class);
        $alerts = $notificationService->checkAlerts();

        $this->info('Checked alerts. Results:');
        $this->info(json_encode($alerts, JSON_PRETTY_PRINT));

        return 0;
    }
}
