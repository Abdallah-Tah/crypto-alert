<?php

namespace App\Jobs;

use App\Services\AlertService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckPriceAlertsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AlertService $alertService): void
    {
        Log::info('Starting price alerts check');

        $triggeredAlerts = $alertService->checkAllPriceAlerts();

        if (count($triggeredAlerts) > 0) {
            Log::info('Price alerts triggered', [
                'count' => count($triggeredAlerts),
                'alerts' => $triggeredAlerts
            ]);
        }

        Log::info('Price alerts check completed');
    }
}
