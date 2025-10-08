<?php
// quick DB connectivity test - bootstraps Laravel and runs a simple query
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $db = $app->make('db');
    $res = $db->select('SELECT 1 as ok');
    echo "DB query result:\n";
    print_r($res);
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}


