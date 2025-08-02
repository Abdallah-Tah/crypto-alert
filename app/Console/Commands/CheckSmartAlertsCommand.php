<?php

namespace App\Console\Commands;

use App\Services\SmartAlertService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckSmartAlertsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:check-smart';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all smart alerts and trigger notifications for matching conditions';

    private SmartAlertService $smartAlertService;

    public function __construct(SmartAlertService $smartAlertService)
    {
        parent::__construct();
        $this->smartAlertService = $smartAlertService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting smart alerts check...');
        
        try {
            $results = $this->smartAlertService->checkAllAlerts();
            
            $this->info("Processed {$results['total_processed']} alerts");
            $this->info("Triggered {$results['triggered_count']} notifications");
            
            if ($results['triggered_count'] > 0) {
                $this->table(
                    ['Alert ID', 'Type', 'Triggered', 'Status'],
                    collect($results['alerts'])
                        ->filter(fn($alert) => $alert['triggered'] ?? false)
                        ->map(fn($alert) => [
                            $alert['alert_id'],
                            $alert['type'],
                            $alert['triggered'] ? 'Yes' : 'No',
                            isset($alert['error']) ? 'Error: ' . $alert['error'] : 'Success'
                        ])
                        ->toArray()
                );
            }
            
            Log::info('Smart alerts check completed', $results);
            
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error checking smart alerts: ' . $e->getMessage());
            Log::error('Smart alerts check failed: ' . $e->getMessage());
            
            return self::FAILURE;
        }
    }
}
