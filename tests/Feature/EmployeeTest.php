<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic settings
        \App\Models\SppgSetting::create(['key' => 'office_name', 'value' => 'SPPG Sukajadi Mandiri']);
    }

    public function test_admin_can_bulk_delete_employees(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $employee1 = Employee::create([
            'nip' => 'SPPG-MBG-101',
            'name' => 'Karyawan A',
            'role' => 'Kepala Satuan',
            'email' => 'karyawan.a@sppg.com',
            'phone' => '081234567890',
            'base_salary' => 6500000,
            'weekly_allowance' => 35000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-A',
        ]);

        $employee2 = Employee::create([
            'nip' => 'SPPG-MBG-102',
            'name' => 'Karyawan B',
            'role' => 'Tenaga Gizi',
            'email' => 'karyawan.b@sppg.com',
            'phone' => '081234567891',
            'base_salary' => 4800000,
            'weekly_allowance' => 30000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-B',
        ]);

        $employee3 = Employee::create([
            'nip' => 'SPPG-MBG-103',
            'name' => 'Karyawan C',
            'role' => 'Juru Masak',
            'email' => 'karyawan.c@sppg.com',
            'phone' => '081234567892',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-C',
        ]);

        $response = $this->actingAs($admin)
            ->post('/employees/bulk-delete', [
                'ids' => [$employee1->id, $employee2->id],
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseMissing('employees', ['id' => $employee1->id]);
        $this->assertDatabaseMissing('employees', ['id' => $employee2->id]);
        $this->assertDatabaseHas('employees', ['id' => $employee3->id]);
    }

    public function test_admin_can_delete_employee(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-108',
            'name' => 'Karyawan H',
            'role' => 'Juru Masak',
            'email' => 'karyawan.h@sppg.com',
            'phone' => '081234567897',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-H',
        ]);

        $response = $this->actingAs($admin)
            ->post("/employees/{$employee->id}/delete");

        $response->assertRedirect();
        $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
    }

    public function test_admin_can_update_employee(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-109',
            'name' => 'Karyawan I',
            'role' => 'Juru Masak',
            'email' => 'karyawan.i@sppg.com',
            'phone' => '081234567898',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-I',
        ]);

        $response = $this->actingAs($admin)
            ->post("/employees/{$employee->id}/update", [
                'nip' => 'SPPG-MBG-109',
                'name' => 'Karyawan I Diperbarui',
                'role' => 'Tenaga Gizi',
                'email' => 'karyawan.i@sppg.com',
                'phone' => '081999999999',
                'base_salary' => 5000000,
                'weekly_allowance' => 30000,
                'status' => 'Active',
            ]);

        $response->assertRedirect();

        $employee->refresh();
        $this->assertEquals('Karyawan I Diperbarui', $employee->name);
        $this->assertEquals('Tenaga Gizi', $employee->role);
        $this->assertEquals(5000000, $employee->base_salary);
    }

    public function test_admin_can_upload_employee_photo(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        \Illuminate\Support\Facades\Storage::fake('public');
        $file = \Illuminate\Http\UploadedFile::fake()->image('avatar.png');

        $response = $this->actingAs($admin)
            ->post('/employees', [
                'nip' => 'SPPG-MBG-104',
                'name' => 'Karyawan D',
                'role' => 'Juru Masak',
                'email' => 'karyawan.d@sppg.com',
                'phone' => '081234567893',
                'base_salary' => 4000000,
                'weekly_allowance' => 25000,
                'status' => 'Active',
                'photo' => $file,
            ]);

        $response->assertRedirect();
        
        $employee = Employee::where('nip', 'SPPG-MBG-104')->first();
        $this->assertNotNull($employee);
        $this->assertNotNull($employee->photo_path);
        
        // Clean up uploaded file in local filesystem since we are testing in local environment
        $localPath = public_path(ltrim($employee->photo_path, '/'));
        if (file_exists($localPath)) {
            @unlink($localPath);
        }
    }

    public function test_admin_can_update_custom_role(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-105',
            'name' => 'Karyawan E',
            'role' => 'Asisten Lapangan',
            'email' => 'karyawan.e@sppg.com',
            'phone' => '081234567894',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-E',
        ]);

        $response = $this->actingAs($admin)
            ->post('/employees/roles/update', [
                'old_role' => 'Asisten Lapangan',
                'new_role' => 'Asisten Lapangan Baru',
            ]);

        $response->assertRedirect();
        
        $employee->refresh();
        $this->assertEquals('Asisten Lapangan Baru', $employee->role);
    }

    public function test_admin_can_delete_custom_role(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-106',
            'name' => 'Karyawan F',
            'role' => 'Team Persiapan',
            'email' => 'karyawan.f@sppg.com',
            'phone' => '081234567895',
            'base_salary' => 4000000,
            'weekly_allowance' => 25000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-F',
        ]);

        $response = $this->actingAs($admin)
            ->post('/employees/roles/delete', [
                'role' => 'Team Persiapan',
            ]);

        $response->assertRedirect();
        
        $employee->refresh();
        // Should be reassigned to the default 'Juru Masak'
        $this->assertEquals('Juru Masak', $employee->role);
    }

    public function test_weekly_allowance_calculation_caps_at_five_days_per_week(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $employee = Employee::create([
            'nip' => 'SPPG-MBG-107',
            'name' => 'Karyawan G',
            'role' => 'Juru Masak',
            'email' => 'karyawan.g@sppg.com',
            'phone' => '081234567896',
            'base_salary' => 4000000,
            'weekly_allowance' => 250000,
            'status' => 'Active',
            'qr_token' => 'SPPG-TOKEN-G',
        ]);

        // Week 23: 3 days present
        $datesWeek23 = ['2026-06-01', '2026-06-02', '2026-06-03'];
        foreach ($datesWeek23 as $date) {
            \App\Models\Attendance::create([
                'employee_id' => $employee->id,
                'date' => $date,
                'status' => 'Present',
                'clock_in' => '06:00:00',
                'clock_out' => '14:00:00',
                'late_minutes' => 0,
            ]);
        }

        // Week 24: 6 days present
        $datesWeek24 = ['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13'];
        foreach ($datesWeek24 as $date) {
            \App\Models\Attendance::create([
                'employee_id' => $employee->id,
                'date' => $date,
                'status' => 'Present',
                'clock_in' => '06:00:00',
                'clock_out' => '14:00:00',
                'late_minutes' => 0,
            ]);
        }

        // Generate payroll for June (month 6), 2026
        $response = $this->actingAs($admin)
            ->post('/payrolls/generate', [
                'month' => 6,
                'year' => 2026,
            ]);

        $response->assertRedirect();

        // Check if payroll record is created with correct weekly allowances total
        // Week 23 allowance: 3 * (250,000 / 5) = 150,000
        // Week 24 allowance: min(6, 5) * (250,000 / 5) = 250,000
        // Expected total weekly allowance = 400,000
        $payroll = \App\Models\Payroll::where('employee_id', $employee->id)
            ->where('month', 6)
            ->where('year', 2026)
            ->first();

        $this->assertNotNull($payroll);
        $this->assertEquals(400000, $payroll->weekly_allowances_total);
    }
}
