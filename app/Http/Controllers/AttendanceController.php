<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\SppgSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        $employees = Employee::where('status', 'Active')->orderBy('name', 'asc')->get();
        
        // Load attendances for the given month and year
        $attendances = Attendance::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->groupBy('employee_id');

        // Transform attendance data into a format easy for grid rendering
        $records = $employees->map(function ($emp) use ($attendances, $month, $year) {
            $empAttendances = $attendances->get($emp->id, collect());
            
            $daysMap = [];
            foreach ($empAttendances as $att) {
                $day = Carbon::parse($att->date)->day;
                $daysMap[$day] = [
                    'id' => $att->id,
                    'status' => $att->status,
                    'clock_in' => $att->clock_in ? Carbon::parse($att->clock_in)->format('H:i') : null,
                    'clock_out' => $att->clock_out ? Carbon::parse($att->clock_out)->format('H:i') : null,
                    'late_minutes' => $att->late_minutes,
                ];
            }

            return [
                'employee_id' => $emp->id,
                'nip' => $emp->nip,
                'name' => $emp->name,
                'role' => $emp->role,
                'days' => $daysMap,
                'summary' => [
                    'present' => $empAttendances->whereIn('status', ['Present', 'Late'])->count(),
                    'late' => $empAttendances->where('status', 'Late')->count(),
                    'absent' => $empAttendances->where('status', 'Absent')->count(),
                    'leave' => $empAttendances->where('status', 'Leave')->count(),
                ]
            ];
        });

        return Inertia::render('Attendances', [
            'records' => $records,
            'selectedMonth' => $month,
            'selectedYear' => $year,
        ]);
    }

    public function showScanner(): Response
    {
        $settings = SppgSetting::pluck('value', 'key')->toArray();
        return Inertia::render('Scanner', [
            'settings' => $settings,
        ]);
    }

    public function scan(Request $request)
    {
        $validated = $request->validate([
            'qr_token' => ['required', 'string'],
        ]);

        $employee = Employee::where('qr_token', $validated['qr_token'])
            ->where('status', 'Active')
            ->first();

        if (!$employee) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kartu tidak dikenali atau karyawan tidak aktif.',
            ], 404);
        }

        // Get current local time and date
        $now = Carbon::now();
        $todayStr = $now->toDateString();
        $timeStr = $now->toTimeString();

        // Check if there is already an attendance record for today
        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', Carbon::parse($todayStr))
            ->first();

        if (!$attendance) {
            // CLOCK IN FLOW
            $workStartTimeStr = SppgSetting::getValue('work_start_time', '06:00');
            $lateGraceTimeStr = SppgSetting::getValue('late_grace_time', '06:30');

            $workStart = Carbon::createFromFormat('H:i', $workStartTimeStr)->setDate($now->year, $now->month, $now->day);
            $lateGrace = Carbon::createFromFormat('H:i', $lateGraceTimeStr)->setDate($now->year, $now->month, $now->day);

            $isLate = $now->gt($lateGrace);
            $lateMinutes = 0;

            if ($isLate) {
                // Calculate lateness in minutes relative to the grace time
                $lateMinutes = $now->diffInMinutes($lateGrace);
                $status = 'Late';
            } else {
                $status = 'Present';
            }

            $attendance = Attendance::create([
                'employee_id' => $employee->id,
                'date' => $todayStr,
                'clock_in' => $timeStr,
                'status' => $status,
                'late_minutes' => $lateMinutes,
            ]);

            return response()->json([
                'status' => 'success',
                'type' => 'in',
                'employee' => [
                    'name' => $employee->name,
                    'nip' => $employee->nip,
                    'role' => $employee->role,
                ],
                'time' => $now->format('H:i'),
                'attendance_status' => $status,
                'late_minutes' => $lateMinutes,
                'message' => "Halo {$employee->name}, berhasil masuk pada pukul " . $now->format('H:i') . ($isLate ? " (Terlambat {$lateMinutes} menit)" : " (Tepat Waktu)") . ".",
            ]);
        } else {
            // CLOCK OUT FLOW
            if ($attendance->clock_out) {
                return response()->json([
                    'status' => 'warning',
                    'message' => "Karyawan {$employee->name} sudah melakukan check-out hari ini.",
                ], 400);
            }

            $attendance->update([
                'clock_out' => $timeStr,
            ]);

            return response()->json([
                'status' => 'success',
                'type' => 'out',
                'employee' => [
                    'name' => $employee->name,
                    'nip' => $employee->nip,
                    'role' => $employee->role,
                ],
                'time' => $now->format('H:i'),
                'message' => "Selamat jalan {$employee->name}, berhasil pulang pada pukul " . $now->format('H:i') . ". Hati-hati di jalan!",
            ]);
        }
    }

    public function manualStore(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'date' => ['required', 'date'],
            'clock_in' => ['nullable', 'string'],
            'clock_out' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:Present,Late,Absent,Leave'],
            'notes' => ['nullable', 'string'],
        ]);

        // Calculate late minutes if status is Late and clock_in is provided
        $lateMinutes = 0;
        if ($validated['status'] === 'Late' && $validated['clock_in']) {
            $lateGraceTimeStr = SppgSetting::getValue('late_grace_time', '06:30');
            $clockInTime = Carbon::parse($validated['clock_in']);
            $graceTime = Carbon::parse($lateGraceTimeStr);
            
            if ($clockInTime->gt($graceTime)) {
                $lateMinutes = $clockInTime->diffInMinutes($graceTime);
            }
        }

        Attendance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'date' => Carbon::parse($validated['date']),
            ],
            [
                'clock_in' => $validated['clock_in'] ? Carbon::parse($validated['clock_in'])->toTimeString() : null,
                'clock_out' => $validated['clock_out'] ? Carbon::parse($validated['clock_out'])->toTimeString() : null,
                'status' => $validated['status'],
                'late_minutes' => $lateMinutes,
                'notes' => $validated['notes'],
            ]
        );

        return redirect()->back()->with('success', 'Presensi berhasil diperbarui.');
    }
}
