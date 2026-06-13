<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->integer('month');
            $table->integer('year');
            $table->integer('days_present')->default(0);
            $table->integer('days_late')->default(0);
            $table->unsignedBigInteger('base_salary')->default(0);
            $table->unsignedBigInteger('daily_allowances_total')->default(0);
            $table->unsignedBigInteger('bonuses')->default(0);
            $table->unsignedBigInteger('deductions')->default(0);
            $table->unsignedBigInteger('net_salary')->default(0);
            $table->string('status')->default('Draft'); // Draft, Approved, Paid
            $table->date('payment_date')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
