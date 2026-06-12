<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\SppgSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Clean up existing records to avoid UNIQUE constraint violations and reset IDs
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\Payroll::truncate();
        \App\Models\Attendance::truncate();
        \App\Models\Employee::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        // 2. Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@sppg.com'],
            [
                'name' => 'Admin SPPG MBG',
                'password' => Hash::make('12345678'),
            ]
        );

        // 2. Create SPPG Default Settings
        $settings = [
            'work_start_time' => '06:00',
            'late_grace_time' => '06:30',
            'late_penalty_per_minute' => '1000',
            'office_name' => 'SPPG Sukajadi Mandiri',
            'meal_target' => '250', // Target porsi makan gratis harian
        ];

        foreach ($settings as $key => $val) {
            SppgSetting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 3. Create Employees
        $employeesData = [
            [
                'nip' => 'SPPG-MBG-001',
                'name' => 'Budi Santoso',
                'role' => 'Kepala Satuan',
                'email' => 'budi.santoso@sppg.com',
                'phone' => '081234567890',
                'base_salary' => 6500000,
                'daily_allowance' => 35000,
                'status' => 'Active',
                'qr_token' => 'SPPG-TOKEN-BUDI-001',
            ],
            [
                'nip' => 'SPPG-MBG-002',
                'name' => 'Siti Rahma, S.Gz',
                'role' => 'Tenaga Gizi',
                'email' => 'siti.rahma@sppg.com',
                'phone' => '081234567891',
                'base_salary' => 4800000,
                'daily_allowance' => 30000,
                'status' => 'Active',
                'qr_token' => 'SPPG-TOKEN-SITI-002',
            ],
            [
                'nip' => 'SPPG-MBG-003',
                'name' => 'Agus Wijaya',
                'role' => 'Juru Masak',
                'email' => 'agus.wijaya@sppg.com',
                'phone' => '081234567892',
                'base_salary' => 4000000,
                'daily_allowance' => 25000,
                'status' => 'Active',
                'qr_token' => 'SPPG-TOKEN-AGUS-003',
            ],
            [
                'nip' => 'SPPG-MBG-004',
                'name' => 'Lina Marlina',
                'role' => 'Asisten Masak',
                'email' => 'lina.marlina@sppg.com',
                'phone' => '081234567893',
                'base_salary' => 3200000,
                'daily_allowance' => 25000,
                'status' => 'Active',
                'qr_token' => 'SPPG-TOKEN-LINA-004',
            ],
            [
                'nip' => 'SPPG-MBG-005',
                'name' => 'Eko Prasetyo',
                'role' => 'Pengantar/Kurir',
                'email' => 'eko.prasetyo@sppg.com',
                'phone' => '081234567894',
                'base_salary' => 3500000,
                'daily_allowance' => 35000,
                'status' => 'Active',
                'qr_token' => 'SPPG-TOKEN-EKO-005',
            ],
            [
                'nip' => 'SPPG-MBG-006',
                'name' => 'Dewi Lestari',
                'role' => 'Administrasi',
                'email' => 'dewi.lestari@sppg.com',
                'phone' => '081234567895',
                'base_salary' => 3800000,
                'daily_allowance' => 25000,
                'status' => 'Active',
                'qr_token' => 'SPPG-TOKEN-DEWI-006',
            ],
        ];

        $employees = [];
        foreach ($employeesData as $empData) {
            $employees[] = Employee::updateOrCreate(['nip' => $empData['nip']], $empData);
        }

        // 4. Seed Attendance History for May 2026 (1 month ago) and June 2026 (current)
        // Let's seed for workdays (Monday to Friday) from May 1, 2026 to June 12, 2026
        $startDate = Carbon::create(2026, 5, 1);
        $endDate = Carbon::create(2026, 6, 12);

        $workdaysCount = []; // employee_id => days_present in May
        $lateDaysCount = []; // employee_id => days_late in May

        foreach ($employees as $emp) {
            $workdaysCount[$emp->id] = 0;
            $lateDaysCount[$emp->id] = 0;
        }

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            if ($date->isWeekend()) {
                continue;
            }

            $isMay = $date->month === 5;

            foreach ($employees as $emp) {
                // Determine status and times
                // We add some randomness: 90% chance of present, 10% chance of absent
                $rand = rand(1, 100);
                if ($rand <= 5) {
                    // Absent
                    Attendance::updateOrCreate(
                        ['employee_id' => $emp->id, 'date' => $date->copy()],
                        [
                            'clock_in' => null,
                            'clock_out' => null,
                            'status' => 'Absent',
                            'late_minutes' => 0,
                            'notes' => 'Tanpa Keterangan / Alpa',
                        ]
                    );
                    continue;
                } elseif ($rand <= 8) {
                    // On Leave
                    Attendance::updateOrCreate(
                        ['employee_id' => $emp->id, 'date' => $date->copy()],
                        [
                            'clock_in' => null,
                            'clock_out' => null,
                            'status' => 'Leave',
                            'late_minutes' => 0,
                            'notes' => 'Izin Sakit / Keperluan Keluarga',
                        ]
                    );
                    continue;
                }

                // Present. Let's decide if they are late
                // Grace time is 06:30, start is 06:00
                $latePercent = 15; // 15% chance of being late
                $isLate = rand(1, 100) <= $latePercent;

                if ($isLate) {
                    $lateMinutes = rand(1, 45); // late by 1 to 45 mins
                    $checkInHour = 6;
                    $checkInMinute = 30 + $lateMinutes;
                    if ($checkInMinute >= 60) {
                        $checkInHour += 1;
                        $checkInMinute -= 60;
                    }
                    $clockIn = sprintf('%02d:%02d:%02d', $checkInHour, $checkInMinute, rand(0, 59));
                    $status = 'Late';

                    if ($isMay) {
                        $lateDaysCount[$emp->id]++;
                    }
                } else {
                    $lateMinutes = 0;
                    // Check in between 05:40 and 06:29
                    $checkInHour = rand(5, 6);
                    if ($checkInHour === 5) {
                        $checkInMinute = rand(40, 59);
                    } else {
                        $checkInMinute = rand(0, 29);
                    }
                    $clockIn = sprintf('%02d:%02d:%02d', $checkInHour, $checkInMinute, rand(0, 59));
                    $status = 'Present';
                }

                if ($isMay) {
                    $workdaysCount[$emp->id]++;
                }

                // Clock out time between 15:00 and 15:30
                $clockOut = sprintf('15:%02d:%02d', rand(0, 30), rand(0, 59));

                Attendance::updateOrCreate(
                    ['employee_id' => $emp->id, 'date' => $date->copy()],
                    [
                        'clock_in' => $clockIn,
                        'clock_out' => $clockOut,
                        'status' => $status,
                        'late_minutes' => $lateMinutes,
                    ]
                );
            }
        }

        // 5. Generate Payroll for May 2026
        foreach ($employees as $emp) {
            $daysPresent = $workdaysCount[$emp->id];
            $daysLate = $lateDaysCount[$emp->id];

            $baseSalary = $emp->base_salary;
            $allowanceTotal = $daysPresent * $emp->daily_allowance;
            
            // Penalty: Rp 1.000 per minute late, or another policy
            // Let's check from all May attendances
            $totalLateMinutes = Attendance::where('employee_id', $emp->id)
                ->whereMonth('date', 5)
                ->whereYear('date', 2026)
                ->sum('late_minutes');

            $penaltyRate = 1000;
            $deductions = $totalLateMinutes * $penaltyRate;

            // Let's add a bonus for cook and server if they meet targets
            $bonus = 0;
            if (in_array($emp->role, ['Juru Masak', 'Asisten Masak'])) {
                $bonus = 150000; // Meal prep compliance bonus
            }

            $netSalary = $baseSalary + $allowanceTotal + $bonus - $deductions;

            Payroll::updateOrCreate(
                [
                    'employee_id' => $emp->id,
                    'month' => 5,
                    'year' => 2026
                ],
                [
                    'days_present' => $daysPresent,
                    'days_late' => $daysLate,
                    'base_salary' => $baseSalary,
                    'daily_allowances_total' => $allowanceTotal,
                    'bonuses' => $bonus,
                    'deductions' => $deductions,
                    'net_salary' => $netSalary,
                    'status' => 'Paid',
                    'payment_date' => '2026-05-31',
                ]
            );
        }
    }
}
