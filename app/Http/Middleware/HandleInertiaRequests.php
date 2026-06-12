<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $commitHash = 'f8d42c7';
        if (function_exists('shell_exec')) {
            $hash = trim(@shell_exec('git log -1 --format="%h" 2>/dev/null'));
            if (!empty($hash)) {
                $commitHash = $hash;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'appVersion' => '1.2',
            'appCommitHash' => $commitHash,
            'appLogo' => \App\Models\SppgSetting::getValue('app_logo'),
            'officeName' => \App\Models\SppgSetting::getValue('office_name', 'SPPG Sukajadi Mandiri'),
        ];
    }
}
