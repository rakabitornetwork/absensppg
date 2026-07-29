<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->date('date')->nullable()->after('employee_id');
        });

        // Backfill date from existing month/year rows (use last day of that month)
        $rows = DB::table('payrolls')->whereNull('date')->get();
        foreach ($rows as $row) {
            $date = Carbon::create((int) $row->year, (int) $row->month, 1)->endOfMonth()->toDateString();
            DB::table('payrolls')->where('id', $row->id)->update(['date' => $date]);
        }

        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropUnique(['employee_id', 'month', 'year']);
        });

        // Ensure no duplicate employee_id + date before adding unique
        $duplicates = DB::table('payrolls')
            ->select('employee_id', 'date', DB::raw('MIN(id) as keep_id'))
            ->groupBy('employee_id', 'date')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            DB::table('payrolls')
                ->where('employee_id', $dup->employee_id)
                ->where('date', $dup->date)
                ->where('id', '!=', $dup->keep_id)
                ->delete();
        }

        DB::table('payrolls')->whereNull('date')->delete();

        Schema::table('payrolls', function (Blueprint $table) {
            $table->unique(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropUnique(['employee_id', 'date']);
            $table->dropColumn('date');
            $table->unique(['employee_id', 'month', 'year']);
        });
    }
};
