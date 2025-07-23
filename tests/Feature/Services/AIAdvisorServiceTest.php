<?php

use App\Services\AIAdvisorService;
use App\Services\CCXTService;

beforeEach(function () {
    $this->aiAdvisorService = new AIAdvisorService();
    $this->ccxtService = $this->mock(CCXTService::class);
});

describe('AIAdvisorService', function () {
    it('can generate structured investment advice using Prism PHP', function () {
        // Skip if no OpenAI API key is configured
        if (empty(config('prism.providers.openai.api_key'))) {
            $this->markTestSkipped('OpenAI API key not configured');
        }

        $advice = $this->aiAdvisorService->generateAdvice(
            'BTC/USDT',
            45000.00,
            2.5,
            'moderate',
            'medium'
        );

        expect($advice)->not()->toBeNull()
            ->and($advice)->toHaveKeys([
                    'structured_advice',
                    'suggestion',
                    'model_used',
                    'confidence_score',
                    'prompt_data'
                ])
            ->and($advice['structured_advice'])->toHaveKeys([
                    'recommendation',
                    'reasoning',
                    'risk_assessment',
                    'confidence_score'
                ])
            ->and($advice['structured_advice']['recommendation'])->toBeIn(['buy', 'hold', 'sell'])
            ->and($advice['structured_advice']['confidence_score'])->toBeGreaterThanOrEqual(0)
            ->and($advice['structured_advice']['confidence_score'])->toBeLessThanOrEqual(100)
            ->and($advice['model_used'])->toBe('gpt-4o');
    });

    it('can analyze portfolio data', function () {
        // Skip if no OpenAI API key is configured
        if (empty(config('prism.providers.openai.api_key'))) {
            $this->markTestSkipped('OpenAI API key not configured');
        }

        $portfolio = [
            ['symbol' => 'BTC/USDT', 'value' => 45000, 'percentage' => 60],
            ['symbol' => 'ETH/USDT', 'value' => 3000, 'percentage' => 40],
        ];

        $analysis = $this->aiAdvisorService->analyzePortfolio($portfolio, 'moderate');

        expect($analysis)->not()->toBeNull()
            ->and($analysis)->toHaveKeys(['analysis', 'model_used'])
            ->and($analysis['analysis'])->toBeString()
            ->and($analysis['model_used'])->toBe('gpt-4o');
    });

    it('returns null when Prism fails', function () {
        // Test with invalid parameters to trigger failure
        $advice = $this->aiAdvisorService->generateAdvice(
            '', // Invalid symbol
            -1, // Invalid price
            0,
            'invalid_risk',
            'invalid_horizon'
        );

        expect($advice)->toBeNull();
    });

    it('formats advice text correctly', function () {
        // Test the private method indirectly by checking the output
        $mockStructuredAdvice = [
            'recommendation' => 'buy',
            'reasoning' => 'Strong technical indicators',
            'risk_assessment' => 'Moderate risk due to market volatility',
            'confidence_score' => 85,
            'price_target' => '$50,000 - $55,000',
            'time_frame' => '3-6 months',
            'key_factors' => ['Institutional adoption', 'Technical breakout']
        ];

        // Use reflection to test the private method
        $reflection = new ReflectionClass($this->aiAdvisorService);
        $method = $reflection->getMethod('formatAdviceText');
        $method->setAccessible(true);

        $formattedText = $method->invoke($this->aiAdvisorService, $mockStructuredAdvice);

        expect($formattedText)->toContain('💡 RECOMMENDATION: BUY')
            ->and($formattedText)->toContain('📊 ANALYSIS:')
            ->and($formattedText)->toContain('⚠️ RISK ASSESSMENT:')
            ->and($formattedText)->toContain('🎯 PRICE TARGET:')
            ->and($formattedText)->toContain('🔍 CONFIDENCE: 85%');
    });

    it('builds correct advice prompt', function () {
        $reflection = new ReflectionClass($this->aiAdvisorService);
        $method = $reflection->getMethod('buildAdvicePrompt');
        $method->setAccessible(true);

        $prompt = $method->invoke(
            $this->aiAdvisorService,
            'BTC/USDT',
            45000.00,
            2.5,
            'moderate',
            'medium'
        );

        expect($prompt)->toContain('BTC/USDT')
            ->and($prompt)->toContain('$45,000')
            ->and($prompt)->toContain('2.5%')
            ->and($prompt)->toContain('moderate')
            ->and($prompt)->toContain('medium-term');
    });

    it('can get market sentiment', function () {
        $mockMarketData = [
            ['symbol' => 'BTC/USDT', 'price' => 45000, 'change_24h' => 2.5],
            ['symbol' => 'ETH/USDT', 'price' => 3000, 'change_24h' => 1.8],
        ];

        $sentiment = $this->aiAdvisorService->getMarketSentiment($mockMarketData);

        expect($sentiment)->toHaveKeys([
            'overall_sentiment',
            'confidence',
            'key_factors',
            'generated_at'
        ])
            ->and($sentiment['overall_sentiment'])->toBeIn(['bullish', 'bearish', 'neutral'])
            ->and($sentiment['confidence'])->toBeFloat()
            ->and($sentiment['key_factors'])->toBeArray();
    });
});
