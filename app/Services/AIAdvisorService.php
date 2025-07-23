<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Prism;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
use Prism\Prism\Schema\NumberSchema;
use Prism\Prism\Schema\ArraySchema;
use Prism\Prism\Exceptions\PrismException;

class AIAdvisorService
{
    public function __construct()
    {
        // Prism PHP handles configuration automatically from config/prism.php
    }

    /**
     * Generate AI investment advice using Prism PHP structured output
     *
     * @param string $symbol
     * @param float $currentPrice
     * @param float $change24h
     * @param string $riskLevel (low, moderate, high)
     * @param string $timeHorizon (short, medium, long)
     * @return array|null
     */
    public function generateAdvice(
        string $symbol,
        float $currentPrice,
        float $change24h,
        string $riskLevel = 'moderate',
        string $timeHorizon = 'medium'
    ): ?array {
        try {
            // Define structured schema for investment advice
            $schema = new ObjectSchema(
                name: 'investment_advice',
                description: 'Structured cryptocurrency investment advice',
                properties: [
                    new StringSchema('recommendation', 'Investment recommendation (buy, hold, sell)'),
                    new StringSchema('reasoning', 'Detailed reasoning for the recommendation'),
                    new StringSchema('risk_assessment', 'Risk assessment for this investment'),
                    new NumberSchema('confidence_score', 'Confidence score from 0-100'),
                    new ArraySchema(
                        'key_factors',
                        'Array of key factors influencing the recommendation',
                        new StringSchema('factor', 'A key factor')
                    ),
                    new StringSchema('price_target', 'Suggested price target or range'),
                    new StringSchema('time_frame', 'Expected time frame for this advice'),
                ],
                requiredFields: ['recommendation', 'reasoning', 'risk_assessment', 'confidence_score']
            );

            $prompt = $this->buildAdvicePrompt($symbol, $currentPrice, $change24h, $riskLevel, $timeHorizon);

            $response = Prism::structured()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withSchema($schema)
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.7,
                    'max_tokens' => 800,
                ])
                ->asStructured();

            if ($response->structured) {
                return [
                    'structured_advice' => $response->structured,
                    'suggestion' => $this->formatAdviceText($response->structured),
                    'model_used' => 'gpt-4o',
                    'confidence_score' => $response->structured['confidence_score'] ?? null,
                    'prompt_data' => [
                        'symbol' => $symbol,
                        'price' => $currentPrice,
                        'change_24h' => $change24h,
                        'risk_level' => $riskLevel,
                        'time_horizon' => $timeHorizon
                    ]
                ];
            }

            return null;

        } catch (PrismException $e) {
            Log::error("Failed to generate AI advice with Prism: " . $e->getMessage());
            return null;
        } catch (Exception $e) {
            Log::error("Failed to generate AI advice: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Build the prompt for OpenAI
     *
     * @param string $symbol
     * @param float $currentPrice
     * @param float $change24h
     * @param string $riskLevel
     * @param string $timeHorizon
     * @return string
     */
    private function buildPrompt(
        string $symbol,
        float $currentPrice,
        float $change24h,
        string $riskLevel,
        string $timeHorizon
    ): string {
        return "Analyze {$symbol} with the following data:
        - Current Price: \${$currentPrice}
        - 24h Change: {$change24h}%
        - User Risk Level: {$riskLevel}
        - Investment Time Horizon: {$timeHorizon}-term
        
        Provide a brief investment recommendation (buy/hold/sell) with reasoning. Keep it under 200 words and include:
        1. Market sentiment analysis
        2. Risk assessment for this user profile
        3. Specific action recommendation
        4. Key factors to monitor";
    }

    /**
     * Generate portfolio analysis using Prism PHP
     *
     * @param array $portfolio
     * @param string $riskLevel
     * @return array|null
     */
    public function analyzePortfolio(array $portfolio, string $riskLevel = 'moderate'): ?array
    {
        try {
            $portfolioSummary = $this->buildPortfolioSummary($portfolio);

            // Define structured schema for portfolio analysis
            $schema = new ObjectSchema(
                name: 'portfolio_analysis',
                description: 'Structured portfolio analysis',
                properties: [
                    new StringSchema('diversification_score', 'Portfolio diversification assessment'),
                    new StringSchema('risk_assessment', 'Overall portfolio risk evaluation'),
                    new StringSchema('rebalancing_suggestion', 'Specific rebalancing recommendations'),
                    new StringSchema('market_outlook', 'Current market conditions impact'),
                    new ArraySchema(
                        'action_items',
                        'List of actionable recommendations',
                        new StringSchema('action', 'Specific action to take')
                    ),
                ],
                requiredFields: ['diversification_score', 'risk_assessment', 'rebalancing_suggestion']
            );

            $prompt = "Analyze this crypto portfolio for a {$riskLevel} risk investor:
            {$portfolioSummary}
            
            Provide detailed analysis focusing on:
            1. Portfolio diversification assessment
            2. Risk evaluation for this user profile
            3. Specific rebalancing suggestions
            4. Current market outlook impact";

            $response = Prism::structured()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withSchema($schema)
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.7,
                    'max_tokens' => 600,
                ])
                ->asStructured();

            if ($response->structured) {
                return [
                    'structured_analysis' => $response->structured,
                    'analysis' => $this->formatPortfolioAnalysis($response->structured),
                    'model_used' => 'gpt-4o',
                    'portfolio_data' => $portfolio
                ];
            }

            return null;

        } catch (PrismException $e) {
            Log::error("Failed to analyze portfolio with Prism: " . $e->getMessage());
            return null;
        } catch (Exception $e) {
            Log::error("Failed to analyze portfolio: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Build portfolio summary for AI analysis
     *
     * @param array $portfolio
     * @return string
     */
    private function buildPortfolioSummary(array $portfolio): string
    {
        $summary = "Portfolio Holdings:\n";
        foreach ($portfolio as $holding) {
            $summary .= "- {$holding['symbol']}: \${$holding['value']} ({$holding['percentage']}%)\n";
        }
        return $summary;
    }

    /**
     * Get market sentiment analysis
     *
     * @param array $marketData
     * @return array|null
     */
    public function getMarketSentiment(array $marketData): ?array
    {
        try {
            // Mock implementation - replace with real sentiment analysis
            $sentiment = [
                'overall_sentiment' => 'bullish',
                'confidence' => 0.75,
                'key_factors' => [
                    'Strong institutional adoption',
                    'Positive regulatory developments',
                    'Technical indicators showing upward trend'
                ],
                'generated_at' => now()
            ];

            return $sentiment;

        } catch (Exception $e) {
            Log::error("Failed to analyze market sentiment: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Build the prompt for AI advice generation
     *
     * @param string $symbol
     * @param float $currentPrice
     * @param float $change24h
     * @param string $riskLevel
     * @param string $timeHorizon
     * @return string
     */
    private function buildAdvicePrompt(
        string $symbol,
        float $currentPrice,
        float $change24h,
        string $riskLevel,
        string $timeHorizon
    ): string {
        return "As a professional cryptocurrency investment advisor, analyze {$symbol} with the following data:

Current Price: \$" . number_format($currentPrice, 0) . "
24h Change: {$change24h}%
User Risk Level: {$riskLevel}
Investment Time Horizon: {$timeHorizon}-term

Provide a comprehensive investment recommendation including:
1. Clear buy/hold/sell recommendation
2. Detailed reasoning based on market analysis
3. Risk assessment specific to the user's risk profile
4. Confidence score (0-100)
5. Key factors influencing your decision
6. Price target or range
7. Expected timeframe for this advice

Consider market trends, technical indicators, fundamental analysis, and the user's risk tolerance.";
    }

    /**
     * Format structured advice into readable text
     *
     * @param array $structuredAdvice
     * @return string
     */
    private function formatAdviceText(array $structuredAdvice): string
    {
        $recommendation = strtoupper($structuredAdvice['recommendation'] ?? 'HOLD');
        $reasoning = $structuredAdvice['reasoning'] ?? 'No reasoning provided';
        $riskAssessment = $structuredAdvice['risk_assessment'] ?? 'Risk assessment unavailable';
        $confidence = $structuredAdvice['confidence_score'] ?? 'N/A';
        $priceTarget = $structuredAdvice['price_target'] ?? 'No target specified';
        $timeFrame = $structuredAdvice['time_frame'] ?? 'Medium term';

        $keyFactors = '';
        if (isset($structuredAdvice['key_factors']) && is_array($structuredAdvice['key_factors'])) {
            $keyFactors = "\n\nKey Factors:\n" . implode("\n", array_map(fn($factor) => "• " . $factor, $structuredAdvice['key_factors']));
        }

        return "💡 RECOMMENDATION: {$recommendation}

📊 ANALYSIS:
{$reasoning}

⚠️ RISK ASSESSMENT:
{$riskAssessment}

🎯 PRICE TARGET: {$priceTarget}
⏱️ TIME FRAME: {$timeFrame}
🔍 CONFIDENCE: {$confidence}%{$keyFactors}";
    }

    /**
     * Format portfolio analysis from structured response
     */
    private function formatPortfolioAnalysis(array $structuredAnalysis): string
    {
        $analysis = $structuredAnalysis['analysis'] ?? 'Portfolio analysis unavailable';
        $diversification = $structuredAnalysis['diversification_score'] ?? 'N/A';
        $riskLevel = $structuredAnalysis['risk_level'] ?? 'Unknown';
        $recommendations = $structuredAnalysis['recommendations'] ?? [];

        $formattedText = "📊 PORTFOLIO ANALYSIS\n\n";
        $formattedText .= "🔍 OVERVIEW:\n{$analysis}\n\n";
        $formattedText .= "📈 DIVERSIFICATION SCORE: {$diversification}\n";
        $formattedText .= "⚠️ RISK LEVEL: " . strtoupper($riskLevel) . "\n\n";

        if (!empty($recommendations)) {
            $formattedText .= "💡 RECOMMENDATIONS:\n";
            foreach ($recommendations as $recommendation) {
                $formattedText .= "• {$recommendation}\n";
            }
        }

        return $formattedText;
    }
}
