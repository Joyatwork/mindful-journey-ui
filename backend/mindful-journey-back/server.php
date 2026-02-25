<?php
/**
 * Laravel router script for PHP built-in server.
 * This replicates what `artisan serve` does internally.
 * Also handles CORS preflight (OPTIONS) at the lowest level to guarantee
 * cross-origin headers are always present, even on fatal errors.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// ── CORS: handle OPTIONS preflight only at this level ───────────────
// Laravel's HandleCors middleware handles CORS for actual requests.
// We only intercept OPTIONS here so preflight never hits Laravel boot.
$allowedOrigins = [
    'https://mindful-journey-ui.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Also accept any *.vercel.app preview domain
$originAllowed = in_array($origin, $allowedOrigins, true)
    || preg_match('/^https:\/\/.*\.vercel\.app$/', $origin);

// Respond to preflight immediately (no need to boot Laravel)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS' && $originAllowed) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN');
    header('Access-Control-Max-Age: 3600');
    http_response_code(204);
    exit(0);
}

// If the requested file exists as a static file, serve it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Otherwise, route through Laravel's front controller
require_once __DIR__.'/public/index.php';
