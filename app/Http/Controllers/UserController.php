<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('id', 'asc')->get();
        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in(['superadmin', 'admin', 'distributor'])],
        ]);

        // Security check: non-superadmin cannot create superadmin
        if ($validated['role'] === 'superadmin' && Auth::user()->role !== 'superadmin') {
            abort(403, 'Anda tidak memiliki hak akses untuk membuat akun Superadmin.');
        }

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        // Security check: non-superadmin cannot edit a superadmin
        if ($user->role === 'superadmin' && Auth::user()->role !== 'superadmin') {
            abort(403, 'Anda tidak diperbolehkan mengubah akun Superuser.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in(['superadmin', 'admin', 'distributor'])],
        ]);

        // Security check: non-superadmin cannot elevate someone to superadmin
        if ($validated['role'] === 'superadmin' && Auth::user()->role !== 'superadmin') {
            abort(403, 'Anda tidak diperbolehkan menunjuk pengguna menjadi Superadmin.');
        }

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'Informasi pengguna berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        // Security check: non-superadmin cannot delete a superadmin
        if ($user->role === 'superadmin' && Auth::user()->role !== 'superadmin') {
            abort(403, 'Anda tidak diperbolehkan menghapus akun Superuser.');
        }

        if (Auth::id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
