<?php

namespace App\Http\Controllers;

use App\Services\MarketIntelligenceService;
use App\Services\PortfolioManagementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MarketAnalysisController extends Controller
{
    private MarketIntelligenceService $marketService;
    private PortfolioManagementService $portfolioService;

    public function __construct(
        MarketIntelligenceService $marketService,
        PortfolioManagementService $portfolioService
    ) {
        $this->marketService = $marketService;
        $this->portfolioService = $portfolioService;
    }

    /**
     * Display market analysis dashboard
     */
    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('MarketAnalysis', [
            'title' => 'Market Analysis Dashboard'
        ]);
    }

    /**
     * Show full analysis page
     */
    public function showFullAnalysis(Request $request): InertiaResponse
    {
        return Inertia::render('MarketAnalysis/FullAnalysis', [
            'title' => 'Full Market Analysis'
        ]);
    }

    /**
     * Get full market analysis
     */
    public function getFullAnalysis(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $portfolioAnalysis = $this->portfolioService->generateFullPortfolioAnalysis($user->id);
            $marketData = $this->marketService->getAdvancedMarketInsights();

            return response()->json([
                'success' => true,
                'data' => [
                    'portfolio_analysis' => $portfolioAnalysis,
                    'market_overview' => $marketData['market_overview'],
                    'sentiment_analysis' => $marketData['sentiment'],
                    'technical_indicators' => $marketData['technical_indicators'],
                    'correlation_analysis' => $marketData['correlations'],
                    'risk_metrics' => $marketData['risk_metrics'],
                    'opportunity_scanner' => $marketData['opportunities'],
                    'macro_factors' => $marketData['macro_factors'],
                    'sector_rotation' => $marketData['sector_rotation'],
                    'liquidity_analysis' => $marketData['liquidity'],
                    'volatility_surface' => $marketData['volatility'],
                    'market_structure' => $marketData['market_structure'],
                    'institutional_flows' => $marketData['institutional_flows'],
                    'on_chain_metrics' => $marketData['on_chain'],
                    'regulatory_updates' => $marketData['regulatory'],
                    'recommendations' => $this->generateMarketRecommendations($portfolioAnalysis, $marketData)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate market analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get market sentiment with portfolio context
     */
    public function getMarketSentiment(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $sentimentData = $this->marketService->getMarketSentiment();
            $portfolioSentiment = $this->portfolioService->generateFullPortfolioAnalysis($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'fear_greed_index' => $sentimentData['fear_greed_index'],
                    'social_sentiment' => $sentimentData['social_sentiment'],
                    'technical_sentiment' => $sentimentData['technical_sentiment'],
                    'institutional_sentiment' => $sentimentData['institutional_sentiment'],
                    'portfolio_sentiment' => $portfolioSentiment['sentiment'] ?? 'neutral',
                    'sentiment_drivers' => $sentimentData['drivers'],
                    'sentiment_history' => $sentimentData['history'],
                    'portfolio_alignment' => $this->analyzeSentimentAlignment($sentimentData, $portfolioSentiment),
                    'recommendations' => $this->generateSentimentRecommendations($sentimentData, $portfolioSentiment)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get market sentiment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sector analysis and rotation opportunities
     */
    public function getSectorAnalysis(Request $request): JsonResponse
    {
        try {
            $sectorData = $this->marketService->getSectorAnalysis();

            return response()->json([
                'success' => true,
                'data' => [
                    'sector_performance' => $sectorData['performance'],
                    'rotation_signals' => $sectorData['rotation_signals'],
                    'sector_momentum' => $sectorData['momentum'],
                    'relative_strength' => $sectorData['relative_strength'],
                    'sector_flows' => $sectorData['flows'],
                    'undervalued_sectors' => $sectorData['undervalued'],
                    'overvalued_sectors' => $sectorData['overvalued'],
                    'emerging_narratives' => $sectorData['narratives'],
                    'sector_recommendations' => $sectorData['recommendations']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get sector analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get risk analysis and stress testing
     */
    public function getRiskAnalysis(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $portfolioAnalysis = $this->portfolioService->generateFullPortfolioAnalysis($user->id);
            $marketRisk = $this->marketService->getRiskMetrics();

            return response()->json([
                'success' => true,
                'data' => [
                    'portfolio_var' => $portfolioAnalysis['var'],
                    'stress_test_results' => $this->runStressTests($portfolioAnalysis),
                    'correlation_breakdown' => $portfolioAnalysis['correlations'],
                    'concentration_risk' => $portfolioAnalysis['concentration'],
                    'liquidity_risk' => $portfolioAnalysis['liquidity'],
                    'market_risk_factors' => $marketRisk['risk_factors'],
                    'tail_risk_scenarios' => $marketRisk['tail_risk'],
                    'hedging_opportunities' => $this->identifyHedgingOpportunities($portfolioAnalysis),
                    'risk_budget_allocation' => $this->calculateRiskBudget($portfolioAnalysis),
                    'risk_recommendations' => $this->generateRiskRecommendations($portfolioAnalysis, $marketRisk)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get risk analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get technical analysis for portfolio holdings
     */
    public function getTechnicalAnalysis(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $holdings = $this->portfolioService->getUserHoldings($user->id);
            $technicalData = [];

            foreach ($holdings as $holding) {
                $technical = $this->marketService->getTechnicalIndicators($holding['symbol']);
                $technicalData[$holding['symbol']] = [
                    'symbol' => $holding['symbol'],
                    'trend' => $technical['trend'],
                    'momentum' => $technical['momentum'],
                    'volatility' => $technical['volatility'],
                    'support_resistance' => $technical['support_resistance'],
                    'oscillators' => $technical['oscillators'],
                    'volume_analysis' => $technical['volume'],
                    'pattern_recognition' => $technical['patterns'],
                    'signal_strength' => $technical['signal_strength'],
                    'recommendation' => $technical['recommendation']
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'holdings_analysis' => $technicalData,
                    'portfolio_technical_score' => $this->calculatePortfolioTechnicalScore($technicalData),
                    'key_levels' => $this->identifyKeyLevels($technicalData),
                    'trend_alignment' => $this->analyzeTrendAlignment($technicalData),
                    'momentum_signals' => $this->aggregateMomentumSignals($technicalData),
                    'breakout_opportunities' => $this->identifyBreakoutOpportunities($technicalData),
                    'technical_recommendations' => $this->generateTechnicalRecommendations($technicalData)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get technical analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    // Private helper methods

    private function generateMarketRecommendations(array $portfolioAnalysis, array $marketData): array
    {
        return [
            'strategic_recommendations' => [
                'Increase DeFi allocation based on sector momentum',
                'Consider hedging with stablecoins given high volatility',
                'Reduce concentration in top 3 holdings'
            ],
            'tactical_recommendations' => [
                'Take profits on Layer-1 tokens',
                'Add exposure to Infrastructure plays',
                'Monitor regulatory developments'
            ],
            'risk_management' => [
                'Set stop-losses at 15% below current levels',
                'Diversify across more protocols',
                'Consider options for downside protection'
            ],
            'timing_recommendations' => [
                'DCA strategy recommended given market volatility',
                'Wait for pullback before major allocations',
                'Monthly rebalancing advised'
            ]
        ];
    }

    private function analyzeSentimentAlignment(array $sentiment, array $portfolio): array
    {
        return [
            'alignment_score' => 0.7,
            'conflicts' => ['Portfolio bullish while market fearful'],
            'opportunities' => ['Contrarian positioning could benefit from mean reversion']
        ];
    }

    private function generateSentimentRecommendations(array $sentiment, array $portfolio): array
    {
        return [
            'short_term' => ['Reduce risk given extreme fear'],
            'medium_term' => ['Accumulate quality assets'],
            'long_term' => ['Maintain strategic allocation']
        ];
    }

    private function runStressTests(array $portfolio): array
    {
        return [
            'market_crash_scenario' => ['loss' => -45, 'recovery_time' => '18 months'],
            'crypto_winter_scenario' => ['loss' => -70, 'recovery_time' => '3 years'],
            'black_swan_scenario' => ['loss' => -85, 'recovery_time' => '5+ years']
        ];
    }

    private function identifyHedgingOpportunities(array $portfolio): array
    {
        return [
            'put_options' => ['Available for BTC, ETH'],
            'inverse_products' => ['Consider BITI for hedging'],
            'stablecoin_allocation' => ['Increase to 20% during high volatility']
        ];
    }

    private function calculateRiskBudget(array $portfolio): array
    {
        return [
            'current_allocation' => ['High risk: 60%', 'Medium risk: 30%', 'Low risk: 10%'],
            'recommended_allocation' => ['High risk: 40%', 'Medium risk: 40%', 'Low risk: 20%']
        ];
    }

    private function generateRiskRecommendations(array $portfolio, array $market): array
    {
        return [
            'immediate_actions' => ['Reduce position sizes', 'Set stop losses'],
            'strategic_adjustments' => ['Increase diversification', 'Add defensive assets'],
            'monitoring_priorities' => ['Watch correlation increases', 'Monitor liquidity conditions']
        ];
    }

    private function calculatePortfolioTechnicalScore(array $technicalData): float
    {
        $scores = array_column($technicalData, 'signal_strength');
        return count($scores) > 0 ? array_sum($scores) / count($scores) : 0;
    }

    private function identifyKeyLevels(array $technicalData): array
    {
        return [
            'major_support' => ['BTC: $28,000', 'ETH: $1,800'],
            'major_resistance' => ['BTC: $32,000', 'ETH: $2,100']
        ];
    }

    private function analyzeTrendAlignment(array $technicalData): array
    {
        return [
            'aligned_with_trend' => 65,
            'against_trend' => 35,
            'trend_strength' => 'moderate'
        ];
    }

    private function aggregateMomentumSignals(array $technicalData): array
    {
        return [
            'bullish_momentum' => 40,
            'bearish_momentum' => 35,
            'neutral_momentum' => 25
        ];
    }

    private function identifyBreakoutOpportunities(array $technicalData): array
    {
        return [
            'imminent_breakouts' => ['SOL approaching resistance'],
            'breakdown_risks' => ['AVAX testing support']
        ];
    }

    private function generateTechnicalRecommendations(array $technicalData): array
    {
        return [
            'buy_signals' => ['ADA showing bullish divergence'],
            'sell_signals' => ['DOGE overbought on RSI'],
            'hold_recommendations' => ['BTC in consolidation phase']
        ];
    }
}
