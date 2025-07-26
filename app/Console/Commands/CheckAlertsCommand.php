<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckAlertsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all active price alerts and send notifications';

    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting alert check...');

        try {
            $triggeredAlerts = $this->notificationService->checkAlerts();

            if (empty($triggeredAlerts)) {
                $this->info('No alerts triggered.');
            } else {
                $this->info(sprintf('Processed %d triggered alerts:', count($triggeredAlerts)));

                foreach ($triggeredAlerts as $alert) {
                    $this->line("- {$alert['message']}");
                }
            }

            // Also check market sentiment alerts
            $sentimentAlerts = $this->notificationService->getMarketSentimentAlerts();
            if (!empty($sentimentAlerts)) {
                $this->info(sprintf('Found %d market sentiment alerts:', count($sentimentAlerts)));

                foreach ($sentimentAlerts as $alert) {
                    $this->line("- {$alert['message']}");
                }
            }

            $this->info('Alert check completed successfully.');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error checking alerts: ' . $e->getMessage());
            Log::error('Alert check failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
