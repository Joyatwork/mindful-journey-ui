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

// Créer un utilisateur de test avec un mot de passe connu
$email = 'test.recommendations@example.com';
$password = 'test123';

// Supprimer l'utilisateur s'il existe déjà
App\Models\User::where('email', $email)->delete();

// Créer le nouvel utilisateur
$user = App\Models\User::create([
    'name' => 'Test Recommendations',
    'email' => $email,
    'password' => bcrypt($password),
    'age' => 30,
    'gender' => 'female',
    'activity_level' => 'moderate',
    'sleep_hours' => 7,
    'work_stress' => 5
]);

echo "Utilisateur de test créé:\n";
echo "Email: $email\n";
echo "Mot de passe: $password\n";
echo "ID: {$user->id}\n";

// Créer des données d'humeur pour cet utilisateur
App\Models\MoodEntry::where('user_id', $user->id)->delete();

$moodEntries = [
    [
        'user_id' => $user->id,
        'date' => now()->format('Y-m-d'),
        'mood_level' => 3,
        'mood_emoji' => '😟',
        'stress_level' => 7,
        'energy_level' => 4,
        'sleep_quality' => 6,
        'notes' => 'Journée stressante',
        'activities' => json_encode(['travail']),
        'emotions' => json_encode(['stress']),
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'user_id' => $user->id,
        'date' => now()->subDays(1)->format('Y-m-d'),
        'mood_level' => 6,
        'mood_emoji' => '😊',
        'stress_level' => 3,
        'energy_level' => 8,
        'sleep_quality' => 8,
        'notes' => 'Bonne journée',
        'activities' => json_encode(['sport']),
        'emotions' => json_encode(['joie']),
        'created_at' => now()->subDays(1),
        'updated_at' => now()->subDays(1)
    ]
];

foreach ($moodEntries as $entry) {
    App\Models\MoodEntry::create($entry);
}

echo "\nDonnées d'humeur créées: " . count($moodEntries) . " entrées\n";
echo "Utilisateur prêt pour les tests de recommandations!\n";
