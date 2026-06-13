<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile', [
            'profile' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'avatar_path' => $request->user()->avatar_path,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp,svg', 'max:2048'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            $this->deleteAvatar($user->avatar_path);

            $file = $request->file('avatar');
            $fileName = 'admin_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $directory = public_path('images/admin/avatars');

            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            $file->move($directory, $fileName);
            $user->avatar_path = '/images/admin/avatars/' . $fileName;
        }

        $user->save();

        return redirect()->back()->with('success', 'Profil admin berhasil diperbarui.');
    }

    public function destroyAvatar(Request $request)
    {
        $user = $request->user();

        $this->deleteAvatar($user->avatar_path);
        $user->update(['avatar_path' => null]);

        return redirect()->back()->with('success', 'Avatar admin berhasil dihapus.');
    }

    private function deleteAvatar(?string $avatarPath): void
    {
        if (!$avatarPath) {
            return;
        }

        $path = public_path(ltrim($avatarPath, '/'));

        if (file_exists($path) && is_file($path)) {
            @unlink($path);
        }
    }
}
