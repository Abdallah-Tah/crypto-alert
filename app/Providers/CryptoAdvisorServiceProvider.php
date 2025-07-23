<?php

namespace App\Providers;

use App\Services\CCXTService;
use App\Services\AIAdvisorService;
use App\Services\AlertService;
use App\Services\WatchlistService;
use App\Services\UserPreferencesService;
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
            return new AIAdvisorService();
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
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
