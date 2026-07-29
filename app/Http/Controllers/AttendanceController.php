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
                    'notes' => $att->notes,
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

        $settings = SppgSetting::pluck('value', 'key')->toArray();

        return Inertia::render('Attendances', [
            'records' => $records,
            'selectedMonth' => $month,
            'selectedYear' => $year,
            'systemSettings' => $settings,
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
            'mode' => ['nullable', 'string', 'in:in,out'],
        ]);

        $mode = $validated['mode'] ?? null;

        $employee = Employee::with('shift')
            ->where('qr_token', $validated['qr_token'])
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
        $timeStr = $now->toTimeString();

        $scanContext = $this->resolveScanContext($employee, $now);
        $attendanceDate = $scanContext['attendanceDate'];

        // Check if there is already an attendance record for this shift date.
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $attendanceDate)
            ->first();

        $attendanceForOut = $this->findAttendanceForClockOut($employee, $now, $scanContext, $attendance);

        // Determine action based on mode
        if ($mode === 'in') {
            if ($scanContext['isOvernight'] && $scanContext['inGapPeriod']) {
                $startLabel = Carbon::parse($scanContext['workStartTime'])->format('H:i');
                return response()->json([
                    'status' => 'warning',
                    'message' => "Belum waktunya scan masuk untuk {$employee->name}. Shift malam dimulai pukul {$startLabel}.",
                ], 400);
            }

            if ($attendance && $attendance->clock_in) {
                return response()->json([
                    'status' => 'warning',
                    'message' => "Karyawan {$employee->name} sudah melakukan scan masuk untuk shift ini.",
                ], 400);
            }
            $action = 'in';
        } elseif ($mode === 'out') {
            if (!$attendanceForOut) {
                $hint = $employee->shift_id
                    ? 'Pastikan sudah scan masuk pada shift malam yang sama.'
                    : 'Karyawan belum memiliki shift. Pasang shift malam (lintas hari) di Data Karyawan.';
                return response()->json([
                    'status' => 'warning',
                    'message' => "Karyawan {$employee->name} belum memiliki absensi masuk yang bisa di-checkout. {$hint}",
                ], 400);
            }
            $attendance = $attendanceForOut;
            $action = 'out';
        } else {
            // Auto-detect fallback (API compatibility / tests)
            if ($attendanceForOut && !$attendanceForOut->clock_out) {
                $attendance = $attendanceForOut;
                $action = 'out';
            } else {
                $action = (!$attendance || !$attendance->clock_in) ? 'in' : 'out';
            }

            if ($action === 'in' && $scanContext['isOvernight'] && $scanContext['inGapPeriod']) {
                $startLabel = Carbon::parse($scanContext['workStartTime'])->format('H:i');
                return response()->json([
                    'status' => 'warning',
                    'message' => "Belum waktunya scan masuk untuk {$employee->name}. Shift malam dimulai pukul {$startLabel}.",
                ], 400);
            }
        }

        if ($action === 'in') {
            // CLOCK IN FLOW
            $lateGrace = $scanContext['lateGrace'];

            $isLate = $now->gt($lateGrace);
            $lateMinutes = 0;

            if ($isLate) {
                // Calculate lateness in minutes relative to the grace time
                $lateMinutes = (int) $now->diffInMinutes($lateGrace, true);
                $status = 'Late';
            } else {
                $status = 'Present';
            }

            if ($attendance) {
                $attendance->update([
                    'clock_in' => $timeStr,
                    'status' => $status,
                    'late_minutes' => $lateMinutes,
                ]);
            } else {
                $attendance = Attendance::create([
                    'employee_id' => $employee->id,
                    'date' => $attendanceDate,
                    'clock_in' => $timeStr,
                    'status' => $status,
                    'late_minutes' => $lateMinutes,
                ]);
            }

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
                'message' => "Halo {$employee->name}, berhasil masuk pada pukul " . $now->format('H:i') . ($isLate ? " (Terlambat {$this->formatMinutesDuration($lateMinutes)})" : " (Tepat Waktu)") . ".",
            ]);
        } else {
            // CLOCK OUT FLOW
            if ($attendance->clock_out) {
                return response()->json([
                    'status' => 'warning',
                    'message' => "Karyawan {$employee->name} sudah melakukan check-out untuk shift ini.",
                ], 400);
            }

            $workEnd = $this->resolveWorkEndForAttendanceDate($employee, Carbon::parse($attendance->date));

            if ($now->lt($workEnd)) {
                return response()->json([
                    'status' => 'warning',
                    'message' => "Karyawan {$employee->name} belum dapat scan pulang. Jam pulang shift adalah pukul " . $workEnd->format('H:i') . ".",
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

    private function resolveScanContext(Employee $employee, Carbon $now): array
    {
        $shift = $employee->shift;
        $workStartTimeStr = $shift ? $shift->start_time : SppgSetting::getValue('work_start_time', '06:00');
        $lateGraceTimeStr = $shift ? $shift->grace_time : SppgSetting::getValue('late_grace_time', '06:30');
        $workEndTimeStr = $shift ? $shift->end_time : SppgSetting::getValue('work_end_time', '15:00');

        $attendanceDate = $now->copy()->startOfDay();
        $isOvernight = $workEndTimeStr && $this->isOvernightShift($workStartTimeStr, $workEndTimeStr);
        $inGapPeriod = false;

        if ($isOvernight) {
            $endToday = $this->timeOnDate($workEndTimeStr, $now);
            $startToday = $this->timeOnDate($workStartTimeStr, $now);

            if ($now->lt($endToday)) {
                // Still inside previous overnight shift (after midnight, before end)
                $attendanceDate->subDay();
            } elseif ($now->lt($startToday)) {
                // Gap between shift end and next start (e.g. 07:00–23:00)
                // Check-in should not create tonight's shift yet; checkout uses open-session lookup
                $inGapPeriod = true;
            }
        }

        $workStart = $this->timeOnDate($workStartTimeStr, $attendanceDate);
        $lateGrace = $this->timeOnDate($lateGraceTimeStr, $attendanceDate);

        if ($isOvernight && $lateGrace->lt($workStart)) {
            $lateGrace->addDay();
        }

        return [
            'attendanceDate' => $attendanceDate->toDateString(),
            'lateGrace' => $lateGrace,
            'isOvernight' => $isOvernight,
            'inGapPeriod' => $inGapPeriod,
            'workStartTime' => $workStartTimeStr,
            'workEndTime' => $workEndTimeStr,
        ];
    }

    private function findAttendanceForClockOut(Employee $employee, Carbon $now, array $scanContext, ?Attendance $attendance): ?Attendance
    {
        // Prefer an open session that still belongs to the current overnight cycle
        if ($scanContext['isOvernight']) {
            $openSession = $this->findOpenOvernightSession($employee, $now, $scanContext);
            if ($openSession) {
                return $openSession;
            }
        }

        if ($attendance && $attendance->clock_in) {
            return $attendance;
        }

        return null;
    }

    private function findOpenOvernightSession(Employee $employee, Carbon $now, array $scanContext): ?Attendance
    {
        $workStartTimeStr = $scanContext['workStartTime'];

        $candidates = Attendance::where('employee_id', $employee->id)
            ->whereNotNull('clock_in')
            ->whereNull('clock_out')
            ->whereDate('date', '>=', $now->copy()->subDays(2)->toDateString())
            ->whereDate('date', '<=', $now->toDateString())
            ->orderByDesc('date')
            ->get();

        foreach ($candidates as $candidate) {
            $attendanceDate = Carbon::parse($candidate->date)->startOfDay();
            $shiftStart = $this->timeOnDate($workStartTimeStr, $attendanceDate);
            $nextShiftStart = $this->timeOnDate($workStartTimeStr, $attendanceDate->copy()->addDay());

            // Open overnight session remains valid until the next day's shift start
            // e.g. check-in 29 Jul 23:00 stays open for checkout until 30 Jul 23:00
            if ($now->gte($shiftStart) && $now->lt($nextShiftStart)) {
                return $candidate;
            }
        }

        return null;
    }

    private function resolveWorkEndForAttendanceDate(Employee $employee, Carbon $attendanceDate): Carbon
    {
        $shift = $employee->shift;
        $workStartTimeStr = $shift ? $shift->start_time : SppgSetting::getValue('work_start_time', '06:00');
        $workEndTimeStr = $shift ? $shift->end_time : SppgSetting::getValue('work_end_time', '15:00');
        $workStart = $this->timeOnDate($workStartTimeStr, $attendanceDate);
        $workEnd = $this->timeOnDate($workEndTimeStr, $attendanceDate);

        if ($this->isOvernightShift($workStartTimeStr, $workEndTimeStr) && $workEnd->lte($workStart)) {
            $workEnd->addDay();
        }

        return $workEnd;
    }

    private function isOvernightShift(string $startTime, string $endTime): bool
    {
        return $this->minutesFromTime($endTime) < $this->minutesFromTime($startTime);
    }

    private function minutesFromTime(string $time): int
    {
        $parsed = Carbon::parse($time);

        return ($parsed->hour * 60) + $parsed->minute;
    }

    private function timeOnDate(string $time, Carbon $date): Carbon
    {
        return Carbon::parse($date->toDateString() . ' ' . $time);
    }

    private function formatMinutesDuration(int $minutes): string
    {
        if ($minutes < 60) {
            return "{$minutes} menit";
        }

        $hours = intdiv($minutes, 60);
        $remainingMinutes = $minutes % 60;
        $formatted = "{$hours} jam";

        if ($remainingMinutes > 0) {
            $formatted .= " {$remainingMinutes} menit";
        }

        return $formatted;
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
            $employee = Employee::with('shift')->find($validated['employee_id']);
            $shift = $employee ? $employee->shift : null;
            $lateGraceTimeStr = $shift ? $shift->grace_time : SppgSetting::getValue('late_grace_time', '06:30');
            
            $clockInTime = Carbon::parse($validated['clock_in']);
            $graceTime = Carbon::parse($lateGraceTimeStr);
            
            if ($clockInTime->gt($graceTime)) {
                $lateMinutes = (int) $clockInTime->diffInMinutes($graceTime, true);
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

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return redirect()->back()->with('success', 'Rekor presensi berhasil dihapus.');
    }
}
