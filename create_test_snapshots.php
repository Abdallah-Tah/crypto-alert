<?php

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// Create some historical snapshots for testing
$userId = 1;
$baseValue = 8480.54;

// Create snapshots for the last 30 days
for ($i = 29; $i >= 1; $i--) {
    $date = Carbon::now()->subDays($i);
    $randomChange = (rand(-100, 150) / 1000); // Random change between -10% and +15%
    $value = $baseValue * (1 + $randomChange);

    DB::table('portfolio_snapshots')->insert([
        'user_id' => $userId,
        'total_value' => $value,
        'snapshot_date' => $date,
        'metadata' => json_encode([
            'total_coins' => 4,
            'alerts_active' => 4,
            'change_24h' => $value * $randomChange,
            'change_percent' => $randomChange * 100,
            'btc_price' => 119332 * (1 + $randomChange * 0.8),
            'eth_price' => 3842.13 * (1 + $randomChange * 0.9),
            'created_at' => $date->toISOString(),
        ]),
        'created_at' => $date,
        'updated_at' => $date,
    ]);
}

echo "Created 29 historical snapshots\n";
