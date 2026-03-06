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
        // CORS middleware is now properly handled by Laravel's HandleCors
        // which uses config/cors.php settings

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
            
            // Get the origin
            $origin = $request->header('Origin');
            $allowedOrigins = [
                'https://mindful-journey-ui.vercel.app',
                'http://localhost:3000',
                'http://localhost:5173',
                'http://127.0.0.1:5173',
            ];
            
            $isAllowed = in_array($origin, $allowedOrigins) 
                || ($origin && preg_match('/^https:\/\/.*\.vercel\.app$/', $origin));
            
            if (!$isAllowed) {
                return null; // Let Laravel handle it normally
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
