<?php

use App\Models\User;
use App\Services\AIAdvisorService;
use App\Services\CCXTService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    // Mock the services
    $this->aiAdvisorService = $this->mock(AIAdvisorService::class);
    $this->ccxtService = $this->mock(CCXTService::class);

    $this->app->instance(AIAdvisorService::class, $this->aiAdvisorService);
    $this->app->instance(CCXTService::class, $this->ccxtService);
});

describe('AIAdvisorController', function () {
    it('displays the AI advisor page', function () {
        $this->ccxtService->shouldReceive('getAvailableSymbols')
            ->once()
            ->andReturn(['BTC/USDT', 'ETH/USDT']);

        $response = $this->get('/advisor');

        $response->assertStatus(200)
            ->assertInertia(
                fn($page) =>
                $page->component('AIAdvisor')
                    ->has('riskLevels')
                    ->has('timeHorizons')
                    ->has('recentSuggestions')
                    ->has('availableSymbols')
            );
    });

    it('can generate AI advice', function () {
        $this->ccxtService->shouldReceive('getCurrentPrice')
            ->with('BTC/USDT')
            ->once()
            ->andReturn([
                'price' => 45000.00,
                'change_24h' => 2.5
            ]);

        $this->aiAdvisorService->shouldReceive('generateAdvice')
            ->once()
            ->andReturn([
                'structured_advice' => [
                    'recommendation' => 'buy',
                    'reasoning' => 'Strong market indicators',
                    'risk_assessment' => 'Moderate risk',
                    'confidence_score' => 85
                ],
                'suggestion' => 'Buy BTC/USDT based on current analysis',
                'model_used' => 'gpt-4o',
                'confidence_score' => 85
            ]);

        $response = $this->post('/advisor/generate', [
            'symbol' => 'BTC/USDT',
            'risk_level' => 'moderate',
            'time_horizon' => 'medium'
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success', 'AI advice generated successfully')
            ->assertSessionHas('advice');

        $this->assertDatabaseHas('ai_suggestions', [
            'user_id' => $this->user->id,
            'symbol' => 'BTC/USDT',
            'risk_level' => 'moderate',
            'time_horizon' => 'medium'
        ]);
    });

    it('validates required fields for advice generation', function () {
        $response = $this->post('/advisor/generate', []);

        $response->assertSessionHasErrors(['symbol', 'risk_level', 'time_horizon']);
    });

    it('validates risk level values', function () {
        $response = $this->post('/advisor/generate', [
            'symbol' => 'BTC/USDT',
            'risk_level' => 'invalid',
            'time_horizon' => 'medium'
        ]);

        $response->assertSessionHasErrors(['risk_level']);
    });

    it('validates time horizon values', function () {
        $response = $this->post('/advisor/generate', [
            'symbol' => 'BTC/USDT',
            'risk_level' => 'moderate',
            'time_horizon' => 'invalid'
        ]);

        $response->assertSessionHasErrors(['time_horizon']);
    });

    it('enforces daily rate limiting', function () {
        // Create 10 suggestions for today (max limit)
        for ($i = 0; $i < 10; $i++) {
            DB::table('ai_suggestions')->insert([
                'user_id' => $this->user->id,
                'symbol' => 'BTC/USDT',
                'suggestion' => 'Test suggestion',
                'model_used' => 'gpt-4o',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $response = $this->post('/advisor/generate', [
            'symbol' => 'BTC/USDT',
            'risk_level' => 'moderate',
            'time_horizon' => 'medium'
        ]);

        $response->assertSessionHasErrors(['error']);
        expect(session('errors')->first('error'))->toContain('Daily limit');
    });

    it('handles price data fetch failure', function () {
        $this->ccxtService->shouldReceive('getCurrentPrice')
            ->with('BTC/USDT')
            ->once()
            ->andReturn(null);

        $response = $this->post('/advisor/generate', [
            'symbol' => 'BTC/USDT',
            'risk_level' => 'moderate',
            'time_horizon' => 'medium'
        ]);

        $response->assertSessionHasErrors(['symbol']);
    });

    it('handles AI service failure', function () {
        $this->ccxtService->shouldReceive('getCurrentPrice')
            ->with('BTC/USDT')
            ->once()
            ->andReturn([
                'price' => 45000.00,
                'change_24h' => 2.5
            ]);

        $this->aiAdvisorService->shouldReceive('generateAdvice')
            ->once()
            ->andReturn(null);

        $response = $this->post('/advisor/generate', [
            'symbol' => 'BTC/USDT',
            'risk_level' => 'moderate',
            'time_horizon' => 'medium'
        ]);

        $response->assertSessionHasErrors(['error']);
    });

    it('can analyze portfolio', function () {
        // Create some watchlist items first
        DB::table('watchlists')->insert([
            'user_id' => $this->user->id,
            'symbol' => 'BTC/USDT',
            'alert_price' => 50000,
            'enabled' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->aiAdvisorService->shouldReceive('analyzePortfolio')
            ->once()
            ->andReturn([
                'analysis' => 'Portfolio analysis result',
                'model_used' => 'gpt-4o'
            ]);

        $response = $this->post('/advisor/analyze-portfolio', [
            'risk_level' => 'moderate'
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success', 'Portfolio analysis completed');
    });

    it('requires coins in watchlist for portfolio analysis', function () {
        $response = $this->post('/advisor/analyze-portfolio', [
            'risk_level' => 'moderate'
        ]);

        $response->assertSessionHasErrors(['error']);
        expect(session('errors')->first('error'))->toContain('No coins in watchlist');
    });

    it('can get market sentiment via API', function () {
        $this->ccxtService->shouldReceive('getTopCoins')
            ->with(10)
            ->once()
            ->andReturn([
                ['symbol' => 'BTC/USDT', 'price' => 45000, 'change_24h' => 2.5]
            ]);

        $this->aiAdvisorService->shouldReceive('getMarketSentiment')
            ->once()
            ->andReturn([
                'overall_sentiment' => 'bullish',
                'confidence' => 0.8
            ]);

        $response = $this->get('/advisor/market-sentiment');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'sentiment',
                'market_data'
            ]);
    });

    it('can get suggestion history', function () {
        // Create some suggestions
        DB::table('ai_suggestions')->insert([
            'user_id' => $this->user->id,
            'symbol' => 'BTC/USDT',
            'suggestion' => 'Test suggestion',
            'model_used' => 'gpt-4o',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->get('/advisor/suggestions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
                'per_page',
                'total'
            ]);
    });

    it('can delete a suggestion', function () {
        $suggestionId = DB::table('ai_suggestions')->insertGetId([
            'user_id' => $this->user->id,
            'symbol' => 'BTC/USDT',
            'suggestion' => 'Test suggestion',
            'model_used' => 'gpt-4o',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->delete("/advisor/suggestions/{$suggestionId}");

        $response->assertRedirect()
            ->assertSessionHas('success', 'Suggestion deleted');

        $this->assertDatabaseMissing('ai_suggestions', [
            'id' => $suggestionId
        ]);
    });

    it('prevents deleting other users suggestions', function () {
        $otherUser = User::factory()->create();

        $suggestionId = DB::table('ai_suggestions')->insertGetId([
            'user_id' => $otherUser->id,
            'symbol' => 'BTC/USDT',
            'suggestion' => 'Test suggestion',
            'model_used' => 'gpt-4o',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->delete("/advisor/suggestions/{$suggestionId}");

        $response->assertSessionHasErrors(['error']);

        $this->assertDatabaseHas('ai_suggestions', [
            'id' => $suggestionId
        ]);
    });
});
