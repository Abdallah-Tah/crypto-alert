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
        Schema::create('cryptocurrencies', function (Blueprint $table) {
            $table->id();
            $table->string('coingecko_id')->unique()->index(); // Unique identifier from CoinGecko
            $table->string('symbol', 20)->index(); // e.g., 'BTC', 'ETH'
            $table->string('name')->index(); // e.g., 'Bitcoin', 'Ethereum'
            $table->string('trading_symbol', 30)->index(); // e.g., 'BTC/USDT'
            $table->text('image_url')->nullable(); // Logo/icon URL
            $table->decimal('current_price', 20, 8)->nullable(); // Current price in USD
            $table->decimal('market_cap', 25, 2)->nullable(); // Market cap in USD
            $table->integer('market_cap_rank')->nullable(); // Market cap ranking
            $table->decimal('total_volume', 25, 2)->nullable(); // 24h trading volume
            $table->decimal('price_change_24h', 10, 4)->nullable(); // 24h price change percentage
            $table->boolean('is_active')->default(true)->index(); // Whether the coin is actively traded
            $table->timestamp('last_updated')->nullable(); // When price data was last updated
            $table->timestamps();

            // Indexes for better search performance
            $table->index(['is_active', 'market_cap_rank']);
            $table->index(['symbol', 'name']);

            // Note: Full-text search not supported in SQLite, using regular indexes instead
            // For production, consider using MySQL/PostgreSQL for full-text search capabilities
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cryptocurrencies');
    }
};
