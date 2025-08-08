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

// Créer des données de test pour les recommandations
$user = App\Models\User::first();

if ($user) {
    echo "Utilisateur trouvé: " . $user->name . " (ID: " . $user->id . ")\n";
    
    // Vérifier si le modèle MoodEntry existe
    if (class_exists('App\Models\MoodEntry')) {
        // Supprimer les anciennes entrées
        App\Models\MoodEntry::where('user_id', $user->id)->delete();
        
        // Créer des entrées d'humeur variées pour tester l'algorithme
        $moodEntries = [
            [
                'user_id' => $user->id,
                'date' => now()->format('Y-m-d'), // Aujourd'hui
                'mood_level' => 3,
                'mood_emoji' => '😟',
                'stress_level' => 7,
                'energy_level' => 4,
                'sleep_quality' => 6,
                'notes' => 'Journée stressante au travail',
                'activities' => json_encode(['travail', 'réunions']),
                'emotions' => json_encode(['stress', 'fatigue']),
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2)
            ],
            [
                'user_id' => $user->id,
                'date' => now()->subDays(1)->format('Y-m-d'), // Hier
                'mood_level' => 6,
                'mood_emoji' => '😊',
                'stress_level' => 3,
                'energy_level' => 8,
                'sleep_quality' => 8,
                'notes' => 'Bonne humeur après exercice',
                'activities' => json_encode(['sport', 'relaxation']),
                'emotions' => json_encode(['joie', 'satisfaction']),
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1)
            ],
            [
                'user_id' => $user->id,
                'date' => now()->subDays(2)->format('Y-m-d'), // Avant-hier
                'mood_level' => 4,
                'mood_emoji' => '😐',
                'stress_level' => 5,
                'energy_level' => 6,
                'sleep_quality' => 7,
                'notes' => 'Humeur neutre',
                'activities' => json_encode(['lecture', 'télévision']),
                'emotions' => json_encode(['calme', 'neutre']),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2)
            ]
        ];
        
        foreach ($moodEntries as $entry) {
            App\Models\MoodEntry::create($entry);
        }
        
        echo "Données de test créées!\n";
        echo "Mood entries: " . App\Models\MoodEntry::count() . "\n";
        
        // Afficher les données créées
        $entries = App\Models\MoodEntry::where('user_id', $user->id)->get();
        foreach ($entries as $entry) {
            echo "- Humeur: {$entry->mood_level}, Stress: {$entry->stress_level}, Énergie: {$entry->energy_level}\n";
        }
    } else {
        echo "Modèle MoodEntry non disponible\n";
    }
    
    // Mettre à jour le profil utilisateur pour les tests
    $user->update([
        'age' => 28,
        'gender' => 'female',
        'activity_level' => 'moderate',
        'sleep_hours' => 7,
        'work_stress' => 6
    ]);
    
    echo "Profil utilisateur mis à jour pour les tests\n";
    
} else {
    echo "Aucun utilisateur trouvé dans la base de données\n";
}

echo "Configuration de test terminée!\n";
