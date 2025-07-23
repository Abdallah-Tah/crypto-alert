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
        Schema::create('ai_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('symbol');
            $table->text('suggestion');
            $table->string('model_used')->nullable();
            $table->string('risk_level')->nullable();
            $table->string('time_horizon')->nullable();
            $table->decimal('price_at_time', 20, 8)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['symbol', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_suggestions');
    }
};
