<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Enable CORS middleware with config/cors.php settings
        $middleware->statefulApi();

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Ensure CORS headers are sent even on exceptions
        $exceptions->render(function (\Throwable $e, $request) {
            // Only handle API requests
            if (!$request->is('api/*')) {
                return null;
            }

            $origin = $request->header('Origin');
            if (!$origin) {
                return null;
            }

            // Check if origin is allowed using config/cors.php
            $corsConfig = config('cors');
            $allowedOrigins = $corsConfig['allowed_origins'] ?? [];
            $allowedPatterns = $corsConfig['allowed_origins_patterns'] ?? [];

            $isAllowed = in_array($origin, $allowedOrigins);
            if (!$isAllowed) {
                foreach ($allowedPatterns as $pattern) {
                    if (preg_match($pattern, $origin)) {
                        $isAllowed = true;
                        break;
                    }
                }
            }

            if (!$isAllowed) {
                return null;
            }

            // Build response with CORS headers
            $status = 500;
            $message = 'Server Error';

            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                $status = 401;
                $message = 'Unauthenticated';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $status = 422;
                $message = $e->getMessage();
            } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                $status = $e->getStatusCode();
                $message = $e->getMessage() ?: 'Error';
            }

            return response()->json([
                'message' => $message,
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], $status)->withHeaders([
                'Access-Control-Allow-Origin' => $origin,
                'Access-Control-Allow-Credentials' => 'true',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN',
            ]);
        });
    })->create();
