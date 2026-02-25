<?php
/**
 * Laravel router script for PHP built-in server.
 * This replicates what `artisan serve` does internally.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// If the requested file exists as a static file, serve it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Otherwise, route through Laravel's front controller
require_once __DIR__.'/public/index.php';
