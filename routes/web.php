<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UpdateController;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Protected Admin Routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index']);

    // Karyawan CRUD
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::post('/employees/{employee}/update', [EmployeeController::class, 'update']);
    Route::post('/employees/{employee}/delete', [EmployeeController::class, 'destroy']);
    Route::post('/employees/bulk-delete', [EmployeeController::class, 'bulkDestroy']);
    Route::get('/employees/print-cards', [EmployeeController::class, 'printCards']);

    // Absensi
    Route::get('/scanner', [AttendanceController::class, 'showScanner']);
    Route::post('/attendance/scan', [AttendanceController::class, 'scan']);
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
    Route::post('/settings/shifts/{shift}/delete', [SettingController::class, 'destroyShift']);

    // Update Aplikasi
    Route::get('/update', [UpdateController::class, 'index']);
    Route::post('/update/check', [UpdateController::class, 'checkForUpdates']);
    Route::post('/update/run', [UpdateController::class, 'runUpdate']);
});
