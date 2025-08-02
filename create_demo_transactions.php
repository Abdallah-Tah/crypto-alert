<?php
// Demo transaction creator - run via: php create_demo_transactions.php

require_once 'vendor/autoload.php';

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Find the first user (or create one for demo)
$user = User::first();
if (!$user) {
    echo "No users found. Please register a user first.\n";
    exit(1);
}

echo "Creating demo transactions for user: {$user->email}\n";

// Create some realistic demo transactions
$demoTransactions = [
    // Buy transactions (cost basis)
    [
        'symbol' => 'BTC',
        'type' => 'buy',
        'quantity' => 0.5,
        'price_per_unit' => 42000,
        'fees' => 50,
        'exchange' => 'Coinbase',
        'transaction_date' => Carbon::create(2024, 1, 15),
        'notes' => 'Initial Bitcoin purchase'
    ],
    [
        'symbol' => 'ETH',
        'type' => 'buy',
        'quantity' => 2.0,
        'price_per_unit' => 2500,
        'fees' => 25,
        'exchange' => 'Coinbase',
        'transaction_date' => Carbon::create(2024, 2, 20),
        'notes' => 'Ethereum purchase'
    ],
    [
        'symbol' => 'BTC',
        'type' => 'buy',
        'quantity' => 0.25,
        'price_per_unit' => 38000,
        'fees' => 30,
        'exchange' => 'Binance',
        'transaction_date' => Carbon::create(2024, 3, 10),
        'notes' => 'DCA Bitcoin purchase'
    ],

    // Sell transactions (realized gains/losses)
    [
        'symbol' => 'BTC',
        'type' => 'sell',
        'quantity' => 0.25,
        'price_per_unit' => 65000,
        'fees' => 40,
        'exchange' => 'Coinbase',
        'transaction_date' => Carbon::create(2024, 6, 20),
        'notes' => 'Partial Bitcoin sale - long term gain'
    ],
    [
        'symbol' => 'ETH',
        'type' => 'sell',
        'quantity' => 0.5,
        'price_per_unit' => 2200,
        'fees' => 15,
        'exchange' => 'Coinbase',
        'transaction_date' => Carbon::create(2024, 8, 15),
        'notes' => 'Partial Ethereum sale - short term loss'
    ],
];

foreach ($demoTransactions as $transactionData) {
    $totalValue = $transactionData['quantity'] * $transactionData['price_per_unit'];

    Transaction::create([
        'user_id' => $user->id,
        'symbol' => $transactionData['symbol'],
        'type' => $transactionData['type'],
        'quantity' => $transactionData['quantity'],
        'price_per_unit' => $transactionData['price_per_unit'],
        'total_value' => $totalValue,
        'fees' => $transactionData['fees'],
        'exchange' => $transactionData['exchange'],
        'transaction_date' => $transactionData['transaction_date'],
        'notes' => $transactionData['notes'],
        'is_taxable' => true,
    ]);

    echo "Created {$transactionData['type']} transaction: {$transactionData['quantity']} {$transactionData['symbol']} @ \${$transactionData['price_per_unit']}\n";
}

echo "\n✅ Demo transactions created successfully!\n";
echo "You can now:\n";
echo "1. Visit /transactions to view and manage transactions\n";
echo "2. Generate a tax report to see realized gains/losses\n";
echo "3. Compare with watchlist unrealized gains/losses\n";
