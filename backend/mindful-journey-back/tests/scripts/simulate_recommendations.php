<?php
$base = dirname(__DIR__, 2);
require $base . '/vendor/autoload.php';
$app = require_once $base . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(6);
if (!$user) { echo "User 6 not found\n"; exit(1); }

$request = new Illuminate\Http\Request(['mood' => 3, 'stress' => 3, 'energy' => 3, 'time_of_day' => 14]);
$request->setUserResolver(function() use($user){ return $user; });

$controller = app()->make(App\Http\Controllers\Api\RecommendationController::class);
try {
    $resp = $controller->getPersonalizedSuggestions($request);
    echo json_encode($resp->getData(), JSON_PRETTY_PRINT) . "\n";
} catch (Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
