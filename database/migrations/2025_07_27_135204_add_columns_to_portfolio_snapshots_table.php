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
        Schema::table('portfolio_snapshots', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->after('id');
            $table->decimal('total_value', 20, 8)->default(0)->after('user_id');
            $table->timestamp('snapshot_date')->after('total_value');
            $table->json('metadata')->nullable()->after('snapshot_date'); // Store additional data like coin counts, BTC/ETH prices

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'snapshot_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_snapshots', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'snapshot_date']);
            $table->dropColumn(['user_id', 'total_value', 'snapshot_date', 'metadata']);
        });
    }
};
