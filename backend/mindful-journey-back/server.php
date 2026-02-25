<?php
/**
 * Laravel router script for PHP built-in server.
 * CORS is handled ENTIRELY here. Laravel's HandleCors middleware is disabled
 * in bootstrap/app.php to prevent duplicate Access-Control-Allow-Origin headers.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// ── CORS: single authoritative source for cross-origin headers ──────
$allowedOrigins = [
    'https://mindful-journey-ui.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$originAllowed = in_array($origin, $allowedOrigins, true)
    || preg_match('/^https:\/\/.*\.vercel\.app$/', $origin);

if ($originAllowed) {
    // Send CORS headers for EVERY request (GET, POST, etc.)
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN');
    header('Access-Control-Max-Age: 3600');
    header('Vary: Origin');
}

// Respond to preflight immediately (skip Laravel entirely)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

// If the requested file exists as a static file, serve it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Otherwise, route through Laravel's front controller
require_once __DIR__.'/public/index.php';
