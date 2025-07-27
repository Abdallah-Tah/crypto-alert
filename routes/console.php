<?php

use App\Console\Commands\CheckAlertsCommand;
use App\Console\Commands\UpdateCryptocurrenciesCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the alerts check to run every 2 minutes
Schedule::command(CheckAlertsCommand::class)->everyTwoMinutes();

// Schedule cryptocurrency list update every morning at 6:00 AM
Schedule::command(UpdateCryptocurrenciesCommand::class)
    ->dailyAt('06:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/crypto-update.log'));

// Also run a smaller update every 6 hours for price data
Schedule::command(UpdateCryptocurrenciesCommand::class, ['--limit=100'])
    ->everySixHours()
    ->withoutOverlapping()
    ->runInBackground();

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
