<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use App\Models\SppgSetting;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class UpdateController extends Controller
{
    private $repo = 'rakabitornetwork/absensppg';

    public function index(Request $request): Response
    {
        $currentVersion = '1.2';
        $commitHash = $this->getCurrentCommitHash();
        
        // Check if git is available
        $gitAvailable = false;
        $isGitRepo = false;
        if (function_exists('exec')) {
            exec('git --version', $output, $returnVar);
            $gitAvailable = ($returnVar === 0);
            
            if ($gitAvailable) {
                exec('git rev-parse --is-inside-work-tree 2>/dev/null', $output2, $returnVar2);
                $isGitRepo = ($returnVar2 === 0);
            }
        }

        return Inertia::render('Update', [
            'currentVersion' => $currentVersion,
            'commitHash' => $commitHash,
            'gitAvailable' => $gitAvailable,
            'isGitRepo' => $isGitRepo,
            'repoName' => $this->repo,
        ]);
    }

    public function checkForUpdates()
    {
        $currentVersion = '1.2';
        $commitHash = $this->getCurrentCommitHash();

        try {
            // Attempt to call GitHub API to fetch the latest commits or releases
            $response = Http::withHeaders([
                'User-Agent' => 'SPPG-Attendance-App'
            ])->timeout(8)->get("https://api.github.com/repos/{$this->repo}/commits/main");

            if ($response->successful()) {
                $data = $response->json();
                $latestHash = substr($data['sha'] ?? '', 0, 7);
                $latestMessage = $data['commit']['message'] ?? 'No commit message';
                $latestDate = isset($data['commit']['committer']['date']) 
                    ? Carbon::parse($data['commit']['committer']['date'])->setTimezone('Asia/Jakarta')->format('d M Y H:i')
                    : 'Unknown';

                $updateAvailable = ($latestHash !== $commitHash);

                return response()->json([
                    'status' => 'success',
                    'latestVersion' => '1.2', // Assuming tag remains 1.2 or increments based on logic
                    'latestHash' => $latestHash ?: 'Unknown',
                    'latestMessage' => $latestMessage,
                    'latestDate' => $latestDate,
                    'updateAvailable' => $updateAvailable,
                ]);
            }

            // Fallback if API fails or rate limited
            return response()->json([
                'status' => 'warning',
                'message' => 'Gagal terhubung ke GitHub API. Menggunakan estimasi status update.',
                'latestVersion' => '1.2',
                'latestHash' => $commitHash,
                'updateAvailable' => false,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kesalahan koneksi: ' . $e->getMessage(),
                'latestVersion' => '1.2',
                'latestHash' => $commitHash,
                'updateAvailable' => false,
            ]);
        }
    }

    public function runUpdate()
    {
        // Increase time limit for git pulling and optimization
        @set_time_limit(300);
        
        $outputLogs = [];
        $success = true;

        if (!function_exists('shell_exec')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fungsi shell_exec tidak aktif di server ini. Update otomatis tidak dapat dijalankan secara langsung.',
                'logs' => ['Error: shell_exec is disabled in php.ini']
            ], 403);
        }

        // Run Git Pull
        $outputLogs[] = "Executing: git pull origin main";
        $gitPull = shell_exec("git pull origin main 2>&1");
        $outputLogs[] = $gitPull ?: "No output from git pull";

        if (strpos($gitPull, 'error:') !== false || strpos($gitPull, 'fatal:') !== false) {
            $success = false;
            $outputLogs[] = "Git pull failed. Aborting update processes.";
        } else {
            // Run Migrations
            $outputLogs[] = "Executing: php artisan migrate --force";
            try {
                Artisan::call('migrate', ['--force' => true]);
                $outputLogs[] = Artisan::output() ?: "Migrations completed successfully.";
            } catch (\Exception $e) {
                $success = false;
                $outputLogs[] = "Migration Error: " . $e->getMessage();
            }

            // Run Cache Optimization
            $outputLogs[] = "Executing: php artisan optimize";
            try {
                Artisan::call('optimize');
                $outputLogs[] = Artisan::output() ?: "Cache optimized successfully.";
            } catch (\Exception $e) {
                $outputLogs[] = "Optimization Warning: " . $e->getMessage();
            }
        }

        return response()->json([
            'status' => $success ? 'success' : 'error',
            'message' => $success ? 'Aplikasi berhasil diperbarui!' : 'Terjadi kesalahan saat memperbarui aplikasi.',
            'logs' => $outputLogs,
            'newHash' => $this->getCurrentCommitHash(),
        ]);
    }

    private function getCurrentCommitHash(): string
    {
        $commitHash = null;
        if (function_exists('shell_exec')) {
            $commitHash = trim(@shell_exec('git log -1 --format="%h" 2>/dev/null'));
        }
        return !empty($commitHash) ? $commitHash : 'f8d42c7';
    }
}
