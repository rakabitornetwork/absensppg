<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DatabaseMaintenanceController extends Controller
{
    private array $backupTables = [
        'users',
        'sppg_settings',
        'shifts',
        'employees',
        'attendances',
        'payrolls',
    ];

    private array $restoreOrder = [
        'users',
        'sppg_settings',
        'shifts',
        'employees',
        'attendances',
        'payrolls',
    ];

    private array $deleteOrder = [
        'payrolls',
        'attendances',
        'employees',
        'shifts',
        'sppg_settings',
        'users',
    ];

    private array $operationalResetOrder = [
        'payrolls',
        'attendances',
        'employees',
        'shifts',
    ];

    public function index(): Response
    {
        return Inertia::render('Database', [
            'tableStats' => $this->tableStats(),
        ]);
    }

    public function backup()
    {
        $payload = [
            'app' => 'absensppg',
            'format_version' => 1,
            'exported_at' => now()->toIso8601String(),
            'tables' => collect($this->backupTables)
                ->mapWithKeys(fn (string $table) => [
                    $table => DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->values(),
                ])
                ->toArray(),
        ];

        $filename = 'backup-absensppg-' . now()->format('Ymd-His') . '.mbg';

        return response(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))
            ->header('Content-Type', 'application/octet-stream')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function restore(Request $request)
    {
        $validated = $request->validate([
            'backup_file' => ['required', 'file', 'max:20480'],
            'confirmation' => ['required', 'string', 'in:RESTORE'],
        ]);

        $payload = json_decode(file_get_contents($validated['backup_file']->getRealPath()), true);

        if (!is_array($payload) || ($payload['app'] ?? null) !== 'absensppg' || !isset($payload['tables']) || !is_array($payload['tables'])) {
            return redirect()->back()->with('error', 'File backup tidak valid atau bukan berasal dari aplikasi ini.');
        }

        DB::transaction(function () use ($payload) {
            Schema::disableForeignKeyConstraints();

            try {
                foreach ($this->deleteOrder as $table) {
                    DB::table($table)->delete();
                }

                foreach ($this->restoreOrder as $table) {
                    $rows = $payload['tables'][$table] ?? [];

                    if (!is_array($rows) || count($rows) === 0) {
                        continue;
                    }

                    foreach (array_chunk($rows, 500) as $chunk) {
                        DB::table($table)->insert($chunk);
                    }
                }
            } finally {
                Schema::enableForeignKeyConstraints();
            }
        });

        return redirect()->back()->with('success', 'Database berhasil direstore dari file backup.');
    }

    public function reset(Request $request)
    {
        $request->validate([
            'confirmation' => ['required', 'string', 'in:RESET'],
        ]);

        DB::transaction(function () {
            Schema::disableForeignKeyConstraints();

            try {
                foreach ($this->operationalResetOrder as $table) {
                    DB::table($table)->delete();
                }
            } finally {
                Schema::enableForeignKeyConstraints();
            }
        });

        return redirect()->back()->with('success', 'Data operasional berhasil dikosongkan. Akun admin dan pengaturan tetap dipertahankan.');
    }

    private function tableStats(): array
    {
        return collect($this->backupTables)
            ->map(fn (string $table) => [
                'name' => $table,
                'count' => DB::table($table)->count(),
                'resettable' => in_array($table, $this->operationalResetOrder, true),
            ])
            ->values()
            ->toArray();
    }
}
