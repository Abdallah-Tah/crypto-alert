<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('smart_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('alert_type'); // price_target, portfolio_rebalance, tax_optimization, risk_threshold, market_sentiment
            $table->string('symbol')->nullable(); // For price-specific alerts
            $table->decimal('target_value', 20, 8)->nullable(); // Target price, threshold, etc.
            $table->string('direction')->nullable(); // above, below for price alerts
            $table->json('configuration'); // Additional alert configuration
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->integer('trigger_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'alert_type']);
            $table->index(['symbol', 'alert_type']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smart_alerts');
    }
};
