<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AiSuggestion>
 */
class AiSuggestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'symbol' => $this->faker->randomElement(['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT', 'DOT/USDT']),
            'suggestion' => $this->faker->paragraphs(3, true),
            'model_used' => $this->faker->randomElement(['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']),
            'risk_level' => $this->faker->randomElement(['low', 'moderate', 'high']),
            'time_horizon' => $this->faker->randomElement(['short', 'medium', 'long']),
            'price_at_time' => $this->faker->randomFloat(8, 0.01, 100000),
        ];
    }
}
