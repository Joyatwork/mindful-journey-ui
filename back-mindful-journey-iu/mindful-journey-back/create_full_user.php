<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== CRÉATION D'UN UTILISATEUR COMPLET ===\n\n";

try {
    $user = User::create([
        'name' => 'Sophie Laurent',
        'email' => 'sophie.laurent@mindful-journey.com',
        'password' => Hash::make('password123'),
        'birth_date' => '1992-07-20',
        'gender' => 'female',
        'phone' => '+33987654321',
        'bio' => 'Coach en développement personnel et méditation pleine conscience. Aide les personnes à retrouver leur équilibre intérieur.',
        'preferences' => json_encode([
            'themes' => ['meditation', 'wellness', 'mindfulness'],
            'notification_frequency' => 'weekly',
            'language' => 'fr',
            'preferred_session_time' => 'morning',
            'difficulty_level' => 'intermediate'
        ]),
        'health_goals' => json_encode([
            'primary_goals' => ['stress_reduction', 'emotional_balance', 'mindfulness'],
            'target_meditation_minutes' => 30,
            'weekly_sessions' => 4,
            'focus_areas' => ['work_stress', 'personal_growth', 'sleep_quality'],
            'start_date' => '2025-08-01',
            'target_completion' => '2025-12-01'
        ]),
        'status' => 'active'
    ]);

    echo "✅ Utilisateur créé avec succès!\n";
    echo "ID: {$user->id}\n";
    echo "Nom: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Téléphone: {$user->phone}\n";
    echo "Date de naissance: {$user->birth_date}\n";
    echo "Genre: {$user->gender}\n";
    echo "Bio: {$user->bio}\n";
    echo "Préférences: " . json_encode($user->preferences, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    echo "Objectifs santé: " . json_encode($user->health_goals, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

} catch (Exception $e) {
    echo "❌ Erreur lors de la création de l'utilisateur: " . $e->getMessage() . "\n";
}

echo "\n=== STATISTIQUES FINALES ===\n";
echo "Nombre total d'utilisateurs: " . User::count() . "\n";

echo "\n=== FIN ===\n";
