<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AlertService
{
    private $ccxtService;

    public function __construct(CCXTService $ccxtService)
    {
        $this->ccxtService = $ccxtService;
    }

    /**
     * Check price alerts for all users
     *
     * @return array
     */
    public function checkAllPriceAlerts(): array
    {
        try {
            $triggeredAlerts = [];

            // Get all enabled watchlist items with alerts
            $watchlistItems = DB::table('watchlists')
                ->where('enabled', true)
                ->whereNotNull('alert_price')
                ->get();

            foreach ($watchlistItems as $item) {
                $currentPrice = $this->ccxtService->getCurrentPrice($item->symbol);

                if ($currentPrice && $this->shouldTriggerAlert($item, $currentPrice['price'])) {
                    $alert = $this->triggerPriceAlert($item, $currentPrice['price']);
                    if ($alert) {
                        $triggeredAlerts[] = $alert;
                    }
                }
            }

            return $triggeredAlerts;

        } catch (Exception $e) {
            Log::error("Failed to check price alerts: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Determine if an alert should be triggered
     *
     * @param object $watchlistItem
     * @param float $currentPrice
     * @return bool
     */
    private function shouldTriggerAlert($watchlistItem, float $currentPrice): bool
    {
        // Simple price crossing logic - you can enhance this
        return $currentPrice >= $watchlistItem->alert_price;
    }

    /**
     * Trigger a price alert
     *
     * @param object $watchlistItem
     * @param float $currentPrice
     * @return array|null
     */
    public function triggerPriceAlert($watchlistItem, float $currentPrice): ?array
    {
        try {
            $user = User::find($watchlistItem->user_id);
            if (!$user) {
                return null;
            }

            // Send push notification
            $this->sendPushNotification(
                "🚨 {$watchlistItem->symbol} Alert!",
                "{$watchlistItem->symbol} just crossed \${$currentPrice}. Time to check your portfolio!",
                $user
            );

            // Log the alert
            $alertData = [
                'user_id' => $user->id,
                'symbol' => $watchlistItem->symbol,
                'alert_price' => $watchlistItem->alert_price,
                'triggered_price' => $currentPrice,
                'triggered_at' => now(),
                'type' => 'price_alert'
            ];

            // Store in alerts table (you'll need to create this migration)
            DB::table('alerts')->insert($alertData);

            return $alertData;

        } catch (Exception $e) {
            Log::error("Failed to trigger price alert: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Send push notification using NativePHP
     *
     * @param string $title
     * @param string $body
     * @param User $user
     * @return bool
     */
    public function sendPushNotification(string $title, string $body, User $user = null): bool
    {
        try {
            // For now, just log the notification instead of using native notifications
            Log::info("Push notification triggered", [
                'title' => $title,
                'body' => $body,
                'user_id' => $user ? $user->id : null
            ]);

            // TODO: Implement actual push notification when NativePHP is properly configured

            return true;

        } catch (Exception $e) {
            Log::error("Failed to send push notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send AI suggestion alert
     *
     * @param string $symbol
     * @param string $suggestion
     * @param User $user
     * @return bool
     */
    public function sendAIAlert(string $symbol, string $suggestion, User $user): bool
    {
        try {
            $title = "💡 AI Suggestion for {$symbol}";
            $body = substr($suggestion, 0, 100) . '...';

            $this->sendPushNotification($title, $body, $user);

            // Log AI alert
            DB::table('alerts')->insert([
                'user_id' => $user->id,
                'symbol' => $symbol,
                'message' => $suggestion,
                'triggered_at' => now(),
                'type' => 'ai_suggestion'
            ]);

            return true;

        } catch (Exception $e) {
            Log::error("Failed to send AI alert: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user's alert history
     *
     * @param User $user
     * @param int $limit
     * @return array
     */
    public function getUserAlerts(User $user, int $limit = 20): array
    {
        try {
            return DB::table('alerts')
                ->where('user_id', $user->id)
                ->orderBy('triggered_at', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();

        } catch (Exception $e) {
            Log::error("Failed to get user alerts: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Mark alert as acknowledged
     *
     * @param int $alertId
     * @param User $user
     * @return bool
     */
    public function acknowledgeAlert(int $alertId, User $user): bool
    {
        try {
            $updated = DB::table('alerts')
                ->where('id', $alertId)
                ->where('user_id', $user->id)
                ->update([
                    'acknowledged' => true,
                    'acknowledged_at' => now()
                ]);

            return $updated > 0;

        } catch (Exception $e) {
            Log::error("Failed to acknowledge alert: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create price alert for a watchlist item
     *
     * @param int $watchlistId
     * @param float $alertPrice
     * @return bool
     */
    public function createPriceAlert(int $watchlistId, float $alertPrice): bool
    {
        try {
            $updated = DB::table('watchlists')
                ->where('id', $watchlistId)
                ->update(['alert_price' => $alertPrice]);

            return $updated > 0;

        } catch (Exception $e) {
            Log::error("Failed to create price alert: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Remove price alert
     *
     * @param int $watchlistId
     * @return bool
     */
    public function removePriceAlert(int $watchlistId): bool
    {
        try {
            $updated = DB::table('watchlists')
                ->where('id', $watchlistId)
                ->update(['alert_price' => null]);

            return $updated > 0;

        } catch (Exception $e) {
            Log::error("Failed to remove price alert: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a smart alert for portfolio management
     */
    public function createSmartAlert(int $userId, array $alertData): bool
    {
        try {
            // Create alert record in database
            $alertId = DB::table('alerts')->insertGetId([
                'user_id' => $userId,
                'type' => $alertData['type'] ?? 'portfolio',
                'category' => $alertData['category'] ?? 'general',
                'name' => $alertData['name'],
                'condition' => $alertData['condition'] ?? null,
                'description' => $alertData['description'] ?? '',
                'priority' => $alertData['priority'] ?? 'medium',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Smart alert created', [
                'alert_id' => $alertId,
                'user_id' => $userId,
                'type' => $alertData['type'] ?? 'portfolio'
            ]);

            return true;

        } catch (Exception $e) {
            Log::error("Failed to create smart alert: " . $e->getMessage());
            return false;
        }
    }
}
