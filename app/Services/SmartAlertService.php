<?php

namespace App\Services;

use App\Models\SmartAlert;
use App\Models\Transaction;
use App\Models\Watchlist;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\CCXTService;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SmartAlertService
{
    private NotificationService $notificationService;
    private CCXTService $ccxtService;

    public function __construct(NotificationService $notificationService, CCXTService $ccxtService)
    {
        $this->notificationService = $notificationService;
        $this->ccxtService = $ccxtService;
    }

    /**
     * Check all active alerts and trigger notifications as needed
     */
    public function checkAllAlerts(): array
    {
        $processedAlerts = [];
        $triggeredCount = 0;

        $activeAlerts = SmartAlert::active()->get();

        foreach ($activeAlerts as $alert) {
            try {
                $shouldTrigger = $this->shouldAlertTrigger($alert);
                
                if ($shouldTrigger) {
                    $this->triggerAlert($alert);
                    $triggeredCount++;
                }

                $processedAlerts[] = [
                    'alert_id' => $alert->id,
                    'type' => $alert->alert_type,
                    'triggered' => $shouldTrigger,
                    'processed_at' => now()
                ];
            } catch (\Exception $e) {
                Log::error("Error processing alert {$alert->id}: " . $e->getMessage());
                $processedAlerts[] = [
                    'alert_id' => $alert->id,
                    'type' => $alert->alert_type,
                    'error' => $e->getMessage(),
                    'processed_at' => now()
                ];
            }
        }

        return [
            'total_processed' => count($processedAlerts),
            'triggered_count' => $triggeredCount,
            'alerts' => $processedAlerts
        ];
    }

    /**
     * Check if a specific alert should trigger
     */
    private function shouldAlertTrigger(SmartAlert $alert): bool
    {
        switch ($alert->alert_type) {
            case 'price_target':
                return $this->checkPriceTargetAlert($alert);
            
            case 'portfolio_rebalance':
                return $this->checkPortfolioRebalanceAlert($alert);
            
            case 'tax_optimization':
                return $this->checkTaxOptimizationAlert($alert);
            
            case 'risk_threshold':
                return $this->checkRiskThresholdAlert($alert);
            
            case 'market_sentiment':
                return $this->checkMarketSentimentAlert($alert);
            
            case 'dca_reminder':
                return $this->checkDCAReminder($alert);
            
            default:
                return false;
        }
    }

    /**
     * Check price target alerts
     */
    private function checkPriceTargetAlert(SmartAlert $alert): bool
    {
        if (!$alert->symbol || !$alert->target_value) {
            return false;
        }

        try {
            $currentPrice = $this->ccxtService->getPrice($alert->symbol);
            return $alert->shouldTrigger($currentPrice);
        } catch (\Exception $e) {
            Log::error("Error getting price for {$alert->symbol}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check portfolio rebalance alerts
     */
    private function checkPortfolioRebalanceAlert(SmartAlert $alert): bool
    {
        $threshold = $alert->getConfigurationValue('threshold', 5); // Default 5%
        
        $user = $alert->user;
        $watchlist = Watchlist::where('user_id', $user->id)->get();
        
        if ($watchlist->isEmpty()) {
            return false;
        }

        $totalValue = $watchlist->sum('current_value');
        $maxDeviation = 0;

        foreach ($watchlist as $holding) {
            $currentAllocation = ($holding->current_value / $totalValue) * 100;
            $targetAllocation = $alert->getConfigurationValue('target_' . $holding->symbol, 20); // Default equal weight
            $deviation = abs($currentAllocation - $targetAllocation);
            $maxDeviation = max($maxDeviation, $deviation);
        }

        return $maxDeviation > $threshold;
    }

    /**
     * Check tax optimization alerts
     */
    private function checkTaxOptimizationAlert(SmartAlert $alert): bool
    {
        $minimumLoss = $alert->getConfigurationValue('minimum_loss', 100);
        
        $user = $alert->user;
        $potentialSavings = $this->calculateTaxLossHarvestingOpportunity($user->id);
        
        return $potentialSavings >= $minimumLoss;
    }

    /**
     * Check risk threshold alerts
     */
    private function checkRiskThresholdAlert(SmartAlert $alert): bool
    {
        $maxDrawdown = $alert->getConfigurationValue('max_drawdown', 20); // Default 20%
        
        $user = $alert->user;
        $currentDrawdown = $this->calculatePortfolioDrawdown($user->id);
        
        return $currentDrawdown > $maxDrawdown;
    }

    /**
     * Check market sentiment alerts
     */
    private function checkMarketSentimentAlert(SmartAlert $alert): bool
    {
        $extremeThreshold = $alert->getConfigurationValue('extreme_threshold', 20);
        
        // Mock sentiment check - in real implementation, use Fear & Greed Index API
        $currentSentiment = rand(0, 100);
        
        return $currentSentiment <= $extremeThreshold || $currentSentiment >= (100 - $extremeThreshold);
    }

    /**
     * Check DCA reminder alerts
     */
    private function checkDCAReminder(SmartAlert $alert): bool
    {
        $intervalDays = $alert->getConfigurationValue('interval_days', 7);
        
        if (!$alert->last_triggered_at) {
            return true; // First time
        }
        
        return $alert->last_triggered_at->diffInDays(now()) >= $intervalDays;
    }

    /**
     * Trigger an alert and send notification
     */
    private function triggerAlert(SmartAlert $alert): void
    {
        $alert->trigger();
        
        $notification = $this->generateNotificationForAlert($alert);
        
        $this->notificationService->createNotification(
            $alert->user_id,
            $notification['title'],
            $notification['message'],
            $notification['type']
        );
    }

    /**
     * Generate notification content for alert
     */
    private function generateNotificationForAlert(SmartAlert $alert): array
    {
        switch ($alert->alert_type) {
            case 'price_target':
                return [
                    'title' => 'Price Target Alert',
                    'message' => "{$alert->symbol} has reached your target price of {$alert->getFormattedTargetValue()}",
                    'type' => 'price_alert'
                ];
                
            case 'portfolio_rebalance':
                return [
                    'title' => 'Portfolio Rebalance Alert',
                    'message' => 'Your portfolio allocation has deviated beyond your threshold. Consider rebalancing.',
                    'type' => 'portfolio_alert'
                ];
                
            case 'tax_optimization':
                $savings = $this->calculateTaxLossHarvestingOpportunity($alert->user_id);
                return [
                    'title' => 'Tax Optimization Opportunity',
                    'message' => "Found potential tax-loss harvesting savings of $" . number_format($savings, 2),
                    'type' => 'tax_alert'
                ];
                
            case 'risk_threshold':
                return [
                    'title' => 'Risk Threshold Alert',
                    'message' => 'Portfolio risk has exceeded your maximum drawdown threshold',
                    'type' => 'risk_alert'
                ];
                
            case 'market_sentiment':
                return [
                    'title' => 'Market Sentiment Alert',
                    'message' => 'Market sentiment has reached extreme levels',
                    'type' => 'market_alert'
                ];
                
            case 'dca_reminder':
                return [
                    'title' => 'DCA Reminder',
                    'message' => 'Time for your regular dollar-cost averaging investment',
                    'type' => 'dca_reminder'
                ];
                
            default:
                return [
                    'title' => 'Smart Alert',
                    'message' => 'One of your smart alerts has been triggered',
                    'type' => 'general_alert'
                ];
        }
    }

    /**
     * Calculate tax loss harvesting opportunity
     */
    private function calculateTaxLossHarvestingOpportunity(int $userId): float
    {
        $watchlist = Watchlist::where('user_id', $userId)
            ->where('gain_loss', '<', 0)
            ->get();
        
        $totalLosses = $watchlist->sum('gain_loss');
        
        // Estimate tax savings (assuming 25% tax rate)
        return abs($totalLosses) * 0.25;
    }

    /**
     * Calculate portfolio drawdown
     */
    private function calculatePortfolioDrawdown(int $userId): float
    {
        $watchlist = Watchlist::where('user_id', $userId)->get();
        
        if ($watchlist->isEmpty()) {
            return 0;
        }
        
        $totalInvested = $watchlist->sum('amount_invested');
        $totalCurrentValue = $watchlist->sum('current_value');
        
        if ($totalInvested <= 0) {
            return 0;
        }
        
        $drawdown = (($totalInvested - $totalCurrentValue) / $totalInvested) * 100;
        
        return max(0, $drawdown);
    }

    /**
     * Get alerts summary for a user
     */
    public function getUserAlertsSummary(int $userId): array
    {
        $alerts = SmartAlert::forUser($userId)->get();
        
        $summary = [
            'total_alerts' => $alerts->count(),
            'active_alerts' => $alerts->where('is_active', true)->count(),
            'triggered_today' => $alerts->whereDate('last_triggered_at', today())->count(),
            'by_type' => []
        ];
        
        foreach (SmartAlert::ALERT_TYPES as $type => $label) {
            $typeAlerts = $alerts->where('alert_type', $type);
            $summary['by_type'][$type] = [
                'label' => $label,
                'count' => $typeAlerts->count(),
                'active' => $typeAlerts->where('is_active', true)->count()
            ];
        }
        
        return $summary;
    }
}