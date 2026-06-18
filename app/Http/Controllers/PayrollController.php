<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\SppgSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request): Response
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        // Fetch payroll records for this month
        $payrolls = Payroll::with('employee')
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        return Inertia::render('Payrolls', [
            'payrolls' => $payrolls,
            'selectedMonth' => $month,
            'selectedYear' => $year,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'min:2020'],
        ]);

        $month = (int) $request->input('month');
        $year = (int) $request->input('year');

        $employees = Employee::where('status', 'Active')->get();
        $latePenalty = (int) SppgSetting::getValue('late_penalty_per_minute', '1000');

        foreach ($employees as $emp) {
            // Retrieve all attendances for the employee in this month
            $attendances = Attendance::where('employee_id', $emp->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();

            $daysPresent = $attendances->whereIn('status', ['Present', 'Late'])->count();
            $daysLate = $attendances->where('status', 'Late')->count();
            $daysAbsent = $attendances->where('status', 'Absent')->count();
            $totalLateMinutes = $attendances->sum('late_minutes');

            // Calculations
            $baseSalary = $emp->base_salary;
            $weeksPresent = $attendances->whereIn('status', ['Present', 'Late'])
                ->map(function ($att) {
                    return Carbon::parse($att->date)->weekOfYear;
                })
                ->unique()
                ->count();
            $allowanceTotal = $weeksPresent * $emp->weekly_allowance;

            // Late Penalty
            $lateDeduction = $totalLateMinutes * $latePenalty;

            // Unpaid Absence Penalty: base_salary / 22 days per absent day
            $absenceDeduction = $daysAbsent > 0 ? (int) round(($baseSalary / 22) * $daysAbsent) : 0;

            $totalDeduction = $lateDeduction + $absenceDeduction;

            // Check if there is an existing payroll record to preserve manual edits
            $existing = Payroll::where('employee_id', $emp->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            $bonus = $existing ? $existing->bonuses : 0;
            
            // If the record exists and status is Approved or Paid, we do not overwrite it unless forced
            if ($existing && in_array($existing->status, ['Approved', 'Paid'])) {
                continue;
            }

            $netSalary = $baseSalary + $allowanceTotal + $bonus - $totalDeduction;
            if ($netSalary < 0) {
                $netSalary = 0;
            }

            Payroll::updateOrCreate(
                [
                    'employee_id' => $emp->id,
                    'month' => $month,
                    'year' => $year,
                ],
                [
                    'days_present' => $daysPresent,
                    'days_late' => $daysLate,
                    'base_salary' => $baseSalary,
                    'weekly_allowances_total' => $allowanceTotal,
                    'bonuses' => $bonus,
                    'deductions' => $totalDeduction,
                    'net_salary' => $netSalary,
                    'status' => 'Draft',
                ]
            );
        }

        return redirect()->back()->with('success', 'Gaji bulan ini berhasil dikalkulasi.');
    }

    public function update(Request $request, Payroll $payroll)
    {
        $validated = $request->validate([
            'bonuses' => ['required', 'numeric', 'min:0'],
            'deductions' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:Draft,Approved,Paid'],
        ]);

        $netSalary = $payroll->base_salary + $payroll->weekly_allowances_total + $validated['bonuses'] - $validated['deductions'];
        if ($netSalary < 0) {
            $netSalary = 0;
        }

        $payroll->update([
            'bonuses' => $validated['bonuses'],
            'deductions' => $validated['deductions'],
            'status' => $validated['status'],
            'net_salary' => $netSalary,
            'payment_date' => $validated['status'] === 'Paid' ? Carbon::now()->toDateString() : null,
        ]);

        return redirect()->back()->with('success', 'Rincian gaji berhasil diperbarui.');
    }

    public function payslip(Payroll $payroll): Response
    {
        $payroll->load('employee');
        $settings = SppgSetting::pluck('value', 'key')->toArray();

        $kepalaSatuan = Employee::where('role', 'Kepala Satuan')
            ->where('status', 'Active')
            ->first();

        return Inertia::render('Payslip', [
            'payroll' => $payroll,
            'settings' => $settings,
            'kepalaSatuan' => $kepalaSatuan,
        ]);
    }

    public function destroy(Request $request, Payroll $payroll)
    {
        if ($request->user()->role !== 'superadmin') {
            abort(403, 'Hanya Superuser yang dapat menghapus data penggajian.');
        }

        $payroll->delete();

        return redirect()->back()->with('success', 'Data gaji karyawan berhasil dihapus.');
    }
}
