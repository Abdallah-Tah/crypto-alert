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
            $table->decimal('holdings_amount', 20, 8)->nullable()->after('alert_price'); // Amount of crypto held
            $table->decimal('purchase_price', 15, 8)->nullable()->after('holdings_amount'); // User's purchase price
            $table->enum('alert_type', ['market_price', 'purchase_price'])->default('market_price')->after('purchase_price'); // Alert based on market or purchase price
            $table->text('notes')->nullable()->after('alert_type'); // Optional notes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('watchlists', function (Blueprint $table) {
            $table->dropColumn(['holdings_amount', 'purchase_price', 'alert_type', 'notes']);
        });
    }
};
