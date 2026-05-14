<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');

        if ($this->isOriginAllowed($origin)) {
            return $next($request)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN')
                ->header('Access-Control-Max-Age', '3600');
        }

        return $next($request);
    }

    private function isOriginAllowed($origin): bool
    {
        if (!$origin) {
            return false;
        }

        $corsConfig = config('cors');
        $allowedOrigins = $corsConfig['allowed_origins'] ?? [];
        $allowedPatterns = $corsConfig['allowed_origins_patterns'] ?? [];

        if (in_array($origin, $allowedOrigins)) {
            return true;
        }

        foreach ($allowedPatterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                return true;
            }
        }

        return false;
    }
}
