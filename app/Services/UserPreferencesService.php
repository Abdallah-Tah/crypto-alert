<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage as LaravelStorage;

class UserPreferencesService
{
    /**
     * Get the appropriate storage instance
     */
    private function getStorage()
    {
        // In testing environment, use Laravel's storage
        if (app()->environment('testing')) {
            return LaravelStorage::fake();
        }

        // In production with NativePHP, use Native storage
        if (class_exists('\Native\Laravel\Facades\Storage')) {
            return app('\Native\Laravel\Facades\Storage');
        }

        // Fallback to Laravel storage
        return LaravelStorage::disk('local');
    }
    /**
     * Get user preferences from local storage
     *
     * @param User $user
     * @return array
     */
    public function getUserPreferences(User $user): array
    {
        try {
            $defaultPreferences = [
                'base_currency' => 'USD',
                'notifications_enabled' => true,
                'theme' => 'light',
                'risk_level' => 'moderate',
                'price_check_interval' => 60,
                'notification_sound' => true,
                'alert_types' => [
                    'price_alerts' => true,
                    'ai_suggestions' => true,
                    'market_updates' => false
                ]
            ];

            $storageKey = "user_preferences_{$user->id}";
            $storage = $this->getStorage();
            $storedPreferences = $storage->get($storageKey);

            if ($storedPreferences) {
                return array_merge($defaultPreferences, json_decode($storedPreferences, true));
            }

            return $defaultPreferences;

        } catch (Exception $e) {
            Log::error("Failed to get user preferences: " . $e->getMessage());
            return $this->getDefaultPreferences();
        }
    }

    /**
     * Save user preferences to local storage
     *
     * @param User $user
     * @param array $preferences
     * @return bool
     */
    public function saveUserPreferences(User $user, array $preferences): bool
    {
        try {
            $storageKey = "user_preferences_{$user->id}";
            $currentPreferences = $this->getUserPreferences($user);

            // Merge with existing preferences
            $updatedPreferences = array_merge($currentPreferences, $preferences);

            // Validate preferences
            $validatedPreferences = $this->validatePreferences($updatedPreferences);

            $storage = $this->getStorage();
            $storage->put($storageKey, json_encode($validatedPreferences));

            Log::info("User preferences saved", [
                'user_id' => $user->id,
                'preferences' => $validatedPreferences
            ]);

            return true;

        } catch (Exception $e) {
            Log::error("Failed to save user preferences: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update specific preference
     *
     * @param User $user
     * @param string $key
     * @param mixed $value
     * @return bool
     */
    public function updatePreference(User $user, string $key, $value): bool
    {
        try {
            $preferences = $this->getUserPreferences($user);
            $preferences[$key] = $value;

            return $this->saveUserPreferences($user, $preferences);

        } catch (Exception $e) {
            Log::error("Failed to update preference: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get default preferences
     *
     * @return array
     */
    private function getDefaultPreferences(): array
    {
        return [
            'base_currency' => 'USD',
            'notifications_enabled' => true,
            'theme' => 'light',
            'risk_level' => 'moderate',
            'price_check_interval' => 60,
            'notification_sound' => true,
            'alert_types' => [
                'price_alerts' => true,
                'ai_suggestions' => true,
                'market_updates' => false
            ]
        ];
    }

    /**
     * Validate preferences data
     *
     * @param array $preferences
     * @return array
     */
    private function validatePreferences(array $preferences): array
    {
        $validatedPreferences = [];

        // Validate base currency
        $validCurrencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH'];
        $validatedPreferences['base_currency'] = in_array($preferences['base_currency'] ?? 'USD', $validCurrencies)
            ? $preferences['base_currency']
            : 'USD';

        // Validate boolean preferences
        $validatedPreferences['notifications_enabled'] = (bool) ($preferences['notifications_enabled'] ?? true);
        $validatedPreferences['notification_sound'] = (bool) ($preferences['notification_sound'] ?? true);

        // Validate theme
        $validThemes = ['light', 'dark', 'auto'];
        $validatedPreferences['theme'] = in_array($preferences['theme'] ?? 'light', $validThemes)
            ? $preferences['theme']
            : 'light';

        // Validate risk level
        $validRiskLevels = ['low', 'moderate', 'high'];
        $validatedPreferences['risk_level'] = in_array($preferences['risk_level'] ?? 'moderate', $validRiskLevels)
            ? $preferences['risk_level']
            : 'moderate';

        // Validate price check interval (in seconds)
        $interval = $preferences['price_check_interval'] ?? 60;
        $validatedPreferences['price_check_interval'] = is_numeric($interval) && $interval >= 30 && $interval <= 3600
            ? (int) $interval
            : 60;

        // Validate alert types
        $alertTypes = $preferences['alert_types'] ?? [];
        $validatedPreferences['alert_types'] = [
            'price_alerts' => (bool) ($alertTypes['price_alerts'] ?? true),
            'ai_suggestions' => (bool) ($alertTypes['ai_suggestions'] ?? true),
            'market_updates' => (bool) ($alertTypes['market_updates'] ?? false)
        ];

        return $validatedPreferences;
    }

    /**
     * Reset preferences to default
     *
     * @param User $user
     * @return bool
     */
    public function resetPreferences(User $user): bool
    {
        try {
            $storageKey = "user_preferences_{$user->id}";
            $storage = $this->getStorage();
            $storage->delete($storageKey);

            Log::info("User preferences reset to default", ['user_id' => $user->id]);

            return true;

        } catch (Exception $e) {
            Log::error("Failed to reset user preferences: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Export user preferences (for backup/sync)
     *
     * @param User $user
     * @return array|null
     */
    public function exportPreferences(User $user): ?array
    {
        try {
            $preferences = $this->getUserPreferences($user);

            return [
                'user_id' => $user->id,
                'preferences' => $preferences,
                'exported_at' => now()->toISOString()
            ];

        } catch (Exception $e) {
            Log::error("Failed to export user preferences: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Import user preferences (from backup/sync)
     *
     * @param User $user
     * @param array $exportedData
     * @return bool
     */
    public function importPreferences(User $user, array $exportedData): bool
    {
        try {
            if (!isset($exportedData['preferences'])) {
                return false;
            }

            return $this->saveUserPreferences($user, $exportedData['preferences']);

        } catch (Exception $e) {
            Log::error("Failed to import user preferences: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get preference by key with fallback
     *
     * @param User $user
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getPreference(User $user, string $key, $default = null)
    {
        try {
            $preferences = $this->getUserPreferences($user);
            return $preferences[$key] ?? $default;

        } catch (Exception $e) {
            Log::error("Failed to get preference: " . $e->getMessage());
            return $default;
        }
    }
}
