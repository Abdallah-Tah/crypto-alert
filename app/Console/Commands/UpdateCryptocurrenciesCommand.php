<?php

namespace App\Console\Commands;

use App\Models\Cryptocurrency;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class UpdateCryptocurrenciesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crypto:update-list 
                           {--limit=500 : Number of cryptocurrencies to fetch (max 500)}
                           {--force : Force update even if recently updated}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the cryptocurrencies list from CoinGecko API with current market data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = min((int) $this->option('limit'), 500); // CoinGecko's limit
        $force = $this->option('force');

        $this->info("🚀 Starting cryptocurrency list update...");
        $this->info("📊 Fetching top {$limit} cryptocurrencies from CoinGecko API");

        try {
            // Check if we've updated recently (within last 6 hours)
            if (!$force) {
                $recentUpdate = Cryptocurrency::where('updated_at', '>', now()->subHours(6))->exists();
                if ($recentUpdate) {
                    $this->warn('⏰ Cryptocurrencies were updated recently. Use --force to override.');
                    return Command::SUCCESS;
                }
            }

            // Fetch all coins list first (for ID mapping)
            $this->line('📋 Fetching complete coins list...');
            $coinsListResponse = Http::timeout(60)->get('https://api.coingecko.com/api/v3/coins/list');

            if (!$coinsListResponse->successful()) {
                throw new \Exception('Failed to fetch coins list from CoinGecko');
            }

            $coinsList = collect($coinsListResponse->json())->keyBy('id');
            $this->info("✅ Retrieved {$coinsList->count()} total coins");

            // Fetch market data with pagination
            $allMarketData = collect();
            $perPage = 250; // CoinGecko's max per page
            $pages = ceil($limit / $perPage);

            $progressBar = $this->output->createProgressBar($pages);
            $progressBar->start();

            for ($page = 1; $page <= $pages; $page++) {
                $currentLimit = min($perPage, $limit - ($page - 1) * $perPage);

                $marketResponse = Http::timeout(60)->get('https://api.coingecko.com/api/v3/coins/markets', [
                    'vs_currency' => 'usd',
                    'order' => 'market_cap_desc',
                    'per_page' => $currentLimit,
                    'page' => $page,
                    'sparkline' => false,
                    'price_change_percentage' => '24h'
                ]);

                if (!$marketResponse->successful()) {
                    $this->error("Failed to fetch market data for page {$page}");
                    continue;
                }

                $allMarketData = $allMarketData->concat($marketResponse->json());
                $progressBar->advance();

                // Rate limiting - CoinGecko allows 50 calls/minute
                if ($page < $pages) {
                    sleep(1);
                }
            }

            $progressBar->finish();
            $this->newLine();

            $this->info("💾 Processing {$allMarketData->count()} cryptocurrencies...");

            $updateCount = 0;
            $insertCount = 0;
            $deactivateCount = 0;

            DB::transaction(function () use ($allMarketData, &$updateCount, &$insertCount, &$deactivateCount) {
                // Process each cryptocurrency
                foreach ($allMarketData as $coin) {
                    $tradingSymbol = strtoupper($coin['symbol']) . '/USDT';

                    $data = [
                        'coingecko_id' => $coin['id'],
                        'symbol' => strtoupper($coin['symbol']),
                        'name' => $coin['name'],
                        'trading_symbol' => $tradingSymbol,
                        'image_url' => $coin['image'] ?? null,
                        'current_price' => $coin['current_price'],
                        'market_cap' => $coin['market_cap'],
                        'market_cap_rank' => $coin['market_cap_rank'],
                        'total_volume' => $coin['total_volume'],
                        'price_change_24h' => $coin['price_change_percentage_24h'],
                        'is_active' => true,
                        'last_updated' => now(),
                    ];

                    $existing = Cryptocurrency::where('coingecko_id', $coin['id'])->first();

                    if ($existing) {
                        $existing->update($data);
                        $updateCount++;
                    } else {
                        Cryptocurrency::create($data);
                        $insertCount++;
                    }
                }

                // Deactivate coins not in the current top list but still keep historical data
                $activeIds = $allMarketData->pluck('id')->toArray();
                $deactivateCount = Cryptocurrency::where('is_active', true)
                    ->whereNotIn('coingecko_id', $activeIds)
                    ->update(['is_active' => false]);
            });

            $this->newLine();
            $this->info("✅ Cryptocurrency update completed successfully!");
            $this->line("📈 Summary:");
            $this->line("   • Updated: {$updateCount} cryptocurrencies");
            $this->line("   • Added: {$insertCount} new cryptocurrencies");
            $this->line("   • Deactivated: {$deactivateCount} cryptocurrencies");
            $this->line("   • Total active: " . Cryptocurrency::active()->count());

            // Log the successful update
            Log::info('Cryptocurrencies updated successfully', [
                'updated' => $updateCount,
                'inserted' => $insertCount,
                'deactivated' => $deactivateCount,
                'total_active' => Cryptocurrency::active()->count(),
            ]);

        } catch (\Exception $e) {
            $this->error("❌ Failed to update cryptocurrencies: " . $e->getMessage());
            Log::error('Failed to update cryptocurrencies', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
