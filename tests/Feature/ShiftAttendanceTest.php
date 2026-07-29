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
            'role' => 'superadmin',
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
            'role' => 'superadmin',
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
            'weekly_allowance' => 25000,
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

    public function test_overnight_shift_scan_after_midnight_is_late_for_previous_shift_date(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Malam',
            'start_time' => '20:00',
            'grace_time' => '20:05',
            'end_time' => '07:30',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-666',
            'name' => 'Karyawan Malam',
            'role' => 'Juru Masak',
            'email' => 'malam@sppg.com',
            'phone' => '081234567866',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-MALAM',
            'shift_id' => $shift->id,
        ]);

        Carbon::setTestNow(Carbon::create(2026, 6, 13, 5, 0, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MALAM',
            'mode' => 'in',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('attendance_status', 'Late');
        $response->assertJsonPath('late_minutes', 535);
        $this->assertStringContainsString('Terlambat 8 jam 55 menit', $response->json('message'));

        $attendance = Attendance::where('employee_id', $employee->id)->first();

        $this->assertTrue($attendance->date->isSameDay('2026-06-12'));
        $this->assertSame('05:00:00', $attendance->clock_in);
        $this->assertSame('Late', $attendance->status);
        $this->assertSame(535, $attendance->late_minutes);

        Carbon::setTestNow();
    }

    public function test_overnight_shift_clock_out_after_midnight_updates_previous_shift_attendance(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Malam',
            'start_time' => '20:00',
            'grace_time' => '20:05',
            'end_time' => '07:30',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-665',
            'name' => 'Karyawan Pulang Malam',
            'role' => 'Juru Masak',
            'email' => 'pulang.malam@sppg.com',
            'phone' => '081234567865',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-PULANG-MALAM',
            'shift_id' => $shift->id,
        ]);

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => '2026-06-12',
            'clock_in' => '20:00:00',
            'status' => 'Present',
            'late_minutes' => 0,
        ]);

        Carbon::setTestNow(Carbon::create(2026, 6, 13, 7, 45, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-PULANG-MALAM',
            'mode' => 'out',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('type', 'out');

        $attendance = Attendance::where('employee_id', $employee->id)->first();

        $this->assertTrue($attendance->date->isSameDay('2026-06-12'));
        $this->assertSame('07:45:00', $attendance->clock_out);

        Carbon::setTestNow();
    }

    public function test_employee_cannot_clock_out_before_shift_end_time(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Pagi',
            'start_time' => '08:00',
            'grace_time' => '08:05',
            'end_time' => '13:00',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-664',
            'name' => 'Karyawan Pulang Awal',
            'role' => 'Juru Masak',
            'email' => 'pulang.awal@sppg.com',
            'phone' => '081234567864',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-PULANG-AWAL',
            'shift_id' => $shift->id,
        ]);

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => '2026-06-13',
            'clock_in' => '08:00:00',
            'status' => 'Present',
            'late_minutes' => 0,
        ]);

        Carbon::setTestNow(Carbon::create(2026, 6, 13, 12, 30, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-PULANG-AWAL',
            'mode' => 'out',
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('status', 'warning');
        $this->assertStringContainsString('belum dapat scan pulang', $response->json('message'));

        $this->assertDatabaseHas('attendances', [
            'employee_id' => $employee->id,
            'clock_out' => null,
        ]);

        Carbon::setTestNow();
    }

    public function test_overnight_shift_cannot_clock_out_before_next_day_end_time(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Malam',
            'start_time' => '20:00',
            'grace_time' => '20:05',
            'end_time' => '07:30',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-663',
            'name' => 'Karyawan Pulang Awal Malam',
            'role' => 'Juru Masak',
            'email' => 'pulang.awal.malam@sppg.com',
            'phone' => '081234567863',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-PULANG-AWAL-MALAM',
            'shift_id' => $shift->id,
        ]);

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => '2026-06-12',
            'clock_in' => '20:00:00',
            'status' => 'Present',
            'late_minutes' => 0,
        ]);

        Carbon::setTestNow(Carbon::create(2026, 6, 13, 7, 0, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-PULANG-AWAL-MALAM',
            'mode' => 'out',
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('status', 'warning');
        $this->assertStringContainsString('Jam pulang shift adalah pukul 07:30', $response->json('message'));

        $attendance = Attendance::where('employee_id', $employee->id)->first();

        $this->assertNull($attendance->clock_out);

        Carbon::setTestNow();
    }

    public function test_admin_can_delete_attendance_record(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-888',
            'name' => 'Karyawan Hapus',
            'role' => 'Juru Masak',
            'email' => 'hapus@sppg.com',
            'phone' => '081234567896',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-HAPUS',
        ]);

        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'date' => '2026-06-13',
            'clock_in' => '08:00:00',
            'status' => 'Present',
            'late_minutes' => 0,
        ]);

        $response = $this->actingAs($admin)
            ->post("/attendances/{$attendance->id}/delete");

        $response->assertRedirect();
        $this->assertDatabaseMissing('attendances', ['id' => $attendance->id]);
    }

    public function test_employee_scan_mode_prevents_double_scan(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 6, 13, 16, 0, 0));

        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-777',
            'name' => 'Karyawan Mode',
            'role' => 'Juru Masak',
            'email' => 'mode@sppg.com',
            'phone' => '081234567897',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-MODE',
        ]);

        // 1. Scan masuk pertama kali (mode: 'in') -> Berhasil
        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MODE',
            'mode' => 'in',
        ]);
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('type', 'in');

        // 2. Scan masuk kedua kali (mode: 'in') -> Gagal / Warning (Mencegah double scan masuk)
        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MODE',
            'mode' => 'in',
        ]);
        $response->assertStatus(400);
        $response->assertJsonPath('status', 'warning');

        // 3. Scan pulang pertama kali (mode: 'out') -> Berhasil
        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MODE',
            'mode' => 'out',
        ]);
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('type', 'out');

        // 4. Scan pulang kedua kali (mode: 'out') -> Gagal / Warning (Mencegah double scan pulang)
        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MODE',
            'mode' => 'out',
        ]);
        $response->assertStatus(400);
        $response->assertJsonPath('status', 'warning');

        Carbon::setTestNow();
    }

    public function test_scan_out_first_does_not_create_clock_in_attendance(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        Employee::create([
            'nip' => 'SPPG-MBG-776',
            'name' => 'Karyawan Pulang Dulu',
            'role' => 'Juru Masak',
            'email' => 'pulang.dulu@sppg.com',
            'phone' => '081234567876',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-PULANG-DULU',
        ]);

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-PULANG-DULU',
            'mode' => 'out',
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('status', 'warning');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_cook_overnight_shift_23_to_07_can_clock_out_after_end_time(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Masak Malam',
            'start_time' => '23:00',
            'grace_time' => '23:05',
            'end_time' => '07:00',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-MASAK-01',
            'name' => 'Juru Masak Malam',
            'role' => 'Juru Masak',
            'email' => 'masak.malam@sppg.com',
            'phone' => '081200000001',
            'base_salary' => 180000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-MASAK-MALAM',
            'shift_id' => $shift->id,
        ]);

        Carbon::setTestNow(Carbon::create(2026, 7, 29, 23, 2, 0));

        $inResponse = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MASAK-MALAM',
            'mode' => 'in',
        ]);
        $inResponse->assertStatus(200);
        $inResponse->assertJsonPath('type', 'in');

        Carbon::setTestNow(Carbon::create(2026, 7, 30, 7, 5, 0));

        $outResponse = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MASAK-MALAM',
            'mode' => 'out',
        ]);
        $outResponse->assertStatus(200);
        $outResponse->assertJsonPath('type', 'out');

        $attendance = Attendance::where('employee_id', $employee->id)->first();
        $this->assertTrue($attendance->date->isSameDay('2026-07-29'));
        $this->assertSame('23:02:00', $attendance->clock_in);
        $this->assertSame('07:05:00', $attendance->clock_out);

        Carbon::setTestNow();
    }

    public function test_cook_overnight_shift_can_clock_out_during_daytime_gap(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Masak Malam',
            'start_time' => '23:00',
            'grace_time' => '23:05',
            'end_time' => '07:00',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-MASAK-02',
            'name' => 'Juru Masak Telat Pulang',
            'role' => 'Juru Masak',
            'email' => 'masak.telat@sppg.com',
            'phone' => '081200000002',
            'base_salary' => 180000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-MASAK-TELAT',
            'shift_id' => $shift->id,
        ]);

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => '2026-07-29',
            'clock_in' => '23:00:00',
            'status' => 'Present',
            'late_minutes' => 0,
        ]);

        // Midday gap (after 07:00, before next 23:00) — previously often failed
        Carbon::setTestNow(Carbon::create(2026, 7, 30, 10, 30, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MASAK-TELAT',
            'mode' => 'out',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('type', 'out');

        $attendance = Attendance::where('employee_id', $employee->id)->first();
        $this->assertSame('10:30:00', $attendance->clock_out);

        Carbon::setTestNow();
    }

    public function test_overnight_gap_period_blocks_premature_clock_in(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);

        $shift = Shift::create([
            'name' => 'Shift Masak Malam',
            'start_time' => '23:00',
            'grace_time' => '23:05',
            'end_time' => '07:00',
        ]);

        Employee::create([
            'nip' => 'SPPG-MBG-MASAK-03',
            'name' => 'Juru Masak Siang Salah',
            'role' => 'Juru Masak',
            'email' => 'masak.salah@sppg.com',
            'phone' => '081200000003',
            'base_salary' => 180000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'TOKEN-MASAK-SALAH',
            'shift_id' => $shift->id,
        ]);

        Carbon::setTestNow(Carbon::create(2026, 7, 30, 10, 0, 0));

        $response = $this->actingAs($admin)->postJson('/attendance/scan', [
            'qr_token' => 'TOKEN-MASAK-SALAH',
            'mode' => 'in',
        ]);

        $response->assertStatus(400);
        $this->assertStringContainsString('Belum waktunya scan masuk', $response->json('message'));
        $this->assertDatabaseCount('attendances', 0);

        Carbon::setTestNow();
    }
}
