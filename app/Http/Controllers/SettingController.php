<?php

namespace App\Http\Controllers;

use App\Models\SppgSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = SppgSetting::pluck('value', 'key')->toArray();

        return Inertia::render('Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'office_name' => ['required', 'string', 'max:255'],
            'work_start_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'late_grace_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'late_penalty_per_minute' => ['required', 'numeric', 'min:0'],
            'meal_target' => ['required', 'numeric', 'min:0'],
        ]);

        foreach ($validated as $key => $value) {
            SppgSetting::setValue($key, (string) $value);
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
