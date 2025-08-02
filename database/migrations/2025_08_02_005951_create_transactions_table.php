<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('symbol'); // BTC, ETH, etc.
            $table->enum('type', ['buy', 'sell', 'transfer_in', 'transfer_out', 'staking_reward', 'airdrop']);
            $table->decimal('quantity', 20, 8); // Amount of crypto
            $table->decimal('price_per_unit', 20, 8); // Price at time of transaction
            $table->decimal('total_value', 20, 8); // Total USD value
            $table->decimal('fees', 20, 8)->default(0); // Transaction fees
            $table->string('exchange')->nullable(); // Coinbase, Binance, etc.
            $table->string('external_id')->nullable(); // Exchange transaction ID
            $table->text('notes')->nullable();
            $table->timestamp('transaction_date');
            $table->boolean('is_taxable')->default(true);
            $table->json('metadata')->nullable(); // Additional data like gas fees, etc.
            $table->timestamps();

            $table->index(['user_id', 'symbol']);
            $table->index(['user_id', 'transaction_date']);
            $table->index(['user_id', 'type']);
            $table->index('transaction_date');
            $table->unique(['external_id', 'exchange'], 'unique_external_transaction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
