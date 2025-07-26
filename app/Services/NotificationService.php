<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    private CCXTService $ccxtService;
    private AIAdvisorService $aiAdvisorService;

    public function __construct(CCXTService $ccxtService, AIAdvisorService $aiAdvisorService)
    {
        $this->ccxtService = $ccxtService;
        $this->aiAdvisorService = $aiAdvisorService;
    }

    /**
     * Check all active alerts and send notifications
     */
    public function checkAlerts(): array
    {
        $triggeredAlerts = [];

        // Get all watchlists with active alerts
        $watchlists = Watchlist::whereNotNull('alert_target')
            ->where('alert_enabled', true)
            ->with('user')
            ->get();

        if ($watchlists->isEmpty()) {
            return $triggeredAlerts;
        }

        // Get current prices for all symbols
        $symbols = $watchlists->pluck('symbol')->unique()->toArray();
        $currentPrices = $this->ccxtService->getPrices($symbols);

        foreach ($watchlists as $watchlist) {
            $symbol = $watchlist->symbol;
            $currentPrice = $currentPrices[$symbol] ?? null;

            if (!$currentPrice) {
                Log::warning("Price not available for symbol: {$symbol}");
                continue;
            }

            $alert = $this->evaluateAlert($watchlist, $currentPrice);

            if ($alert['triggered']) {
                $triggeredAlerts[] = $alert;
                $this->sendAlert($watchlist, $alert, $currentPrice);

                // Disable alert to prevent spam (user can re-enable)
                $watchlist->update(['alert_enabled' => false]);
            }
        }

        return $triggeredAlerts;
    }

    /**
     * Evaluate if an alert should be triggered
     */
    private function evaluateAlert(Watchlist $watchlist, float $currentPrice): array
    {
        $alertTarget = $watchlist->alert_target;
        $alertType = $watchlist->alert_type ?? 'market';

        $triggered = false;
        $message = '';
        $alertDirection = '';

        if ($alertType === 'market') {
            // Market price alerts
            if ($currentPrice >= $alertTarget) {
                $triggered = true;
                $alertDirection = 'above';
                $message = "{$watchlist->symbol} has reached your target price of $" . number_format($alertTarget, 2);
            }
        } elseif ($alertType === 'purchase' && $watchlist->purchase_price) {
            // Purchase price-based alerts (percentage gains/losses)
            $percentageChange = (($currentPrice - $watchlist->purchase_price) / $watchlist->purchase_price) * 100;

            if (abs($percentageChange) >= abs($alertTarget)) {
                $triggered = true;
                $alertDirection = $percentageChange > 0 ? 'gain' : 'loss';
                $message = "{$watchlist->symbol} has " .
                    ($percentageChange > 0 ? 'gained' : 'lost') . ' ' .
                    number_format(abs($percentageChange), 2) . '% from your purchase price';
            }
        }

        return [
            'triggered' => $triggered,
            'message' => $message,
            'direction' => $alertDirection,
            'current_price' => $currentPrice,
            'percentage_change' => isset($percentageChange) ? $percentageChange : null
        ];
    }

    /**
     * Send alert notification to user
     */
    private function sendAlert(Watchlist $watchlist, array $alert, float $currentPrice): void
    {
        $user = $watchlist->user;

        // Create notification record
        $notification = Notification::create([
            'user_id' => $user->id,
            'watchlist_id' => $watchlist->id,
            'type' => 'price_alert',
            'title' => "Alert: {$watchlist->symbol}",
            'message' => $alert['message'],
            'data' => [
                'symbol' => $watchlist->symbol,
                'current_price' => $currentPrice,
                'alert_target' => $watchlist->alert_target,
                'alert_type' => $watchlist->alert_type,
                'percentage_change' => $alert['percentage_change'],
                'direction' => $alert['direction']
            ],
            'read_at' => null
        ]);

        // Send email notification if enabled
        if ($user->email_notifications ?? true) {
            $this->sendEmailAlert($user, $watchlist, $alert, $currentPrice);
        }

        // Send push notification if enabled
        if ($user->push_notifications ?? true) {
            $this->sendPushNotification($user, $notification);
        }

        Log::info("Alert sent for {$watchlist->symbol} to user {$user->id}");
    }

    /**
     * Send email alert
     */
    private function sendEmailAlert(User $user, Watchlist $watchlist, array $alert, float $currentPrice): void
    {
        try {
            // Mail::to($user->email)->send(new PriceAlertMail($watchlist, $alert, $currentPrice));
            Log::info("Email alert sent to {$user->email} for {$watchlist->symbol}");
        } catch (\Exception $e) {
            Log::error("Failed to send email alert: " . $e->getMessage());
        }
    }

    /**
     * Send push notification
     */
    private function sendPushNotification(User $user, Notification $notification): void
    {
        // Implement push notification logic here
        // This could integrate with Firebase, OneSignal, etc.
        Log::info("Push notification sent to user {$user->id}");
    }

    /**
     * Get portfolio alerts (significant changes in total value)
     */
    public function checkPortfolioAlerts(User $user): array
    {
        $cacheKey = "portfolio_value_{$user->id}";
        $previousValue = Cache::get($cacheKey);

        $watchlistService = app(WatchlistService::class);
        $currentPortfolio = $watchlistService->getPortfolioSummary($user->id);
        $currentValue = $currentPortfolio['total_value'];

        $alerts = [];

        if ($previousValue && $currentValue) {
            $percentageChange = (($currentValue - $previousValue) / $previousValue) * 100;

            // Alert for significant portfolio changes (>= 10%)
            if (abs($percentageChange) >= 10) {
                $alerts[] = [
                    'type' => 'portfolio_change',
                    'message' => "Your portfolio has " .
                        ($percentageChange > 0 ? 'gained' : 'lost') . ' ' .
                        number_format(abs($percentageChange), 2) . '% in value',
                    'current_value' => $currentValue,
                    'previous_value' => $previousValue,
                    'percentage_change' => $percentageChange
                ];
            }
        }

        // Cache current value for next comparison
        Cache::put($cacheKey, $currentValue, now()->addHours(1));

        return $alerts;
    }

    /**
     * Get market sentiment alerts
     */
    public function getMarketSentimentAlerts(): array
    {
        try {
            $sentiment = $this->aiAdvisorService->getMarketSentiment();
            $alerts = [];

            // Alert for extreme market conditions
            if ($sentiment['fear_greed_index'] <= 20) {
                $alerts[] = [
                    'type' => 'market_sentiment',
                    'severity' => 'high',
                    'message' => 'Extreme Fear detected in the market - potential buying opportunity',
                    'data' => $sentiment
                ];
            } elseif ($sentiment['fear_greed_index'] >= 80) {
                $alerts[] = [
                    'type' => 'market_sentiment',
                    'severity' => 'high',
                    'message' => 'Extreme Greed detected in the market - consider taking profits',
                    'data' => $sentiment
                ];
            }

            return $alerts;
        } catch (\Exception $e) {
            Log::error("Failed to get market sentiment alerts: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if ($notification) {
            $notification->update(['read_at' => now()]);
            return true;
        }

        return false;
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(int $userId, int $limit = 50): array
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get unread notification count
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
