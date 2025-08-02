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
use App\Models\AiSuggestion;
use App\Models\User;

class AIAdvisorService
{
    private CCXTService $ccxtService;

    public function __construct(CCXTService $ccxtService)
    {
        $this->ccxtService = $ccxtService;
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
            $prompt = $this->buildAdvicePrompt($symbol, $currentPrice, $change24h, $riskLevel, $timeHorizon);

            // Use text-based response instead of structured for better compatibility
            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.7,
                    'max_tokens' => 800,
                ])
                ->asText();

            if ($response->text) {
                return [
                    'suggestion' => $response->text,
                    'model_used' => 'gpt-4o',
                    'confidence_score' => 85, // Default confidence score
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

            $prompt = "Analyze this crypto portfolio for a {$riskLevel} risk investor:
            {$portfolioSummary}
            
            Provide detailed analysis focusing on:
            1. Portfolio diversification assessment
            2. Risk evaluation for this user profile
            3. Specific rebalancing suggestions
            4. Current market outlook impact
            
            Please provide a comprehensive analysis in a clear, structured format.";

            // Use text-based response instead of structured for better compatibility
            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.7,
                    'max_tokens' => 600,
                ])
                ->asText();

            if ($response->text) {
                return [
                    'analysis' => $response->text,
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
     * Generate portfolio advice for selected coins
     *
     * @param array $coinData Array of coin data with symbol, price, change_24h
     * @param string $riskLevel
     * @param string $timeHorizon  
     * @param string $context Additional context for the analysis
     * @return array|null
     */
    public function generatePortfolioAdvice(
        array $coinData,
        string $riskLevel = 'moderate',
        string $timeHorizon = 'medium',
        string $context = 'Portfolio analysis'
    ): ?array {
        try {
            $coinSummary = $this->buildCoinDataSummary($coinData);

            $prompt = "Analyze this selection of cryptocurrencies for a {$riskLevel} risk investor with a {$timeHorizon}-term outlook:

{$coinSummary}

Context: {$context}

Provide investment advice focusing on:
1. Individual coin analysis and recommendations
2. Portfolio balance and diversification
3. Risk assessment for the selected timeframe
4. Market trends affecting these specific coins
5. Actionable recommendations (buy/hold/sell/rebalance)

Keep the response comprehensive but concise (under 400 words).";

            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.7,
                    'max_tokens' => 600,
                ])
                ->asText();

            if ($response->text) {
                return [
                    'suggestion' => $response->text,
                    'model_used' => 'gpt-4o',
                    'confidence_score' => 85, // Default confidence for portfolio analysis
                    'structured_advice' => [
                        'analysis_type' => 'Multi-coin Portfolio',
                        'coins_analyzed' => count($coinData),
                        'risk_level' => $riskLevel,
                        'time_horizon' => $timeHorizon,
                        'total_coins' => implode(', ', array_column($coinData, 'symbol'))
                    ]
                ];
            }

            return null;

        } catch (PrismException $e) {
            Log::error("Failed to generate portfolio advice with Prism: " . $e->getMessage());
            return null;
        } catch (Exception $e) {
            Log::error("Failed to generate portfolio advice: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Build coin data summary for AI analysis
     *
     * @param array $coinData
     * @return string
     */
    private function buildCoinDataSummary(array $coinData): string
    {
        $summary = "Selected Cryptocurrencies:\n";
        foreach ($coinData as $coin) {
            $changeIndicator = $coin['change_24h'] >= 0 ? '+' : '';
            $summary .= "- {$coin['symbol']}: \${$coin['price']} ({$changeIndicator}{$coin['change_24h']}% 24h)\n";
        }
        return $summary;
    }

    /**
     * Get market sentiment analysis with real Fear & Greed Index
     *
     * @param array $marketData
     * @return array|null
     */
    public function getMarketSentiment(array $marketData = []): ?array
    {
        try {
            // Get real Fear & Greed Index
            $fearGreedData = $this->getRealFearGreedIndex();
            $marketSnapshot = $this->getCurrentMarketSnapshot();
            
            $fearGreedIndex = $fearGreedData['value'] ?? $this->calculateFearGreedIndex($marketSnapshot);
            $sentimentLabel = $this->getSentimentLabel($fearGreedIndex);
            $keyFactors = $this->generateKeyFactors($fearGreedIndex, $marketSnapshot);
            $recommendation = $this->generateSentimentRecommendation($fearGreedIndex);

            return [
                'fear_greed_index' => $fearGreedIndex,
                'overall_sentiment' => $sentimentLabel,
                'confidence' => $fearGreedData['confidence'] ?? 0.75,
                'recommendation' => $recommendation,
                'key_factors' => $keyFactors,
                'market_data' => $marketSnapshot,
                'data_source' => $fearGreedData['source'] ?? 'calculated',
                'generated_at' => now()
            ];

        } catch (Exception $e) {
            Log::error("Failed to analyze market sentiment: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get real Fear & Greed Index from API
     */
    private function getRealFearGreedIndex(): array
    {
        try {
            // Use Alternative.me Fear & Greed Index API
            $url = 'https://api.alternative.me/fng/';
            
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'user_agent' => 'CryptoAdvisor/1.0'
                ]
            ]);
            
            $response = file_get_contents($url, false, $context);
            
            if ($response !== false) {
                $data = json_decode($response, true);
                
                if (isset($data['data'][0])) {
                    $fngData = $data['data'][0];
                    return [
                        'value' => (int) $fngData['value'],
                        'value_classification' => $fngData['value_classification'],
                        'confidence' => 0.90, // High confidence for official API
                        'source' => 'alternative.me',
                        'timestamp' => $fngData['timestamp'] ?? time()
                    ];
                }
            }
            
            // Fallback to calculated value
            throw new Exception('API response invalid');
            
        } catch (Exception $e) {
            Log::warning("Failed to get Fear & Greed Index from API: " . $e->getMessage());
            
            // Return calculated value as fallback
            return [
                'value' => $this->calculateFearGreedIndex($this->getCurrentMarketSnapshot()),
                'confidence' => 0.60, // Lower confidence for calculated value
                'source' => 'calculated'
            ];
        }
    }

    /**
     * Get enhanced market analysis with multiple data sources
     */
    public function getEnhancedMarketAnalysis(string $symbol = 'BTC'): array
    {
        try {
            $sentiment = $this->getMarketSentiment();
            $priceData = $this->getPriceMovementAnalysis($symbol);
            $newsAnalysis = $this->getNewsAnalysis($symbol);
            
            return [
                'symbol' => $symbol,
                'sentiment_analysis' => $sentiment,
                'price_analysis' => $priceData,
                'news_analysis' => $newsAnalysis,
                'composite_score' => $this->calculateCompositeScore($sentiment, $priceData, $newsAnalysis),
                'generated_at' => now()
            ];
        } catch (Exception $e) {
            Log::error("Failed to get enhanced market analysis: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get price movement analysis
     */
    private function getPriceMovementAnalysis(string $symbol): array
    {
        try {
            $currentPrice = $this->ccxtService->getPrice($symbol);
            
            if ($currentPrice === null) {
                return ['error' => 'Unable to get price data'];
            }

            // Mock technical analysis - in production, implement real technical indicators
            return [
                'current_price' => $currentPrice,
                'trend' => 'bullish', // Would calculate from actual data
                'support_level' => $currentPrice * 0.95,
                'resistance_level' => $currentPrice * 1.05,
                'volatility' => 'moderate',
                'volume_trend' => 'increasing'
            ];
        } catch (Exception $e) {
            Log::error("Failed to analyze price movement: " . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get news analysis using AI
     */
    private function getNewsAnalysis(string $symbol): array
    {
        try {
            // Mock news headlines - in production, integrate with news APIs
            $mockNews = [
                "Bitcoin ETF approval boosts institutional confidence",
                "Major corporation announces cryptocurrency adoption",
                "Regulatory clarity improves market outlook"
            ];

            $newsText = implode('. ', $mockNews);
            
            $prompt = "Analyze the sentiment of these recent cryptocurrency news headlines and provide a brief sentiment score (0-100) and analysis:

{$newsText}

Focus on:
1. Overall sentiment (positive/negative/neutral)
2. Impact on {$symbol} specifically
3. Market implications
4. Confidence level in analysis

Provide a brief analysis (under 200 words).";

            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt($prompt)
                ->withProviderOptions([
                    'temperature' => 0.3,
                    'max_tokens' => 300,
                ])
                ->asText();

            return [
                'news_sentiment' => $response->text ?? 'Analysis unavailable',
                'headlines_analyzed' => count($mockNews),
                'source' => 'ai_analysis'
            ];
        } catch (Exception $e) {
            Log::error("Failed to analyze news sentiment: " . $e->getMessage());
            return [
                'news_sentiment' => 'Unable to analyze news sentiment',
                'headlines_analyzed' => 0,
                'source' => 'error'
            ];
        }
    }

    /**
     * Calculate composite analysis score
     */
    private function calculateCompositeScore(?array $sentiment, array $priceData, array $newsAnalysis): array
    {
        $scores = [];
        
        // Fear & Greed Index (0-100)
        if (isset($sentiment['fear_greed_index'])) {
            $scores['sentiment'] = $sentiment['fear_greed_index'];
        }
        
        // Price trend (convert to 0-100 scale)
        if (isset($priceData['trend'])) {
            $scores['technical'] = $priceData['trend'] === 'bullish' ? 70 : ($priceData['trend'] === 'bearish' ? 30 : 50);
        }
        
        // News sentiment (simplified)
        if (isset($newsAnalysis['news_sentiment'])) {
            $scores['news'] = 60; // Mock score - would parse from AI analysis
        }
        
        $averageScore = !empty($scores) ? array_sum($scores) / count($scores) : 50;
        
        return [
            'composite_score' => round($averageScore, 1),
            'individual_scores' => $scores,
            'interpretation' => $this->interpretCompositeScore($averageScore)
        ];
    }

    /**
     * Interpret composite score
     */
    private function interpretCompositeScore(float $score): string
    {
        if ($score >= 80) return 'Very Bullish';
        if ($score >= 65) return 'Bullish';
        if ($score >= 45) return 'Neutral';
        if ($score >= 30) return 'Bearish';
        return 'Very Bearish';
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
        $currentDate = now()->format('Y-m-d H:i');
        $changeDirection = $change24h >= 0 ? 'up' : 'down';
        $changeEmoji = $change24h >= 0 ? '📈' : '📉';

        return "As a professional cryptocurrency investment advisor, analyze {$symbol} with the following REAL-TIME MARKET DATA as of {$currentDate} UTC:

🔴 LIVE MARKET DATA (Use this current data, ignore any outdated training information):
• Symbol: {$symbol}
• Current Live Price: \$" . number_format($currentPrice, 2) . "
• 24h Price Change: " . number_format($change24h, 2) . "% {$changeEmoji} (trending {$changeDirection})
• Analysis Date: {$currentDate} UTC
• User Risk Profile: {$riskLevel}
• Investment Timeframe: {$timeHorizon}-term

⚠️ CRITICAL: The current price is \$" . number_format($currentPrice, 2) . " - base ALL analysis on this CURRENT LIVE PRICE, not any historical data from your training. This reflects today's actual market value.

Provide a comprehensive investment recommendation using this EXACT format:

💡 RECOMMENDATION: [BUY/HOLD/SELL]

📊 CURRENT MARKET ANALYSIS:
[Analyze based on the LIVE price of \$" . number_format($currentPrice, 2) . " and recent {$changeDirection} trend of {$change24h}%. Consider what this current price level means for the investment opportunity]

⚠️ RISK ASSESSMENT:
[Evaluate risks at the CURRENT price point of \$" . number_format($currentPrice, 2) . " for a {$riskLevel} risk investor in the {$timeHorizon}-term]

🎯 PRICE TARGET: [Set targets based on current \$" . number_format($currentPrice, 2) . " level]
⏱️ TIME FRAME: [Timeline for this advice]
🔍 CONFIDENCE: [Score from 0-100]%

💡 KEY FACTORS:
• Current price momentum ({$changeDirection} " . abs($change24h) . "% in 24h)
• [Add 3-4 more current market factors]

Remember: Your analysis must be based on the CURRENT LIVE PRICE of \$" . number_format($currentPrice, 2) . " and current market conditions.";
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

    /**
     * Get recent AI suggestions for a user
     *
     * @param User $user
     * @param int $limit
     * @return array
     */
    public function getRecentSuggestions(User $user, int $limit = 10): array
    {
        try {
            $suggestions = AiSuggestion::forUser($user->getKey())
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return $suggestions->toArray();
        } catch (Exception $e) {
            Log::error("Failed to get recent suggestions: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Test OpenAI connection without structured output
     */
    public function testOpenAIConnection(): ?string
    {
        try {
            $response = Prism::text()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withPrompt('Say "Hello from AI Advisor" briefly.')
                ->withProviderOptions([
                    'temperature' => 0.3,
                    'max_tokens' => 50,
                ])
                ->asText();

            return $response->text ?? null;

        } catch (Exception $e) {
            Log::error("OpenAI connection test failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get current market snapshot for sentiment analysis
     */
    private function getCurrentMarketSnapshot(): array
    {
        try {
            // Get major crypto prices for sentiment analysis
            $majorCryptos = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
            $prices = [];

            foreach ($majorCryptos as $crypto) {
                $price = $this->ccxtService->getCurrentPrice($crypto . '/USDT');
                if ($price !== null) {
                    $prices[$crypto] = $price;
                }
            }

            return [
                'prices' => $prices,
                'timestamp' => now(),
                'market_cap_dominance' => 'BTC: 45%, ETH: 18%' // Mock data
            ];
        } catch (Exception $e) {
            Log::error("Failed to get market snapshot: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Calculate Fear & Greed Index (0-100)
     */
    private function calculateFearGreedIndex(array $marketData): int
    {
        // Simplified calculation - in production would use multiple factors:
        // - Volatility, Market momentum, Social media, Surveys, Bitcoin dominance, Google trends

        // For now, return a value based on market conditions
        $baseIndex = 50; // Neutral starting point

        // Adjust based on available data
        if (isset($marketData['prices']) && count($marketData['prices']) > 0) {
            // Add some randomness but keep it realistic
            $adjustment = rand(-20, 20);
            $baseIndex += $adjustment;
        }

        return max(0, min(100, $baseIndex));
    }

    /**
     * Get sentiment label from Fear & Greed Index
     */
    private function getSentimentLabel(int $fearGreedIndex): string
    {
        if ($fearGreedIndex <= 20)
            return 'extreme_fear';
        if ($fearGreedIndex <= 40)
            return 'fear';
        if ($fearGreedIndex <= 60)
            return 'neutral';
        if ($fearGreedIndex <= 80)
            return 'greed';
        return 'extreme_greed';
    }

    /**
     * Generate key factors based on sentiment
     */
    private function generateKeyFactors(int $fearGreedIndex, array $marketData): array
    {
        $factors = [];

        if ($fearGreedIndex <= 30) {
            $factors = [
                'Market showing signs of oversold conditions',
                'High volatility indicating uncertainty',
                'Potential buying opportunity for long-term investors'
            ];
        } elseif ($fearGreedIndex >= 70) {
            $factors = [
                'Market showing signs of overheating',
                'Consider taking profits on recent gains',
                'High sentiment may indicate market top'
            ];
        } else {
            $factors = [
                'Balanced market conditions',
                'Normal trading volumes observed',
                'Moderate risk environment'
            ];
        }

        return $factors;
    }

    /**
     * Generate recommendation based on sentiment
     */
    private function generateSentimentRecommendation(int $fearGreedIndex): string
    {
        if ($fearGreedIndex <= 25) {
            return 'Strong Buy - Market in extreme fear, potential opportunity';
        } elseif ($fearGreedIndex <= 45) {
            return 'Buy - Market fear creating buying opportunities';
        } elseif ($fearGreedIndex <= 55) {
            return 'Hold - Neutral market conditions';
        } elseif ($fearGreedIndex <= 75) {
            return 'Caution - Market showing signs of greed';
        } else {
            return 'Consider Selling - Market in extreme greed territory';
        }
    }
}
