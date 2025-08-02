<?php

namespace App\Providers;

use App\Services\CCXTService;
use App\Services\AIAdvisorService;
use App\Services\AlertService;
use App\Services\WatchlistService;
use App\Services\UserPreferencesService;
use App\Services\NotificationService;
use App\Services\TaxReportingService;
use App\Services\SmartAlertService;
use Illuminate\Support\ServiceProvider;

class CryptoAdvisorServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register CCXTService as singleton
        $this->app->singleton(CCXTService::class, function ($app) {
            return new CCXTService();
        });

        // Register AIAdvisorService as singleton
        $this->app->singleton(AIAdvisorService::class, function ($app) {
            return new AIAdvisorService(
                $app->make(CCXTService::class)
            );
        });

        // Register AlertService with CCXTService dependency
        $this->app->singleton(AlertService::class, function ($app) {
            return new AlertService(
                $app->make(CCXTService::class)
            );
        });

        // Register WatchlistService with CCXTService dependency
        $this->app->singleton(WatchlistService::class, function ($app) {
            return new WatchlistService(
                $app->make(CCXTService::class)
            );
        });

        // Register UserPreferencesService as singleton
        $this->app->singleton(UserPreferencesService::class, function ($app) {
            return new UserPreferencesService();
        });

        // Register NotificationService with dependencies
        $this->app->singleton(NotificationService::class, function ($app) {
            return new NotificationService(
                $app->make(CCXTService::class),
                $app->make(AIAdvisorService::class)
            );
        });

        // Register TaxReportingService with dependencies
        $this->app->singleton(TaxReportingService::class, function ($app) {
            return new TaxReportingService(
                $app->make(WatchlistService::class),
                $app->make(CCXTService::class)
            );
        });

        // Register SmartAlertService with dependencies
        $this->app->singleton(SmartAlertService::class, function ($app) {
            return new SmartAlertService(
                $app->make(NotificationService::class),
                $app->make(CCXTService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
