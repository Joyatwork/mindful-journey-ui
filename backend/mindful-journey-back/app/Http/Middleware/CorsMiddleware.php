<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');

        if (!$this->isOriginAllowed($origin)) {
            return $next($request);
        }

        $headers = [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN',
            'Access-Control-Max-Age' => '3600',
        ];

        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($headers);
        }

        return $next($request)->withHeaders($headers);
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
