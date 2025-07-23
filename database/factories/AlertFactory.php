<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Alert>
 */
class AlertFactory extends Factory
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
            'message' => $this->faker->sentence(),
            'triggered_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'type' => $this->faker->randomElement(['price', 'ai_suggestion', 'portfolio']),
            'target_price' => $this->faker->optional()->randomFloat(8, 0.01, 100000),
            'current_price' => $this->faker->optional()->randomFloat(8, 0.01, 100000),
            'acknowledged' => $this->faker->boolean(30), // 30% chance of being acknowledged
        ];
    }
}
