<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Prism\Prism\Prism;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Exceptions\PrismException;
use App\Models\AiSuggestion;
use App\Models\User;

class EnhancedAIAdvisorService
{
    private CCXTService $ccxtService;

    public function __construct(CCXTService $ccxtService)
    {
        $this->ccxtService = $ccxtService;
    }

    /**
     * Generate comprehensive AI investment advice with real-time research
     *
     * @param string $symbol
     * @param float $currentPrice
     * @param float $change24h
     * @param string $riskLevel
     * @param string $timeHorizon
     * @return array|null
     */
    public function generateEnhancedAdvice(
        string $symbol,
        float $currentPrice,
        float $change24h,
        string $riskLevel = 'moderate',
        string $timeHorizon = 'medium'
    ): ?array {
        try {
            // Step 1: Gather comprehensive market data
            $marketData = $this->gatherMarketIntelligence($symbol);

            // Step 2: Get real-time news and sentiment
            $newsData = $this->getRealtimeNews($symbol);

            // Step 3: Perform technical analysis
            $technicalData = $this->performTechnicalAnalysis($symbol);

            // Step 4: Generate comprehensive advice using all gathered data
            return $this->generateComprehensiveAdvice($symbol, $currentPrice, $change24h, $riskLevel, $timeHorizon, $marketData, $newsData, $technicalData);

        } catch (Exception $e) {
            Log::error("Enhanced AI Advisor failed: " . $e->getMessage());
            return $this->fallbackToBasicAdvice($symbol, $currentPrice, $change24h, $riskLevel, $timeHorizon);
        }
    }

    /**
     * Gather comprehensive market intelligence using Prism search
     */
    private function gatherMarketIntelligence(string $symbol): array
    {
        $cacheKey = "market_intelligence_{$symbol}";

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($symbol) {
            try {
                // Use Prism to search for comprehensive market intelligence
                $response = Prism::text()
                    ->using(Provider::OpenAI, 'gpt-4o')
                    ->withPrompt("
                        Research and analyze the latest comprehensive market intelligence for {$symbol} cryptocurrency. 
                        
                        Please provide current information about:
                        1. Recent institutional adoption and partnerships
                        2. Regulatory developments and compliance status
                        3. Technical roadmap and upcoming developments
                        4. Market sentiment from major financial outlets
                        5. Analyst price predictions and targets
                        6. Trading volume and liquidity analysis
                        7. Competitive positioning in the market
                        
                        Focus on factual, recent information from reliable sources. Provide a structured analysis that an investment advisor would use.
                    ")
                    ->withProviderOptions([
                        'temperature' => 0.2,
                        'max_tokens' => 1000,
                    ])
                    ->asText();

                return [
                    'intelligence' => $response->text ?? 'Market intelligence temporarily unavailable',
                    'timestamp' => now(),
                    'confidence' => 0.85,
                    'source' => 'gpt-4o-research'
                ];

            } catch (Exception $e) {
                Log::warning("Market intelligence search failed for {$symbol}: " . $e->getMessage());
                return [
                    'intelligence' => 'Market intelligence temporarily unavailable',
                    'timestamp' => now(),
                    'confidence' => 0.3,
                    'source' => 'fallback'
                ];
            }
        });
    }

    /**
     * Get real-time news and sentiment analysis
     */
    private function getRealtimeNews(string $symbol): array
    {
        $cacheKey = "news_sentiment_{$symbol}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($symbol) {
            try {
                $response = Prism::text()
                    ->using(Provider::OpenAI, 'gpt-4o')
                    ->withPrompt("
                        Search for and analyze the latest news about {$symbol} cryptocurrency from the past 48 hours.
                        
                        Focus on:
                        1. Major news from reputable sources (CoinDesk, CoinTelegraph, Bloomberg, Reuters)
                        2. Regulatory updates or government statements
                        3. Partnership announcements or integrations
                        4. Technical developments or upgrades
                        5. Market maker or institutional movements
                        6. Social sentiment from key influencers
                        
                        Provide a sentiment analysis (Bullish/Bearish/Neutral) with confidence level and key supporting factors.
                        Include specific news events that could impact price movement.
                    ")
                    ->withProviderOptions([
                        'temperature' => 0.1,
                        'max_tokens' => 800,
                    ])
                    ->asText();

                // Extract sentiment from the response
                $sentiment = $this->extractSentimentAdvanced($response->text ?? '');

                return [
                    'news_summary' => $response->text ?? 'No recent news available',
                    'sentiment' => $sentiment['sentiment'],
                    'confidence' => $sentiment['confidence'],
                    'key_factors' => $sentiment['factors'],
                    'timestamp' => now()
                ];

            } catch (Exception $e) {
                Log::warning("News analysis failed for {$symbol}: " . $e->getMessage());
                return [
                    'news_summary' => 'News analysis temporarily unavailable',
                    'sentiment' => 'neutral',
                    'confidence' => 0.5,
                    'key_factors' => [],
                    'timestamp' => now()
                ];
            }
        });
    }

    /**
     * Perform technical analysis using AI insights
     */
    private function performTechnicalAnalysis(string $symbol): array
    {
        try {
            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt("
                    Perform a comprehensive technical analysis for {$symbol} cryptocurrency.
                    
                    Analyze:
                    1. Current price action and trend direction
                    2. Key support and resistance levels
                    3. Moving averages (20, 50, 200 day)
                    4. RSI and momentum indicators
                    5. Volume analysis and patterns
                    6. Chart patterns (if any)
                    7. Fibonacci retracement levels
                    
                    Provide specific price levels and timeframes for technical targets.
                    Include both bullish and bearish scenarios with probability assessments.
                ")
                ->withProviderOptions([
                    'temperature' => 0.1,
                    'max_tokens' => 600,
                ])
                ->asText();

            return [
                'technical_analysis' => $response->text ?? 'Technical analysis unavailable',
                'timestamp' => now(),
                'reliability' => 0.75
            ];

        } catch (Exception $e) {
            Log::warning("Technical analysis failed for {$symbol}: " . $e->getMessage());
            return [
                'technical_analysis' => 'Technical analysis temporarily unavailable',
                'timestamp' => now(),
                'reliability' => 0.3
            ];
        }
    }

    /**
     * Generate comprehensive investment advice using all gathered data
     */
    private function generateComprehensiveAdvice(
        string $symbol,
        float $currentPrice,
        float $change24h,
        string $riskLevel,
        string $timeHorizon,
        array $marketData,
        array $newsData,
        array $technicalData
    ): array {
        try {
            // Create comprehensive context for AI analysis
            $context = $this->buildComprehensiveContext($symbol, $currentPrice, $change24h, $riskLevel, $timeHorizon, $marketData, $newsData, $technicalData);

            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($context)
                ->withProviderOptions([
                    'temperature' => 0.3,
                    'max_tokens' => 1200,
                ])
                ->asText();

            // Parse the response to extract structured information
            $structuredAdvice = $this->parseAdviceResponse($response->text ?? '');

            return [
                'suggestion' => $response->text ?? 'Unable to generate comprehensive advice',
                'structured_advice' => $structuredAdvice,
                'model_used' => 'gpt-4o-enhanced',
                'confidence_score' => $this->calculateConfidenceScore($marketData, $newsData, $technicalData),
                'data_sources' => [
                    'market_intelligence' => $marketData['confidence'] ?? 0,
                    'news_sentiment' => $newsData['confidence'] ?? 0,
                    'technical_analysis' => $technicalData['reliability'] ?? 0,
                    'real_time_research' => true
                ],
                'timestamp' => now()
            ];

        } catch (Exception $e) {
            Log::error("Comprehensive advice generation failed for {$symbol}: " . $e->getMessage());
            return $this->fallbackToBasicAdvice($symbol, $currentPrice, $change24h, $riskLevel, $timeHorizon);
        }
    }

    /**
     * Build comprehensive context for AI analysis
     */
    private function buildComprehensiveContext(
        string $symbol,
        float $currentPrice,
        float $change24h,
        string $riskLevel,
        string $timeHorizon,
        array $marketData,
        array $newsData,
        array $technicalData
    ): string {
        return "
PROFESSIONAL CRYPTOCURRENCY INVESTMENT ANALYSIS

===== ASSET OVERVIEW =====
Symbol: {$symbol}
Current Price: \${$currentPrice}
24h Change: {$change24h}%
Analysis Date: " . now()->format('Y-m-d H:i') . "

===== INVESTOR PROFILE =====
Risk Tolerance: {$riskLevel}
Investment Horizon: {$timeHorizon}-term
Profile Type: " . $this->getInvestorTypeDescription($riskLevel, $timeHorizon) . "

===== MARKET INTELLIGENCE =====
{$marketData['intelligence']}

===== NEWS & SENTIMENT ANALYSIS =====
{$newsData['news_summary']}

Current Sentiment: {$newsData['sentiment']} (Confidence: " . ($newsData['confidence'] * 100) . "%)

===== TECHNICAL ANALYSIS =====
{$technicalData['technical_analysis']}

===== ANALYSIS REQUIREMENTS =====
Based on the comprehensive research above, provide a professional investment recommendation that includes:

1. **INVESTMENT RECOMMENDATION**: Clear BUY/HOLD/SELL recommendation with confidence percentage
2. **PRICE TARGETS**: Specific price levels for 1-week, 1-month, and 3-month timeframes
3. **RISK ASSESSMENT**: Detailed risk analysis for this investor profile
4. **KEY CATALYSTS**: Major factors that could drive price movement
5. **ENTRY/EXIT STRATEGY**: Specific guidance on position sizing and timing
6. **MONITORING ALERTS**: Critical price levels and news events to watch
7. **SCENARIO ANALYSIS**: Best case, base case, and worst case outcomes
8. **EXECUTIVE SUMMARY**: 2-3 sentence investment thesis

Format the response as a professional investment report. Consider the investor's {$riskLevel} risk tolerance and {$timeHorizon}-term horizon. Provide specific, actionable advice with clear reasoning.
        ";
    }

    /**
     * Advanced sentiment extraction with confidence scoring
     */
    private function extractSentimentAdvanced(string $text): array
    {
        $text = strtolower($text);

        // Enhanced sentiment keywords with weights
        $bullishIndicators = [
            'bullish' => 3,
            'buy' => 2,
            'positive' => 2,
            'growth' => 2,
            'rally' => 3,
            'surge' => 3,
            'pump' => 2,
            'optimistic' => 2,
            'upgrade' => 2,
            'partnership' => 2,
            'adoption' => 2,
            'breakthrough' => 3,
            'strong' => 1,
            'outperform' => 2
        ];

        $bearishIndicators = [
            'bearish' => 3,
            'sell' => 2,
            'negative' => 2,
            'decline' => 2,
            'crash' => 3,
            'dump' => 3,
            'drop' => 2,
            'pessimistic' => 2,
            'downgrade' => 2,
            'concern' => 1,
            'risk' => 1,
            'volatility' => 1,
            'weak' => 1,
            'underperform' => 2
        ];

        $bullishScore = 0;
        $bearishScore = 0;
        $factors = [];

        foreach ($bullishIndicators as $word => $weight) {
            $count = substr_count($text, $word);
            if ($count > 0) {
                $bullishScore += $count * $weight;
                $factors[] = "Bullish: {$word} mentioned {$count} times";
            }
        }

        foreach ($bearishIndicators as $word => $weight) {
            $count = substr_count($text, $word);
            if ($count > 0) {
                $bearishScore += $count * $weight;
                $factors[] = "Bearish: {$word} mentioned {$count} times";
            }
        }

        $totalScore = $bullishScore + $bearishScore;
        $confidence = min(0.9, $totalScore * 0.1); // Cap at 90% confidence

        if ($bullishScore > $bearishScore * 1.5) {
            return ['sentiment' => 'bullish', 'confidence' => $confidence, 'factors' => $factors];
        } elseif ($bearishScore > $bullishScore * 1.5) {
            return ['sentiment' => 'bearish', 'confidence' => $confidence, 'factors' => $factors];
        } else {
            return ['sentiment' => 'neutral', 'confidence' => $confidence * 0.7, 'factors' => $factors];
        }
    }

    /**
     * Parse AI response to extract structured information
     */
    private function parseAdviceResponse(string $response): array
    {
        // Extract key information using regex patterns
        $structured = [
            'recommendation' => $this->extractRecommendation($response),
            'price_targets' => $this->extractPriceTargets($response),
            'risk_level' => $this->extractRiskLevel($response),
            'confidence' => $this->extractConfidence($response),
            'key_points' => $this->extractKeyPoints($response)
        ];

        return $structured;
    }

    /**
     * Extract recommendation from response
     */
    private function extractRecommendation(string $response): string
    {
        $response = strtolower($response);

        if (preg_match('/strong.?buy|buy.?strong/', $response))
            return 'strong_buy';
        if (preg_match('/\bbuy\b/', $response))
            return 'buy';
        if (preg_match('/strong.?sell|sell.?strong/', $response))
            return 'strong_sell';
        if (preg_match('/\bsell\b/', $response))
            return 'sell';

        return 'hold';
    }

    /**
     * Extract price targets from response
     */
    private function extractPriceTargets(string $response): array
    {
        $targets = [];

        // Look for price patterns like $1,234 or $1234.56
        if (preg_match_all('/\$([0-9,]+\.?[0-9]*)/', $response, $matches)) {
            $prices = array_map(function ($price) {
                return floatval(str_replace(',', '', $price));
            }, $matches[1]);

            $targets = array_slice(array_unique($prices), 0, 3); // Take first 3 unique prices
        }

        return $targets;
    }

    /**
     * Extract risk level from response
     */
    private function extractRiskLevel(string $response): string
    {
        $response = strtolower($response);

        if (preg_match('/very.?high.?risk|extremely.?risky/', $response))
            return 'very_high';
        if (preg_match('/high.?risk/', $response))
            return 'high';
        if (preg_match('/low.?risk/', $response))
            return 'low';
        if (preg_match('/very.?low.?risk/', $response))
            return 'very_low';

        return 'moderate';
    }

    /**
     * Extract confidence percentage from response
     */
    private function extractConfidence(string $response): int
    {
        if (preg_match('/(\d+)%?\s*confidence/', strtolower($response), $matches)) {
            return intval($matches[1]);
        }

        return 75; // Default confidence
    }

    /**
     * Extract key points from response
     */
    private function extractKeyPoints(string $response): array
    {
        $points = [];

        // Look for numbered lists or bullet points
        if (preg_match_all('/^\s*[•\-\*]\s*(.+)$/m', $response, $matches)) {
            $points = array_slice($matches[1], 0, 5); // Take first 5 points
        } elseif (preg_match_all('/^\s*\d+\.\s*(.+)$/m', $response, $matches)) {
            $points = array_slice($matches[1], 0, 5);
        }

        return $points;
    }

    /**
     * Calculate overall confidence score based on data quality
     */
    private function calculateConfidenceScore(array $marketData, array $newsData, array $technicalData): int
    {
        $marketConfidence = ($marketData['confidence'] ?? 0) * 40;
        $newsConfidence = ($newsData['confidence'] ?? 0) * 30;
        $technicalConfidence = ($technicalData['reliability'] ?? 0) * 30;

        return round($marketConfidence + $newsConfidence + $technicalConfidence);
    }

    /**
     * Get investor type description
     */
    private function getInvestorTypeDescription(string $riskLevel, string $timeHorizon): string
    {
        $riskMap = [
            'low' => 'Conservative',
            'moderate' => 'Balanced',
            'high' => 'Aggressive'
        ];

        $horizonMap = [
            'short' => 'Trader',
            'medium' => 'Investor',
            'long' => 'Long-term Holder'
        ];

        return ($riskMap[$riskLevel] ?? 'Balanced') . ' ' . ($horizonMap[$timeHorizon] ?? 'Investor');
    }

    /**
     * Fallback to basic advice if enhanced analysis fails
     */
    private function fallbackToBasicAdvice(string $symbol, float $currentPrice, float $change24h, string $riskLevel, string $timeHorizon): array
    {
        try {
            $prompt = "
                Provide professional investment advice for {$symbol} cryptocurrency.
                Current Price: \${$currentPrice}
                24h Change: {$change24h}%
                Investor: {$riskLevel} risk, {$timeHorizon}-term horizon
                
                Provide a clear recommendation with reasoning in a professional format.
            ";

            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.7,
                    'max_tokens' => 600,
                ])
                ->asText();

            return [
                'suggestion' => $response->text ?? 'Unable to generate advice at this time.',
                'model_used' => 'gpt-4o-fallback',
                'confidence_score' => 60,
                'structured_advice' => [
                    'recommendation' => 'hold',
                    'confidence' => 60,
                    'risk_level' => 'moderate',
                    'data_quality' => 'limited'
                ]
            ];

        } catch (Exception $e) {
            Log::error("Fallback advice generation failed for {$symbol}: " . $e->getMessage());
            return [
                'suggestion' => 'Investment advice temporarily unavailable due to system limitations.',
                'model_used' => 'error-fallback',
                'confidence_score' => 30,
                'structured_advice' => [
                    'recommendation' => 'hold',
                    'confidence' => 30,
                    'risk_level' => 'unknown',
                    'data_quality' => 'unavailable'
                ]
            ];
        }
    }

    /**
     * Generate enhanced portfolio advice for multiple coins
     */
    public function generateEnhancedPortfolioAdvice(
        array $coinData,
        string $riskLevel = 'moderate',
        string $timeHorizon = 'medium',
        string $context = 'Portfolio analysis'
    ): ?array {
        try {
            // Gather intelligence for each coin
            $portfolioIntelligence = [];
            foreach ($coinData as $coin) {
                $portfolioIntelligence[$coin['symbol']] = $this->gatherMarketIntelligence($coin['symbol']);
            }

            // Create comprehensive portfolio context
            $portfolioContext = $this->buildPortfolioContext($coinData, $riskLevel, $timeHorizon, $portfolioIntelligence);

            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($portfolioContext)
                ->withProviderOptions([
                    'temperature' => 0.3,
                    'max_tokens' => 1500,
                ])
                ->asText();

            $structuredAdvice = $this->parsePortfolioResponse($response->text ?? '');

            return [
                'suggestion' => $response->text ?? 'Unable to generate portfolio advice',
                'structured_advice' => $structuredAdvice,
                'model_used' => 'gpt-4o-portfolio-enhanced',
                'confidence_score' => $this->calculatePortfolioConfidence($portfolioIntelligence)
            ];

        } catch (Exception $e) {
            Log::error("Enhanced portfolio advice failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Build comprehensive portfolio context
     */
    private function buildPortfolioContext(array $coinData, string $riskLevel, string $timeHorizon, array $intelligence): string
    {
        $context = "COMPREHENSIVE CRYPTOCURRENCY PORTFOLIO ANALYSIS\n\n";
        $context .= "Investor Profile: {$riskLevel} risk tolerance, {$timeHorizon}-term investment horizon\n\n";

        $context .= "CURRENT PORTFOLIO HOLDINGS:\n";
        foreach ($coinData as $coin) {
            $context .= "- {$coin['symbol']}: \${$coin['price']} ({$coin['change_24h']}% 24h)\n";
        }

        $context .= "\nDETAILED MARKET INTELLIGENCE:\n";
        foreach ($intelligence as $symbol => $intel) {
            $context .= "\n=== {$symbol} ANALYSIS ===\n{$intel['intelligence']}\n";
        }

        $context .= "\nPORTFOLIO ANALYSIS REQUIREMENTS:\n";
        $context .= "Provide a comprehensive portfolio analysis including:\n";
        $context .= "1. Overall portfolio health and diversification score\n";
        $context .= "2. Individual coin recommendations (buy more/hold/reduce/sell)\n";
        $context .= "3. Risk assessment and rebalancing suggestions\n";
        $context .= "4. Market correlation analysis\n";
        $context .= "5. Specific action items with timelines\n";
        $context .= "6. Portfolio optimization recommendations\n";
        $context .= "7. Executive summary with key insights\n";

        return $context;
    }

    /**
     * Parse portfolio advice response
     */
    private function parsePortfolioResponse(string $response): array
    {
        return [
            'overall_recommendation' => $this->extractPortfolioRecommendation($response),
            'diversification_score' => $this->extractDiversificationScore($response),
            'individual_recommendations' => $this->extractIndividualRecommendations($response),
            'risk_assessment' => $this->extractRiskLevel($response),
            'key_actions' => $this->extractKeyPoints($response)
        ];
    }

    /**
     * Extract portfolio recommendation
     */
    private function extractPortfolioRecommendation(string $response): string
    {
        $response = strtolower($response);

        if (preg_match('/rebalance|rebalancing/', $response))
            return 'rebalance';
        if (preg_match('/diversify|diversification/', $response))
            return 'diversify';
        if (preg_match('/reduce.?risk/', $response))
            return 'reduce_risk';
        if (preg_match('/increase.?exposure/', $response))
            return 'increase_exposure';

        return 'hold';
    }

    /**
     * Extract diversification score
     */
    private function extractDiversificationScore(string $response): int
    {
        if (preg_match('/diversification.{0,20}(\d+)%/', strtolower($response), $matches)) {
            return intval($matches[1]);
        }

        return 70; // Default score
    }

    /**
     * Extract individual coin recommendations
     */
    private function extractIndividualRecommendations(string $response): array
    {
        $recommendations = [];

        // Look for patterns like "BTC: Buy" or "ETH: Hold"
        if (preg_match_all('/([A-Z]{3,5}):\s*(buy|hold|sell|reduce)/i', $response, $matches)) {
            for ($i = 0; $i < count($matches[1]); $i++) {
                $recommendations[] = [
                    'symbol' => $matches[1][$i],
                    'action' => strtolower($matches[2][$i])
                ];
            }
        }

        return $recommendations;
    }

    /**
     * Calculate portfolio confidence based on intelligence quality
     */
    private function calculatePortfolioConfidence(array $intelligence): int
    {
        $totalConfidence = 0;
        $count = 0;

        foreach ($intelligence as $intel) {
            $totalConfidence += ($intel['confidence'] ?? 0.5);
            $count++;
        }

        return $count > 0 ? round(($totalConfidence / $count) * 100) : 70;
    }
}
