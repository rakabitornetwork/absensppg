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

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today()->toDateString();
        
        // If there is no data today, let's find the last date with attendance to make the dashboard look active
        $latestAttendanceDate = Attendance::max('date');
        $statDate = $latestAttendanceDate ? Carbon::parse($latestAttendanceDate) : Carbon::today();

        // Statistics
        $totalEmployees = Employee::where('status', 'Active')->count();
        $presentCount = Attendance::where('date', $statDate)->whereIn('status', ['Present', 'Late'])->count();
        $lateCount = Attendance::where('date', $statDate)->where('status', 'Late')->count();
        $absentCount = Attendance::where('date', $statDate)->where('status', 'Absent')->count();
        $leaveCount = Attendance::where('date', $statDate)->where('status', 'Leave')->count();

        // Calculate attendance rate
        $attendanceRate = $totalEmployees > 0 
            ? round(($presentCount / $totalEmployees) * 100) 
            : 0;

        // Recent Scans (last 10 overall for demo purposes, or filtered by statDate)
        $recentScans = Attendance::with('employee')
            ->orderBy('updated_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($att) {
                return [
                    'id' => $att->id,
                    'name' => $att->employee->name,
                    'role' => $att->employee->role,
                    'nip' => $att->employee->nip,
                    'date' => Carbon::parse($att->date)->format('d M Y'),
                    'clock_in' => $att->clock_in ? Carbon::parse($att->clock_in)->format('H:i') : '-',
                    'clock_out' => $att->clock_out ? Carbon::parse($att->clock_out)->format('H:i') : '-',
                    'status' => $att->status,
                    'late_minutes' => $att->late_minutes,
                ];
            });

        // SPPG Settings
        $settings = SppgSetting::pluck('value', 'key')->toArray();

        // Total payroll budget of previous month (May 2026)
        $totalPayrollBudget = Payroll::where('month', 5)->where('year', 2026)->sum('net_salary');

        // Meal prep status calculation
        // Check if Cook and Nutritionist checked in on $statDate
        $nutritionistPresent = Attendance::where('date', $statDate)
            ->whereHas('employee', function ($q) {
                $q->where('role', 'Tenaga Gizi');
            })->exists();
            
        $cookPresent = Attendance::where('date', $statDate)
            ->whereHas('employee', function ($q) {
                $q->where('role', 'Juru Masak');
            })->exists();

        $mealPrepStatus = 'Pending';
        if ($nutritionistPresent && $cookPresent) {
            $mealPrepStatus = 'Ready'; // Ready for service
        } elseif ($cookPresent) {
            $mealPrepStatus = 'Cooking'; // Preparing without dietitian approval
        }

        // Fetch past 30 days distribution history for chart rendering
        $distributionHistory = \App\Models\Distribution::orderBy('date', 'asc')
            ->take(30)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'date' => Carbon::parse($statDate)->format('d F Y'),
                'total_employees' => $totalEmployees,
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount,
                'leave' => $leaveCount,
                'attendance_rate' => $attendanceRate,
                'total_payroll' => $totalPayrollBudget,
                'meal_prep_status' => $mealPrepStatus,
            ],
            'recentScans' => $recentScans,
            'settings' => $settings,
            'distributionHistory' => $distributionHistory,
        ]);
    }
}
