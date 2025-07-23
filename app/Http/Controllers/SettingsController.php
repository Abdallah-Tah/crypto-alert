<?php

namespace App\Http\Controllers;

use App\Services\UserPreferencesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct(
        private UserPreferencesService $preferencesService
    ) {
    }

    /**
     * Display the settings page
     */
    public function index()
    {
        $user = Auth::user();
        $preferences = $this->preferencesService->getUserPreferences($user);

        return Inertia::render('Settings', [
            'preferences' => $preferences,
            'availableCurrencies' => ['USD', 'EUR', 'GBP', 'BTC', 'ETH'],
            'availableThemes' => ['light', 'dark', 'auto'],
            'availableRiskLevels' => ['low', 'moderate', 'high'],
        ]);
    }

    /**
     * Update user preferences
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'base_currency' => 'required|in:USD,EUR,GBP,BTC,ETH',
            'notifications_enabled' => 'required|boolean',
            'theme' => 'required|in:light,dark,auto',
            'risk_level' => 'required|in:low,moderate,high',
            'price_check_interval' => 'required|integer|min:30|max:3600',
            'notification_sound' => 'required|boolean',
            'alert_types' => 'required|array',
            'alert_types.price_alerts' => 'required|boolean',
            'alert_types.ai_suggestions' => 'required|boolean',
            'alert_types.market_updates' => 'required|boolean',
        ]);

        $user = Auth::user();
        $success = $this->preferencesService->saveUserPreferences($user, $request->all());

        if ($success) {
            return back()->with('success', 'Preferences updated successfully');
        }

        return back()->withErrors(['error' => 'Failed to update preferences']);
    }

    /**
     * Reset preferences to default
     */
    public function resetPreferences()
    {
        $user = Auth::user();
        $success = $this->preferencesService->resetPreferences($user);

        if ($success) {
            return back()->with('success', 'Preferences reset to default');
        }

        return back()->withErrors(['error' => 'Failed to reset preferences']);
    }

    /**
     * Export user preferences
     */
    public function exportPreferences()
    {
        $user = Auth::user();
        $exportData = $this->preferencesService->exportPreferences($user);

        if ($exportData) {
            return response()->json($exportData)->header(
                'Content-Disposition',
                'attachment; filename="crypto-alert-preferences.json"'
            );
        }

        return back()->withErrors(['error' => 'Failed to export preferences']);
    }

    /**
     * Import user preferences
     */
    public function importPreferences(Request $request)
    {
        $request->validate([
            'preferences_file' => 'required|file|mimes:json|max:1024', // 1MB max
        ]);

        try {
            $fileContent = file_get_contents($request->file('preferences_file')->path());
            $importData = json_decode($fileContent, true);

            if (!$importData) {
                return back()->withErrors(['preferences_file' => 'Invalid preferences file format']);
            }

            $user = Auth::user();
            $success = $this->preferencesService->importPreferences($user, $importData);

            if ($success) {
                return back()->with('success', 'Preferences imported successfully');
            }

            return back()->withErrors(['error' => 'Failed to import preferences']);

        } catch (\Exception $e) {
            return back()->withErrors(['preferences_file' => 'Error reading preferences file']);
        }
    }
}
