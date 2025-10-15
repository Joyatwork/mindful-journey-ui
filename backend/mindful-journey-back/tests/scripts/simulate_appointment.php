<?php
$base = dirname(__DIR__, 2);
require $base . '/vendor/autoload.php';

// Bootstrap the Laravel app
$app = require_once $base . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$status = $kernel->bootstrap();

// Find user and build request
$user = App\Models\User::find(6);
if (!$user) {
    echo "User 6 not found\n";
    exit(1);
}

$request = new Illuminate\Http\Request([
    'specialistId' => 15,
    'date' => '2025-10-20',
    'time' => '10:30',
    'type' => 'video',
]);

$request->setUserResolver(function () use ($user) {
    return $user;
});

try {
    $controller = app()->make(App\Http\Controllers\Api\AppointmentController::class);
    $response = $controller->store($request);
    echo "Response:\n";
    echo json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";
} catch (Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
