<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::orderBy('nip', 'asc')->get();

        return Inertia::render('Employees', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nip' => ['required', 'string', 'unique:employees,nip'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string'],
            'email' => ['nullable', 'email', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'daily_allowance' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:Active,Inactive'],
        ]);

        // Auto-generate QR code token
        $validated['qr_token'] = 'SPPG-TOKEN-' . Str::upper(Str::random(10));

        Employee::create($validated);

        return redirect()->back()->with('success', 'Karyawan berhasil ditambahkan.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'nip' => ['required', 'string', 'unique:employees,nip,' . $employee->id],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string'],
            'email' => ['nullable', 'email', 'unique:employees,email,' . $employee->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'daily_allowance' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:Active,Inactive'],
        ]);

        $employee->update($validated);

        return redirect()->back()->with('success', 'Data karyawan berhasil diperbarui.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()->back()->with('success', 'Karyawan berhasil dihapus.');
    }

    public function printCards(): Response
    {
        $employees = Employee::where('status', 'Active')->orderBy('nip', 'asc')->get();
        
        return Inertia::render('PrintCards', [
            'employees' => $employees,
        ]);
    }
}
