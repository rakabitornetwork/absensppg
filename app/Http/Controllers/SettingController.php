<?php

namespace App\Http\Controllers;

use App\Models\SppgSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Shift;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = SppgSetting::pluck('value', 'key')->toArray();
        $shifts = Shift::all();

        return Inertia::render('Settings', [
            'settings' => $settings,
            'shifts' => $shifts,
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
            'app_logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'app_browser_title' => ['required', 'string', 'max:80'],
            'app_title' => ['required', 'string', 'max:50'],
            'app_subtitle' => ['required', 'string', 'max:50'],
            'office_address' => ['nullable', 'string', 'max:500'],
            'office_whatsapp' => ['nullable', 'string', 'max:50'],
            'office_email' => ['nullable', 'email', 'max:150'],
            'office_notes' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($validated as $key => $value) {
            if ($key === 'app_logo') {
                continue;
            }
            SppgSetting::setValue($key, $value !== null ? (string) $value : null);
        }

        if ($request->hasFile('app_logo')) {
            $file = $request->file('app_logo');
            $fileName = 'logo_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Make sure the directory exists
            if (!file_exists(public_path('images'))) {
                mkdir(public_path('images'), 0755, true);
            }
            
            $file->move(public_path('images'), $fileName);
            
            // Delete old logo file if exists
            $oldLogo = SppgSetting::getValue('app_logo');
            if ($oldLogo) {
                $oldPath = public_path(ltrim($oldLogo, '/'));
                if (file_exists($oldPath) && is_file($oldPath)) {
                    @unlink($oldPath);
                }
            }

            SppgSetting::setValue('app_logo', '/images/' . $fileName);
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function storeShift(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'grace_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'end_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
        ]);

        Shift::create($validated);

        return redirect()->back()->with('success', 'Shift baru berhasil ditambahkan.');
    }

    public function updateShift(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'grace_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'end_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
        ]);

        $shift->update($validated);

        return redirect()->back()->with('success', 'Informasi shift berhasil diperbarui.');
    }

    public function destroyShift(Shift $shift)
    {
        $shift->delete();

        return redirect()->back()->with('success', 'Shift berhasil dihapus.');
    }
}
