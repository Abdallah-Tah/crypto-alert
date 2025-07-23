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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('symbol');
            $table->text('message');
            $table->timestamp('triggered_at');
            $table->string('type')->default('price'); // 'price', 'ai_suggestion', 'portfolio'
            $table->decimal('target_price', 20, 8)->nullable();
            $table->decimal('current_price', 20, 8)->nullable();
            $table->boolean('acknowledged')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'triggered_at']);
            $table->index(['symbol', 'type']);
            $table->index(['acknowledged', 'triggered_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
