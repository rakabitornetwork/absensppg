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
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $fileName = 'emp_' . time() . '_' . Str::random(5) . '.' . $file->getClientOriginalExtension();
            if (!file_exists(public_path('images/employees'))) {
                mkdir(public_path('images/employees'), 0755, true);
            }
            $file->move(public_path('images/employees'), $fileName);
            $validated['photo_path'] = '/images/employees/' . $fileName;
        }

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
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($employee->photo_path) {
                $oldPath = public_path(ltrim($employee->photo_path, '/'));
                if (file_exists($oldPath) && is_file($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('photo');
            $fileName = 'emp_' . time() . '_' . Str::random(5) . '.' . $file->getClientOriginalExtension();
            if (!file_exists(public_path('images/employees'))) {
                mkdir(public_path('images/employees'), 0755, true);
            }
            $file->move(public_path('images/employees'), $fileName);
            $validated['photo_path'] = '/images/employees/' . $fileName;
        }

        $employee->update($validated);

        return redirect()->back()->with('success', 'Data karyawan berhasil diperbarui.');
    }

    public function destroy(Employee $employee)
    {
        if ($employee->photo_path) {
            $oldPath = public_path(ltrim($employee->photo_path, '/'));
            if (file_exists($oldPath) && is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        $employee->delete();

        return redirect()->back()->with('success', 'Karyawan berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'exists:employees,id'],
        ]);

        $employees = Employee::whereIn('id', $validated['ids'])->get();
        foreach ($employees as $employee) {
            if ($employee->photo_path) {
                $oldPath = public_path(ltrim($employee->photo_path, '/'));
                if (file_exists($oldPath) && is_file($oldPath)) {
                    @unlink($oldPath);
                }
            }
            $employee->delete();
        }

        return redirect()->back()->with('success', count($employees) . " karyawan berhasil dihapus secara massal.");
    }

    public function printCards(): Response
    {
        $employees = Employee::where('status', 'Active')->orderBy('nip', 'asc')->get();
        
        return Inertia::render('PrintCards', [
            'employees' => $employees,
        ]);
    }
}
