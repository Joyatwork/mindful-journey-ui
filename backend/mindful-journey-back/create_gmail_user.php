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

echo "=== Création d'un utilisateur Google Gmail ===\n\n";

// Données de votre compte Gmail - modifiez selon vos informations
$gmailEmail = 'alicamara291@gmail.com';
$googleId = 'google_id_ali_camara_291';
$userName = 'Ali Camara';

echo "Email Gmail: $gmailEmail\n";
echo "Nom: $userName\n";

// Supprimer l'utilisateur s'il existe déjà
$existingUser = App\Models\User::where('email', $gmailEmail)->first();
if ($existingUser) {
    // Supprimer les données associées
    App\Models\MoodEntry::where('user_id', $existingUser->id)->delete();
    $existingUser->tokens()->delete();
    $existingUser->delete();
    echo "Ancien utilisateur supprimé.\n";
}

// Créer le nouvel utilisateur Google
$user = App\Models\User::create([
    'name' => $userName,
    'email' => $gmailEmail,
    'google_id' => $googleId,
    'provider' => 'google',
    'avatar_url' => 'https://lh3.googleusercontent.com/a-/default-user',
    'email_verified_at' => now(),
    'last_login_at' => now(),
    'password' => bcrypt(\Illuminate\Support\Str::random(32)),
    // Profil de base
    'age' => 30,
    'gender' => 'other', // Modifiez selon votre genre
    'activity_level' => 'moderate',
    'sleep_hours' => 7,
    'work_stress' => 5
]);

echo "✅ Utilisateur Google créé avec succès!\n";
echo "ID: {$user->id}\n";

// Créer des données d'humeur récentes pour les recommandations
$moodData = [
    [
        'user_id' => $user->id,
        'date' => now()->format('Y-m-d'),
        'mood_level' => 5,
        'mood_emoji' => '😐',
        'stress_level' => 6,
        'energy_level' => 5,
        'sleep_quality' => 7,
        'notes' => 'Journée de travail normale',
        'activities' => json_encode(['travail', 'réunions']),
        'emotions' => json_encode(['concentration', 'fatigue légère']),
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'user_id' => $user->id,
        'date' => now()->subDays(1)->format('Y-m-d'),
        'mood_level' => 7,
        'mood_emoji' => '😊',
        'stress_level' => 3,
        'energy_level' => 8,
        'sleep_quality' => 8,
        'notes' => 'Excellente journée, bien reposé',
        'activities' => json_encode(['sport', 'loisirs', 'socialisation']),
        'emotions' => json_encode(['joie', 'satisfaction', 'énergie']),
        'created_at' => now()->subDays(1),
        'updated_at' => now()->subDays(1)
    ],
    [
        'user_id' => $user->id,
        'date' => now()->subDays(2)->format('Y-m-d'),
        'mood_level' => 4,
        'mood_emoji' => '😕',
        'stress_level' => 7,
        'energy_level' => 4,
        'sleep_quality' => 5,
        'notes' => 'Journée difficile, beaucoup de stress',
        'activities' => json_encode(['travail intense', 'urgences']),
        'emotions' => json_encode(['stress', 'anxiété', 'épuisement']),
        'created_at' => now()->subDays(2),
        'updated_at' => now()->subDays(2)
    ]
];

foreach ($moodData as $entry) {
    App\Models\MoodEntry::create($entry);
}

echo "📊 Données d'humeur créées: " . count($moodData) . " entrées\n";

// Créer un token pour les tests directs
$token = $user->createToken('gmail_test_token')->plainTextToken;

echo "\n🎯 Compte Gmail prêt pour les tests!\n";
echo "📧 Email: $gmailEmail\n";
echo "🔑 Token de test: " . substr($token, 0, 20) . "...\n";

echo "\n=== Instructions pour tester ===\n";
echo "1. Ouvrez http://localhost:8080 dans votre navigateur\n";
echo "2. Cliquez sur 'Se connecter avec Google'\n";
echo "3. Utilisez votre compte Gmail: $gmailEmail\n";
echo "4. L'algorithme analysera vos données d'humeur et proposera des recommandations adaptées\n";
echo "5. Testez différents moments de la journée pour voir les suggestions changer\n\n";

echo "📈 Données d'humeur disponibles:\n";
foreach ($moodData as $i => $entry) {
    $date = date('d/m/Y', strtotime($entry['created_at']));
    echo "- $date: Humeur {$entry['mood_level']}/10, Stress {$entry['stress_level']}/10, Énergie {$entry['energy_level']}/10\n";
}

echo "\n✅ Configuration terminée!\n";
