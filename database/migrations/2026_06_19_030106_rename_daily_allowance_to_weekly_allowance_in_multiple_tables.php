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
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('daily_allowance', 'weekly_allowance');
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->renameColumn('daily_allowances_total', 'weekly_allowances_total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('weekly_allowance', 'daily_allowance');
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->renameColumn('weekly_allowances_total', 'daily_allowances_total');
        });
    }
};
