<?php

namespace App\Console\Commands;

use App\Events\NotificationCreated;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Console\Command;

class TestBroadcastCommand extends Command
{
    protected $signature = 'test:broadcast {user_id=1}';
    protected $description = 'Test notification broadcasting via Reverb';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }

        // Create a test notification
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'test',
            'title' => 'Test Notification',
            'message' => 'This is a test notification to verify real-time broadcasting works!',
            'data' => [
                'test' => true,
                'timestamp' => now()->toISOString()
            ],
            'read_at' => null
        ]);

        $this->info("Created test notification: {$notification->title}");

        // Broadcast the notification
        broadcast(new NotificationCreated($notification));

        $this->info("Broadcasted notification via Reverb to user {$user->name}");
        $this->info("Check your browser console/network tab for WebSocket events");

        return 0;
    }
}
