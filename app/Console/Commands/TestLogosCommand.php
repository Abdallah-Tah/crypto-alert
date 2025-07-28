<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestLogosCommand extends Command
{
    protected $signature = 'test:logos';
    protected $description = 'Test logo fetching from database';

    public function handle()
    {
        $this->info('Testing logo fetching from database...');

        // Test a few symbols
        $symbols = ['BTC', 'ETH', 'DOGE', 'ADA'];

        foreach ($symbols as $symbol) {
            $crypto = DB::table('cryptocurrencies')
                ->where('symbol', $symbol)
                ->orWhere('trading_symbol', $symbol)
                ->first();

            if ($crypto && $crypto->image_url) {
                $this->info("{$symbol}: {$crypto->image_url}");
            } else {
                $this->warn("{$symbol}: No logo found in database");
            }
        }

        return 0;
    }
}
