<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DatabaseMaintenanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UpdateController;
use App\Http\Controllers\DistributionTargetController;
use App\Http\Controllers\DistributionRealizationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Public Attendance Scanner
Route::redirect('/', '/scanner');
Route::get('/scanner', [AttendanceController::class, 'showScanner']);
Route::post('/attendance/scan', [AttendanceController::class, 'scan']);

// Protected Admin Routes
Route::middleware(['auth'])->group(function () {
    // Shared Routes: Dashboard, Profile, and Distribution Pages (accessible by superadmin, admin, distributor)
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    Route::get('/profile', [ProfileController::class, 'edit']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar/delete', [ProfileController::class, 'destroyAvatar']);

    Route::get('/target-distribusi', [DistributionTargetController::class, 'index']);
    Route::post('/target-distribusi', [DistributionTargetController::class, 'update']);

    Route::get('/realisasi-distribusi', [DistributionRealizationController::class, 'index']);
    Route::post('/realisasi-distribusi/lock', [DistributionRealizationController::class, 'lockToday']);
    Route::post('/realisasi-distribusi/unlock', [DistributionRealizationController::class, 'unlockToday']);

    // Admin & Superadmin only
    Route::middleware(['role:superadmin,admin'])->group(function () {
        // Karyawan CRUD (Write/Edit)
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::post('/employees/{employee}/update', [EmployeeController::class, 'update']);
        Route::get('/employees/print-cards', [EmployeeController::class, 'printCards']);

        // Absensi (Write/Edit)
        Route::get('/attendances', [AttendanceController::class, 'index']);
        Route::post('/attendances/manual', [AttendanceController::class, 'manualStore']);

        // Payroll
        Route::get('/payrolls', [PayrollController::class, 'index']);
        Route::post('/payrolls/generate', [PayrollController::class, 'generate']);
        Route::post('/payrolls/{payroll}/update', [PayrollController::class, 'update']);
        Route::get('/payrolls/{payroll}/payslip', [PayrollController::class, 'payslip']);

        // Pengaturan
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);
        Route::post('/settings/shifts', [SettingController::class, 'storeShift']);
        Route::post('/settings/shifts/{shift}/update', [SettingController::class, 'updateShift']);

        // Update Aplikasi
        Route::get('/update', [UpdateController::class, 'index']);
        Route::post('/update/check', [UpdateController::class, 'checkForUpdates']);
        Route::post('/update/run', [UpdateController::class, 'runUpdate']);

        // Pemeliharaan Database
        Route::any('/database/{legacyPath?}', [DatabaseMaintenanceController::class, 'legacyRedirect'])->where('legacyPath', '.*');
        Route::get('/pemeliharaan-data', [DatabaseMaintenanceController::class, 'index']);
        Route::get('/pemeliharaan-data/backup', [DatabaseMaintenanceController::class, 'backup']);
        Route::post('/pemeliharaan-data/restore', [DatabaseMaintenanceController::class, 'restore']);

        // User & RBAC Management (Accessible by superadmin and admin)
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::post('/users/{user}/update', [UserController::class, 'update']);
        Route::post('/users/{user}/delete', [UserController::class, 'destroy']);
    });

    // Superadmin (IT Team) only - Delete / Reset operations
    Route::middleware(['role:superadmin'])->group(function () {
        Route::post('/employees/{employee}/delete', [EmployeeController::class, 'destroy']);
        Route::post('/employees/bulk-delete', [EmployeeController::class, 'bulkDestroy']);
        Route::post('/attendances/{attendance}/delete', [AttendanceController::class, 'destroy']);
        Route::post('/settings/shifts/{shift}/delete', [SettingController::class, 'destroyShift']);
        Route::post('/pemeliharaan-data/reset', [DatabaseMaintenanceController::class, 'reset']);
    });
});
