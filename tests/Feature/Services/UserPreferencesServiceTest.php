<?php

use App\Models\User;
use App\Services\UserPreferencesService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->preferencesService = new UserPreferencesService();
});

describe('UserPreferencesService', function () {
    it('returns default preferences for new user', function () {
        $preferences = $this->preferencesService->getUserPreferences($this->user);

        expect($preferences)->toHaveKeys([
            'base_currency',
            'notifications_enabled',
            'theme',
            'risk_level',
            'price_check_interval',
            'notification_sound',
            'alert_types'
        ])
            ->and($preferences['base_currency'])->toBe('USD')
            ->and($preferences['notifications_enabled'])->toBeTrue()
            ->and($preferences['theme'])->toBe('light')
            ->and($preferences['risk_level'])->toBe('moderate')
            ->and($preferences['alert_types'])->toHaveKeys([
                    'price_alerts',
                    'ai_suggestions',
                    'market_updates'
                ]);
    });

    it('can save user preferences', function () {
        $newPreferences = [
            'base_currency' => 'EUR',
            'theme' => 'dark',
            'risk_level' => 'high',
            'notifications_enabled' => false
        ];

        $saved = $this->preferencesService->saveUserPreferences($this->user, $newPreferences);
        expect($saved)->toBeTrue();

        $preferences = $this->preferencesService->getUserPreferences($this->user);
        expect($preferences['base_currency'])->toBe('EUR')
            ->and($preferences['theme'])->toBe('dark')
            ->and($preferences['risk_level'])->toBe('high')
            ->and($preferences['notifications_enabled'])->toBeFalse();
    });

    it('can update specific preference', function () {
        $updated = $this->preferencesService->updatePreference($this->user, 'theme', 'dark');
        expect($updated)->toBeTrue();

        $preferences = $this->preferencesService->getUserPreferences($this->user);
        expect($preferences['theme'])->toBe('dark');
    });

    it('validates preferences data', function () {
        $invalidPreferences = [
            'base_currency' => 'INVALID',
            'theme' => 'invalid_theme',
            'risk_level' => 'invalid_risk',
            'price_check_interval' => -1
        ];

        $saved = $this->preferencesService->saveUserPreferences($this->user, $invalidPreferences);
        expect($saved)->toBeTrue(); // Still saves but with validated values

        $preferences = $this->preferencesService->getUserPreferences($this->user);
        expect($preferences['base_currency'])->toBe('USD') // Falls back to default
            ->and($preferences['theme'])->toBe('light')
            ->and($preferences['risk_level'])->toBe('moderate')
            ->and($preferences['price_check_interval'])->toBe(60);
    });

    it('can reset preferences to default', function () {
        // First set some custom preferences
        $this->preferencesService->saveUserPreferences($this->user, [
            'theme' => 'dark',
            'base_currency' => 'EUR'
        ]);

        // Reset to defaults
        $reset = $this->preferencesService->resetPreferences($this->user);
        expect($reset)->toBeTrue();

        $preferences = $this->preferencesService->getUserPreferences($this->user);
        expect($preferences['theme'])->toBe('light')
            ->and($preferences['base_currency'])->toBe('USD');
    });

    it('can export preferences', function () {
        $this->preferencesService->saveUserPreferences($this->user, [
            'theme' => 'dark',
            'base_currency' => 'EUR'
        ]);

        $exported = $this->preferencesService->exportPreferences($this->user);

        expect($exported)->toHaveKeys(['user_id', 'preferences', 'exported_at'])
            ->and($exported['user_id'])->toBe($this->user->id)
            ->and($exported['preferences']['theme'])->toBe('dark')
            ->and($exported['preferences']['base_currency'])->toBe('EUR');
    });

    it('can import preferences', function () {
        $importData = [
            'preferences' => [
                'theme' => 'dark',
                'base_currency' => 'GBP',
                'risk_level' => 'low'
            ]
        ];

        $imported = $this->preferencesService->importPreferences($this->user, $importData);
        expect($imported)->toBeTrue();

        $preferences = $this->preferencesService->getUserPreferences($this->user);
        expect($preferences['theme'])->toBe('dark')
            ->and($preferences['base_currency'])->toBe('GBP')
            ->and($preferences['risk_level'])->toBe('low');
    });

    it('can get specific preference with fallback', function () {
        $theme = $this->preferencesService->getPreference($this->user, 'theme', 'fallback');
        expect($theme)->toBe('light'); // Default value

        $nonExistent = $this->preferencesService->getPreference($this->user, 'non_existent', 'fallback');
        expect($nonExistent)->toBe('fallback');
    });

    it('validates currency values', function () {
        $reflection = new ReflectionClass($this->preferencesService);
        $method = $reflection->getMethod('validatePreferences');
        $method->setAccessible(true);

        $validated = $method->invoke($this->preferencesService, [
            'base_currency' => 'JPY' // Not in valid list
        ]);

        expect($validated['base_currency'])->toBe('USD'); // Falls back to default
    });

    it('validates interval ranges', function () {
        $reflection = new ReflectionClass($this->preferencesService);
        $method = $reflection->getMethod('validatePreferences');
        $method->setAccessible(true);

        // Test below minimum
        $validated = $method->invoke($this->preferencesService, [
            'price_check_interval' => 10 // Below 30 minimum
        ]);
        expect($validated['price_check_interval'])->toBe(60);

        // Test above maximum
        $validated = $method->invoke($this->preferencesService, [
            'price_check_interval' => 5000 // Above 3600 maximum
        ]);
        expect($validated['price_check_interval'])->toBe(60);

        // Test valid value
        $validated = $method->invoke($this->preferencesService, [
            'price_check_interval' => 120
        ]);
        expect($validated['price_check_interval'])->toBe(120);
    });

    it('handles storage errors gracefully', function () {
        // Mock the user to have an invalid ID to trigger storage errors
        $user = new User();
        $user->id = null;

        $preferences = $this->preferencesService->getUserPreferences($user);
        expect($preferences)->toBeArray(); // Should return defaults

        $saved = $this->preferencesService->saveUserPreferences($user, ['theme' => 'dark']);
        expect($saved)->toBeFalse(); // Should fail gracefully
    });
});
