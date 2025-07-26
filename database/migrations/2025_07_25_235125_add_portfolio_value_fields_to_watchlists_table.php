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
        Schema::table('watchlists', function (Blueprint $table) {
            // Add a field to specify if holdings_amount is in USD or coin quantity
            $table->enum('holdings_type', ['usd_value', 'coin_quantity'])->default('usd_value')->after('holdings_amount');

            // Add initial investment amount in USD for tracking
            $table->decimal('initial_investment_usd', 15, 2)->nullable()->after('holdings_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('watchlists', function (Blueprint $table) {
            $table->dropColumn(['holdings_type', 'initial_investment_usd']);
        });
    }
};
