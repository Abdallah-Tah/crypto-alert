<?php

use App\Console\Commands\CheckAlertsCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the alerts check to run every 2 minutes
Schedule::command(CheckAlertsCommand::class)->everyTwoMinutes();

// You can also register the command explicitly if needed
Artisan::command('alerts:check', function () {
    $notificationService = app(\App\Services\NotificationService::class);
    $triggeredAlerts = $notificationService->checkAlerts();

    if (empty($triggeredAlerts)) {
        $this->info('No alerts triggered.');
    } else {
        $this->info(sprintf('Processed %d triggered alerts.', count($triggeredAlerts)));
    }
})->purpose('Check cryptocurrency price alerts');
