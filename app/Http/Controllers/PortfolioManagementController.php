<?php

namespace App\Http\Controllers;

use App\Services\PortfolioManagementService;
use App\Services\TaxReportingService;
use App\Services\AlertService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PortfolioManagementController extends Controller
{
    private PortfolioManagementService $portfolioService;
    private TaxReportingService $taxReportingService;
    private AlertService $alertService;

    public function __construct(
        PortfolioManagementService $portfolioService,
        TaxReportingService $taxReportingService,
        AlertService $alertService
    ) {
        $this->portfolioService = $portfolioService;
        $this->taxReportingService = $taxReportingService;
        $this->alertService = $alertService;
    }

    /**
     * Show tax optimization page
     */
    public function showTaxOptimization(Request $request): InertiaResponse
    {
        return Inertia::render('Portfolio/TaxOptimization', [
            'title' => 'Tax Optimization'
        ]);
    }

    /**
     * Show tax-loss harvesting page
     */
    public function showTaxLossHarvesting(Request $request): InertiaResponse
    {
        return Inertia::render('Portfolio/TaxLossHarvesting', [
            'title' => 'Tax-Loss Harvesting'
        ]);
    }

    /**
     * Show portfolio rebalancing page
     */
    public function showRebalancing(Request $request): InertiaResponse
    {
        return Inertia::render('Portfolio/Rebalancing', [
            'title' => 'Portfolio Rebalancing'
        ]);
    }

    /**
     * Show full portfolio analysis page
     */
    public function showFullAnalysis(Request $request): InertiaResponse
    {
        return Inertia::render('Portfolio/FullAnalysis', [
            'title' => 'Full Portfolio Analysis'
        ]);
    }

    /**
     * Optimize taxes for the user's portfolio
     */
    public function optimizeTax(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            // Get current tax optimization suggestions
            $taxReport = $this->taxReportingService->generateTaxReport($user->id, date('Y'));
            $optimizations = $this->portfolioService->generateTaxOptimizations($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'current_tax_liability' => $taxReport['total_tax_liability'] ?? 0,
                    'potential_savings' => $optimizations['potential_savings'] ?? 0,
                    'tax_loss_harvesting_opportunities' => $optimizations['tax_loss_harvesting'] ?? [],
                    'long_term_holds' => $optimizations['long_term_holds'] ?? [],
                    'short_term_optimization' => $optimizations['short_term_optimization'] ?? [],
                    'recommended_actions' => $optimizations['recommended_actions'] ?? [],
                    'optimization_summary' => [
                        'total_unrealized_losses' => $optimizations['total_unrealized_losses'] ?? 0,
                        'harvestable_losses' => $optimizations['harvestable_losses'] ?? 0,
                        'projected_tax_savings' => $optimizations['projected_tax_savings'] ?? 0,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to optimize taxes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Execute tax-loss harvesting strategy
     */
    public function executeTaxLossHarvesting(Request $request): JsonResponse
    {
        $request->validate([
            'holdings' => 'required|array',
            'holdings.*.symbol' => 'required|string',
            'holdings.*.amount' => 'required|numeric|min:0',
            'strategy' => 'required|string|in:aggressive,moderate,conservative'
        ]);

        $user = $request->user();
        $holdings = $request->input('holdings');
        $strategy = $request->input('strategy');

        try {
            $result = $this->portfolioService->executeTaxLossHarvesting($user->id, $holdings, $strategy);

            return response()->json([
                'success' => true,
                'data' => [
                    'transactions_executed' => $result['transactions'],
                    'losses_harvested' => $result['losses_harvested'],
                    'tax_savings' => $result['tax_savings'],
                    'new_portfolio_allocation' => $result['new_allocation'],
                    'wash_sale_warnings' => $result['wash_sale_warnings'] ?? []
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to execute tax-loss harvesting: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rebalance portfolio based on target allocation
     */
    public function rebalancePortfolio(Request $request): JsonResponse
    {
        $request->validate([
            'target_allocation' => 'required|array',
            'target_allocation.*.symbol' => 'required|string',
            'target_allocation.*.percentage' => 'required|numeric|min:0|max:100',
            'rebalance_strategy' => 'required|string|in:threshold,calendar,band',
            'threshold_percentage' => 'nullable|numeric|min:1|max:50'
        ]);

        $user = $request->user();
        $targetAllocation = $request->input('target_allocation');
        $strategy = $request->input('rebalance_strategy');
        $threshold = $request->input('threshold_percentage', 5);

        try {
            $result = $this->portfolioService->rebalancePortfolio($user->id, $targetAllocation, $strategy, $threshold);

            return response()->json([
                'success' => true,
                'data' => [
                    'rebalance_needed' => $result['rebalance_needed'],
                    'current_allocation' => $result['current_allocation'],
                    'target_allocation' => $result['target_allocation'],
                    'recommended_trades' => $result['recommended_trades'],
                    'cost_analysis' => $result['cost_analysis'],
                    'tax_implications' => $result['tax_implications'],
                    'rebalance_summary' => [
                        'total_trades' => count($result['recommended_trades']),
                        'estimated_costs' => $result['estimated_costs'],
                        'deviation_from_target' => $result['deviation_percentage']
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to rebalance portfolio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get full portfolio analysis
     */
    public function getFullAnalysis(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $analysis = $this->portfolioService->generateFullPortfolioAnalysis($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'performance_metrics' => $analysis['performance'],
                    'risk_analysis' => $analysis['risk'],
                    'diversification_analysis' => $analysis['diversification'],
                    'correlation_matrix' => $analysis['correlations'],
                    'value_at_risk' => $analysis['var'],
                    'sharpe_ratio' => $analysis['sharpe_ratio'],
                    'volatility_analysis' => $analysis['volatility'],
                    'trend_analysis' => $analysis['trends'],
                    'sector_allocation' => $analysis['sectors'],
                    'recommendations' => $analysis['recommendations'],
                    'benchmark_comparison' => $analysis['benchmark'],
                    'liquidity_analysis' => $analysis['liquidity']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate portfolio analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set up smart alerts for portfolio management
     */
    public function setupSmartAlerts(Request $request): JsonResponse
    {
        $request->validate([
            'alert_types' => 'required|array',
            'alert_types.*' => 'string|in:price_target,portfolio_rebalance,tax_optimization,risk_threshold,market_sentiment',
            'configurations' => 'required|array'
        ]);

        $user = $request->user();
        $alertTypes = $request->input('alert_types');
        $configurations = $request->input('configurations');

        try {
            $alerts = [];
            foreach ($alertTypes as $alertType) {
                $config = $configurations[$alertType] ?? [];
                $alert = $this->alertService->createSmartAlert($user->id, $alertType, $config);
                $alerts[] = $alert;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'alerts_created' => count($alerts),
                    'alert_details' => $alerts,
                    'monitoring_active' => true
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to setup alerts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get portfolio optimization recommendations
     */
    public function getOptimizationRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $recommendations = $this->portfolioService->generateOptimizationRecommendations($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'diversification_recommendations' => $recommendations['diversification'],
                    'cost_reduction_opportunities' => $recommendations['cost_reduction'],
                    'performance_enhancement' => $recommendations['performance'],
                    'risk_management' => $recommendations['risk_management'],
                    'tax_efficiency' => $recommendations['tax_efficiency'],
                    'priority_actions' => $recommendations['priority_actions'],
                    'long_term_strategy' => $recommendations['long_term_strategy']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get optimization recommendations: ' . $e->getMessage()
            ], 500);
        }
    }
}
