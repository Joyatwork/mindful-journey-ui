<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: __DIR__)
    ->withRouting(
        web: __DIR__.'/routes/web.php',
        api: __DIR__.'/routes/api.php',
        commands: __DIR__.'/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Utilisateurs dans la base de données ===\n\n";

$users = App\Models\User::all();

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Nom: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Créé le: {$user->created_at}\n";
    echo "---\n";
}

echo "\nTotal: " . $users->count() . " utilisateurs\n";
