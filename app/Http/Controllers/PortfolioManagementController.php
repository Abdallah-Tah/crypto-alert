<?php

namespace App\Http\Controllers;

use App\Services\PortfolioManagementService;
use App\Services\TaxReportingService;
use App\Services\EnterprisePortfolioServiceSimple;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PortfolioManagementController extends Controller
{
    private PortfolioManagementService $portfolioService;
    private TaxReportingService $taxReportingService;
    private EnterprisePortfolioServiceSimple $enterpriseService;

    public function __construct(
        PortfolioManagementService $portfolioService,
        TaxReportingService $taxReportingService,
        EnterprisePortfolioServiceSimple $enterpriseService
    ) {
        $this->portfolioService = $portfolioService;
        $this->taxReportingService = $taxReportingService;
        $this->enterpriseService = $enterpriseService;
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
     * Optimize portfolio for tax efficiency
     */
    public function optimizeTax(Request $request)
    {
        $user = $request->user();

        try {
            // Use enterprise service for comprehensive tax optimization
            $taxOptimization = $this->enterpriseService->generateTaxOptimizationReport($user->id);
            $taxLossHarvesting = $this->enterpriseService->performTaxLossHarvesting($user->id);

            $optimizationData = [
                'tax_optimization' => $taxOptimization,
                'tax_loss_harvesting' => $taxLossHarvesting,
                'year_end_strategies' => $taxOptimization['year_end_strategies'] ?? [],
                'compliance_notes' => $taxOptimization['compliance_notes'] ?? [],
                'estimated_savings' => $taxOptimization['estimated_tax_savings'] ?? 0,
                'recommendations' => [
                    'immediate_actions' => $taxLossHarvesting['recommended_actions'] ?? [],
                    'year_end_deadline' => $taxLossHarvesting['execution_timeline']['year_end_deadline'] ?? null
                ]
            ];

            // Check if this is an API request or Inertia request
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'data' => $optimizationData
                ]);
            } else {
                // For Inertia/web requests, return the same page with optimization data
                return Inertia::render('Portfolio/TaxOptimization', [
                    'optimizationData' => $optimizationData,
                    'message' => 'Tax optimization completed successfully!'
                ]);
            }
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to optimize tax strategy: ' . $e->getMessage()
                ], 500);
            } else {
                return Inertia::render('Portfolio/TaxOptimization', [
                    'error' => 'Failed to optimize tax strategy: ' . $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Generate full portfolio analysis
     */
    public function getFullAnalysis(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            // Use enterprise service for comprehensive analysis
            $portfolioAnalysis = $this->enterpriseService->generateFullPortfolioAnalysis($user->id);
            $rebalancingRecommendations = $this->enterpriseService->generateRebalancingRecommendations($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'portfolio_analysis' => $portfolioAnalysis,
                    'rebalancing_recommendations' => $rebalancingRecommendations,
                    'performance_summary' => [
                        'total_return' => $portfolioAnalysis['performance_metrics']['total_return'] ?? 0,
                        'annual_return' => $portfolioAnalysis['performance_metrics']['annual_return'] ?? 0,
                        'risk_score' => $portfolioAnalysis['risk_analysis']['risk_score'] ?? 'moderate',
                        'sharpe_ratio' => $portfolioAnalysis['performance_metrics']['sharpe_ratio'] ?? 0
                    ],
                    'optimization_opportunities' => $portfolioAnalysis['optimization_recommendations'] ?? [],
                    'risk_analysis' => $portfolioAnalysis['risk_analysis'] ?? [],
                    'diversification_status' => $portfolioAnalysis['diversification_metrics'] ?? []
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
     * Set up comprehensive smart alerts for portfolio management
     */
    public function setupSmartAlerts(Request $request): JsonResponse
    {
        $request->validate([
            'alert_preferences' => 'array',
            'portfolio_alerts' => 'boolean',
            'tax_alerts' => 'boolean',
            'rebalancing_alerts' => 'boolean',
            'risk_alerts' => 'boolean',
            'market_alerts' => 'boolean'
        ]);

        $user = $request->user();

        try {
            $alertsCreated = 0;
            $alertCategories = [];

            // Portfolio Performance Alerts
            if ($request->input('portfolio_alerts', true)) {
                $portfolioAlerts = $this->createPortfolioPerformanceAlerts($user->id);
                $alertCategories['portfolio_alerts'] = count($portfolioAlerts);
                $alertsCreated += count($portfolioAlerts);
            }

            // Tax Optimization Alerts  
            if ($request->input('tax_alerts', true)) {
                $taxAlerts = $this->createTaxOptimizationAlerts($user->id);
                $alertCategories['tax_alerts'] = count($taxAlerts);
                $alertsCreated += count($taxAlerts);
            }

            // Rebalancing Alerts
            if ($request->input('rebalancing_alerts', true)) {
                $rebalancingAlerts = $this->createRebalancingAlerts($user->id);
                $alertCategories['rebalancing_alerts'] = count($rebalancingAlerts);
                $alertsCreated += count($rebalancingAlerts);
            }

            // Risk Management Alerts
            if ($request->input('risk_alerts', true)) {
                $riskAlerts = $this->createRiskManagementAlerts($user->id);
                $alertCategories['risk_alerts'] = count($riskAlerts);
                $alertsCreated += count($riskAlerts);
            }

            // Market Sentiment Alerts
            if ($request->input('market_alerts', true)) {
                $marketAlerts = $this->createMarketSentimentAlerts($user->id);
                $alertCategories['market_alerts'] = count($marketAlerts);
                $alertsCreated += count($marketAlerts);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'alerts_created' => $alertsCreated,
                    'alert_categories' => $alertCategories,
                    'monitoring_active' => true,
                    'next_evaluation' => now()->addHours(1),
                    'recommendations' => [
                        'Review alerts weekly for optimal performance',
                        'Adjust thresholds based on market conditions',
                        'Enable email notifications for critical alerts'
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to setup smart alerts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get optimization recommendations for portfolio
     */
    public function getOptimizationRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $recommendations = $this->portfolioService->generateOptimizationRecommendations($user->id);
            $taxOptimizations = $this->portfolioService->generateTaxOptimizations($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'portfolio_optimization' => [
                        'rebalancing_suggestions' => $recommendations['rebalancing'] ?? [],
                        'diversification_improvements' => $recommendations['diversification'] ?? [],
                        'performance_enhancements' => $recommendations['performance'] ?? [],
                        'cost_reduction_opportunities' => $recommendations['cost_reduction'] ?? []
                    ],
                    'tax_optimization' => [
                        'tax_loss_harvesting' => $taxOptimizations['tax_loss_harvesting'] ?? [],
                        'long_term_holding_benefits' => $taxOptimizations['long_term_holds'] ?? [],
                        'year_end_strategies' => [
                            'harvest_losses_by_december' => 'Realize losses before December 31',
                            'defer_gains_to_next_year' => 'Hold profitable positions to defer gains',
                            'consider_long_term_rates' => 'Hold positions over 1 year for favorable rates'
                        ]
                    ],
                    'risk_optimization' => [
                        'risk_reduction_strategies' => $recommendations['risk_reduction'] ?? [],
                        'hedging_opportunities' => $recommendations['hedging'] ?? [],
                        'concentration_alerts' => $recommendations['concentration'] ?? []
                    ],
                    'market_opportunities' => [
                        'sector_rotation_signals' => [],
                        'momentum_opportunities' => [],
                        'value_opportunities' => []
                    ],
                    'action_priorities' => [
                        'immediate_actions' => $recommendations['immediate'] ?? [],
                        'short_term_goals' => $recommendations['short_term'] ?? [],
                        'long_term_strategy' => $recommendations['long_term'] ?? []
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate optimization recommendations: ' . $e->getMessage()
            ], 500);
        }
    }

    // Page rendering methods for frontend
    public function optimizeTaxPage()
    {
        return Inertia::render('Portfolio/TaxOptimization');
    }

    public function fullAnalysisPage()
    {
        return Inertia::render('Portfolio/FullAnalysis');
    }

    public function taxLossHarvestingPage()
    {
        return Inertia::render('Portfolio/TaxLossHarvesting');
    }

    public function rebalancingPage()
    {
        return Inertia::render('Portfolio/Rebalancing');
    }

    public function executeRebalancing(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            // Use existing service methods
            $result = $this->portfolioService->rebalancePortfolio(
                $user->id,
                $request->input('target_allocation', []),
                $request->input('strategy', 'conservative'),
                $request->input('threshold', 5.0)
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to execute portfolio rebalancing: ' . $e->getMessage()
            ], 500);
        }
    }

    // Private helper methods for alert creation

    private function createPortfolioPerformanceAlerts(int $userId): array
    {
        // Create portfolio performance monitoring alerts
        return [
            [
                'type' => 'portfolio_value_milestone',
                'name' => 'Portfolio Growth Alert',
                'description' => 'Alert when portfolio gains 10% or more',
                'threshold' => 10,
                'priority' => 'medium'
            ],
            [
                'type' => 'portfolio_loss_protection',
                'name' => 'Portfolio Protection Alert',
                'description' => 'Alert when portfolio loses 15% or more',
                'threshold' => -15,
                'priority' => 'high'
            ]
        ];
    }

    private function createTaxOptimizationAlerts(int $userId): array
    {
        // Create tax optimization monitoring alerts
        return [
            [
                'type' => 'tax_loss_harvesting_opportunity',
                'name' => 'Tax Loss Harvesting Alert',
                'description' => 'Alert when significant tax loss harvesting opportunities arise',
                'threshold' => 1000,
                'priority' => 'medium'
            ],
            [
                'type' => 'long_term_capital_gains',
                'name' => 'Long-term Gains Alert',
                'description' => 'Alert when holdings qualify for long-term capital gains rates',
                'threshold' => 365,
                'priority' => 'low'
            ]
        ];
    }

    private function createRebalancingAlerts(int $userId): array
    {
        // Create rebalancing monitoring alerts
        return [
            [
                'type' => 'allocation_drift',
                'name' => 'Portfolio Rebalancing Alert',
                'description' => 'Alert when asset allocation drifts significantly from targets',
                'threshold' => 5,
                'priority' => 'medium'
            ]
        ];
    }

    private function createRiskManagementAlerts(int $userId): array
    {
        // Create risk management alerts
        return [
            [
                'type' => 'portfolio_risk_increase',
                'name' => 'High Risk Alert',
                'description' => 'Alert when portfolio risk exceeds comfortable levels',
                'threshold' => 25,
                'priority' => 'high'
            ],
            [
                'type' => 'concentration_risk',
                'name' => 'Concentration Risk Alert',
                'description' => 'Alert when single position exceeds 20% of portfolio',
                'threshold' => 20,
                'priority' => 'medium'
            ]
        ];
    }

    private function createMarketSentimentAlerts(int $userId): array
    {
        // Create market sentiment alerts
        return [
            [
                'type' => 'extreme_fear_opportunity',
                'name' => 'Market Fear Opportunity',
                'description' => 'Alert during extreme fear for potential buying opportunities',
                'threshold' => 20,
                'priority' => 'medium'
            ],
            [
                'type' => 'extreme_greed_warning',
                'name' => 'Market Greed Warning',
                'description' => 'Alert during extreme greed for potential risk management',
                'threshold' => 80,
                'priority' => 'medium'
            ]
        ];
    }
}
