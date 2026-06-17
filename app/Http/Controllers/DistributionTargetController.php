<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\SppgSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DistributionTargetController extends Controller
{
    public function index(): Response
    {
        $latestAttendanceDate = Attendance::max('date');
        $statDate = $latestAttendanceDate ? Carbon::parse($latestAttendanceDate) : Carbon::today();

        // Load settings
        $settings = SppgSetting::pluck('value', 'key')->toArray();

        // Default menu if not exists
        $todayMenu = isset($settings['today_menu']) 
            ? json_decode($settings['today_menu'], true) 
            : [
                'carbohydrate' => 'Nasi Putih Organik',
                'protein_hewan' => 'Ayam Goreng Lengkuas',
                'protein_nabati' => 'Tempe Mendoan Hangat',
                'vegetable' => 'Sayur Sop Wortel & Bakso',
                'beverage' => 'Susu Kotak UHT & Buah Jeruk Manis'
            ];

        // Default distribution points if not exists
        $distributionPoints = isset($settings['distribution_points'])
            ? json_decode($settings['distribution_points'], true)
            : [
                ['id' => 1, 'name' => 'SDN 01 Sukajadi', 'qty' => 120, 'status' => 'Delivered'],
                ['id' => 2, 'name' => 'SDN 02 Sukajadi', 'qty' => 80, 'status' => 'In Progress'],
                ['id' => 3, 'name' => 'Pos PAUD Melati', 'qty' => 50, 'status' => 'Pending']
            ];

        // Kitchen Staff Status
        $kitchenStaff = Employee::where('status', 'Active')
            ->whereIn('role', ['Juru Masak', 'Tenaga Gizi', 'Asisten Masak'])
            ->get()
            ->map(function ($employee) use ($statDate) {
                $attendance = Attendance::where('employee_id', $employee->id)
                    ->where('date', $statDate->toDateString())
                    ->first();

                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'role' => $employee->role,
                    'nip' => $employee->nip,
                    'present' => $attendance ? true : false,
                    'status' => $attendance ? $attendance->status : 'Absent',
                    'clock_in' => $attendance && $attendance->clock_in ? Carbon::parse($attendance->clock_in)->format('H:i') : '-',
                ];
            });

        return Inertia::render('DistributionTargets', [
            'settings' => $settings,
            'todayMenu' => $todayMenu,
            'distributionPoints' => $distributionPoints,
            'kitchenStaff' => $kitchenStaff,
            'dateFormatted' => $statDate->format('d F Y'),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'today_menu' => ['required', 'array'],
            'distribution_points' => ['required', 'array'],
        ]);

        SppgSetting::setValue('today_menu', json_encode($request->today_menu));
        SppgSetting::setValue('distribution_points', json_encode($request->distribution_points));

        return redirect()->back()->with('success', 'Data distribusi harian berhasil diperbarui.');
    }
}
