<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return redirect('/login');
        }

        // Superadmin has full access
        if ($user->role === 'superadmin') {
            return $next($request);
        }

        // Check if user has one of the allowed roles
        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        // Forbidden
        if ($request->expectsJson() || $request->header('X-Inertia')) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses untuk tindakan ini.'], 403);
        }

        abort(403, 'Anda tidak memiliki hak akses untuk halaman ini.');
    }
}
