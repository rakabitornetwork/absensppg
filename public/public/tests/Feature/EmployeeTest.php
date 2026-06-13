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
        ]);

        $employee1 = Employee::create([
            'nip' => 'SPPG-MBG-101',
            'name' => 'Karyawan A',
            'role' => 'Kepala Satuan',
            'email' => 'karyawan.a@sppg.com',
            'phone' => '081234567890',
            'base_salary' => 6500000,
            'daily_allowance' => 35000,
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
            'daily_allowance' => 30000,
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
            'daily_allowance' => 25000,
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

    public function test_admin_can_upload_employee_photo(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@sppg.com',
            'password' => bcrypt('password'),
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
                'daily_allowance' => 25000,
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
}
