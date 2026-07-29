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
        $date = $request->input('date', Carbon::today()->toDateString());

        $payrolls = Payroll::with('employee')
            ->whereDate('date', $date)
            ->orderBy('id')
            ->get();

        return Inertia::render('Payrolls', [
            'payrolls' => $payrolls,
            'selectedDate' => $date,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($request->input('date'))->toDateString();
        $dateCarbon = Carbon::parse($date);

        $employees = Employee::where('status', 'Active')->get();
        $latePenalty = (int) SppgSetting::getValue('late_penalty_per_minute', '1000');

        foreach ($employees as $emp) {
            $attendance = Attendance::where('employee_id', $emp->id)
                ->whereDate('date', $date)
                ->first();

            $isPresent = $attendance && in_array($attendance->status, ['Present', 'Late'], true);
            $isLate = $attendance && $attendance->status === 'Late';
            $lateMinutes = $isLate ? (int) ($attendance->late_minutes ?? 0) : 0;

            // Daily base pay only when Present/Late; Absent/Leave/no record = 0
            $dailyRate = (int) $emp->base_salary;
            $baseEarned = $isPresent ? $dailyRate : 0;

            // Weekly allowance credited as 1/5 per present day
            $dailyAllowance = $isPresent
                ? (int) round(((int) $emp->weekly_allowance) / 5)
                : 0;

            $lateDeduction = $lateMinutes * $latePenalty;

            $existing = Payroll::where('employee_id', $emp->id)
                ->whereDate('date', $date)
                ->first();

            $bonus = $existing ? (int) $existing->bonuses : 0;

            if ($existing && in_array($existing->status, ['Approved', 'Paid'], true)) {
                continue;
            }

            $netSalary = $baseEarned + $dailyAllowance + $bonus - $lateDeduction;
            if ($netSalary < 0) {
                $netSalary = 0;
            }

            Payroll::updateOrCreate(
                [
                    'employee_id' => $emp->id,
                    'date' => $date,
                ],
                [
                    'month' => $dateCarbon->month,
                    'year' => $dateCarbon->year,
                    'days_present' => $isPresent ? 1 : 0,
                    'days_late' => $isLate ? 1 : 0,
                    'base_salary' => $baseEarned,
                    'weekly_allowances_total' => $dailyAllowance,
                    'bonuses' => $bonus,
                    'deductions' => $lateDeduction,
                    'net_salary' => $netSalary,
                    'status' => 'Draft',
                ]
            );
        }

        return redirect()->back()->with('success', 'Gaji harian berhasil dikalkulasi untuk tanggal ' . $dateCarbon->format('d/m/Y') . '.');
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
