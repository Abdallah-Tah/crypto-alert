<?php

namespace App\Console\Commands;

use App\Services\AIAdvisorService;
use App\Services\CCXTService;
use Illuminate\Console\Command;

class TestPrismIntegration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:prism {symbol=BTC/USDT}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Prism PHP integration with AI Advisor Service';

    /**
     * Execute the console command.
     */
    public function handle(AIAdvisorService $aiAdvisorService, CCXTService $ccxtService)
    {
        $symbol = $this->argument('symbol');

        $this->info("Testing Prism PHP integration for {$symbol}...");

        // Get mock price data (since CCXT might not be fully configured yet)
        $priceData = $ccxtService->getCurrentPrice($symbol);

        if (!$priceData) {
            $this->warn("Could not fetch real price data, using mock data");
            $priceData = [
                'price' => 45000.00,
                'change_24h' => 2.5
            ];
        }

        $this->info("Price Data:");
        $this->line("  Price: $" . number_format($priceData['price'], 2));
        $this->line("  24h Change: " . $priceData['change_24h'] . "%");

        // Test AI advice generation
        $this->info("\nGenerating AI advice with Prism PHP...");

        $advice = $aiAdvisorService->generateAdvice(
            $symbol,
            $priceData['price'],
            $priceData['change_24h'],
            'moderate',
            'medium'
        );

        if ($advice) {
            $this->info("✅ Prism PHP integration successful!");
            $this->line("\nStructured Response:");
            if (isset($advice['structured_advice'])) {
                $structured = $advice['structured_advice'];
                $this->line("  Recommendation: " . ($structured['recommendation'] ?? 'N/A'));
                $this->line("  Confidence: " . ($structured['confidence_score'] ?? 'N/A') . "%");
                $this->line("  Risk Assessment: " . ($structured['risk_assessment'] ?? 'N/A'));
            }

            $this->line("\nFormatted Suggestion:");
            $this->line($advice['suggestion']);

            $this->line("\nModel Used: " . $advice['model_used']);
        } else {
            $this->error("❌ Failed to generate AI advice");
            $this->warn("Check your OpenAI API key and Prism configuration");
        }

        return 0;
    }
}
