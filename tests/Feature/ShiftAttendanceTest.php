<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ShiftAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic settings
        \App\Models\SppgSetting::create(['key' => 'office_name', 'value' => 'SPPG Sukajadi Mandiri']);
        \App\Models\SppgSetting::create(['key' => 'work_start_time', 'value' => '06:00']);
        \App\Models\SppgSetting::create(['key' => 'late_grace_time', 'value' => '06:30']);
        \App\Models\SppgSetting::create(['key' => 'late_penalty_per_minute', 'value' => '1000']);
    }

    public function test_admin_can_crud_shifts(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
        ]);

        // 1. Create Shift
        $response = $this->actingAs($admin)
            ->post('/settings/shifts', [
                'name' => 'Shift Sore',
                'start_time' => '14:00',
                'grace_time' => '14:30',
                'end_time' => '22:00',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('shifts', ['name' => 'Shift Sore', 'start_time' => '14:00']);

        $shift = Shift::where('name', 'Shift Sore')->first();

        // 2. Update Shift
        $response = $this->actingAs($admin)
            ->post("/settings/shifts/{$shift->id}/update", [
                'name' => 'Shift Sore Updated',
                'start_time' => '15:00',
                'grace_time' => '15:15',
                'end_time' => '23:00',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('shifts', ['id' => $shift->id, 'name' => 'Shift Sore Updated', 'grace_time' => '15:15']);

        // 3. Delete Shift
        $response = $this->actingAs($admin)
            ->post("/settings/shifts/{$shift->id}/delete");

        $response->assertRedirect();
        $this->assertDatabaseMissing('shifts', ['id' => $shift->id]);
    }

    public function test_employee_attendance_calculates_lateness_based_on_shift(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
        ]);

        // Create a custom shift
        $shift = Shift::create([
            'name' => 'Shift Siang',
            'start_time' => '12:00',
            'grace_time' => '12:30',
            'end_time' => '20:00',
        ]);

        // Create an employee assigned to this shift
        $employee = Employee::create([
            'nip' => 'SPPG-MBG-999',
            'name' => 'Budi Shift',
            'role' => 'Juru Masak',
            'email' => 'budi.shift@sppg.com',
            'phone' => '081234567895',
            'base_salary' => 4000000,
            'daily_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-BUDI-SHIFT',
            'shift_id' => $shift->id,
        ]);

        // 1. Uji Coba Scan Masuk: tepat waktu (pukul 12:15, di bawah grace time 12:30)
        // Set clock to 12:15
        Carbon::setTestNow(Carbon::create(2026, 6, 13, 12, 15, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-BUDI-SHIFT',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('attendances', [
            'employee_id' => $employee->id,
            'status' => 'Present',
            'late_minutes' => 0,
        ]);

        // Clear attendance database for next scan test
        Attendance::truncate();

        // 2. Uji Coba Scan Masuk: terlambat (pukul 12:45, di atas grace time 12:30)
        // Set clock to 12:45
        Carbon::setTestNow(Carbon::create(2026, 6, 13, 12, 45, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-BUDI-SHIFT',
        ]);

        $response->assertStatus(200);
        // Lateness should be from grace time (12:30) to clock-in time (12:45) -> 15 minutes
        $this->assertDatabaseHas('attendances', [
            'employee_id' => $employee->id,
            'status' => 'Late',
            'late_minutes' => 15,
        ]);

        // Reset clock
        Carbon::setTestNow();
    }
}
