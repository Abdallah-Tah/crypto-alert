<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Analytics\PortfolioAnalyticsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class StorePortfolioSnapshots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'portfolio:store-snapshots 
                            {--user= : Specific user ID to store snapshot for}
                            {--all : Store snapshots for all users with watchlists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Store portfolio snapshots for historical performance tracking';

    protected PortfolioAnalyticsService $analyticsService;

    public function __construct(PortfolioAnalyticsService $analyticsService)
    {
        parent::__construct();
        $this->analyticsService = $analyticsService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $specificUserId = $this->option('user');
        $allUsers = $this->option('all');

        if ($specificUserId) {
            return $this->storeForUser((int) $specificUserId);
        }

        if ($allUsers) {
            return $this->storeForAllUsers();
        }

        $this->error('Please specify either --user=ID or --all flag');
        return Command::FAILURE;
    }

    /**
     * Store snapshot for a specific user
     */
    private function storeForUser(int $userId): int
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found");
                return Command::FAILURE;
            }

            $this->info("Storing portfolio snapshot for user: {$user->email}");
            $this->analyticsService->storePortfolioSnapshot($user);
            $this->info("✅ Snapshot stored successfully");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to store snapshot for user {$userId}: " . $e->getMessage());
            Log::error("Portfolio snapshot error for user {$userId}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Store snapshots for all users with watchlists
     */
    private function storeForAllUsers(): int
    {
        try {
            $users = User::whereHas('watchlist')->get();
            $successCount = 0;
            $errorCount = 0;

            $this->info("Found {$users->count()} users with watchlists");

            foreach ($users as $user) {
                try {
                    $this->line("Processing user: {$user->email}");
                    $this->analyticsService->storePortfolioSnapshot($user);
                    $successCount++;
                    $this->info("  ✅ Snapshot stored");
                } catch (\Exception $e) {
                    $errorCount++;
                    $this->error("  ❌ Failed: " . $e->getMessage());
                    Log::error("Portfolio snapshot error for user {$user->id}", [
                        'user_email' => $user->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->newLine();
            $this->info("Portfolio snapshots completed:");
            $this->info("✅ Success: {$successCount}");
            $this->info("❌ Errors: {$errorCount}");

            return $errorCount === 0 ? Command::SUCCESS : Command::FAILURE;
        } catch (\Exception $e) {
            $this->error("Failed to process users: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
