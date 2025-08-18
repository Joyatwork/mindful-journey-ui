<?php

// Script pour créer des données de test pour le suivi d'humeur
require_once 'vendor/autoload.php';

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\MoodEntry;

echo "🎭 Création de données de test pour le suivi d'humeur...\n\n";

try {
    // Récupérer un utilisateur (ou utiliser Sophie Laurent)
    $user = User::where('name', 'Sophie Laurent')->first();
    if (!$user) {
        $user = User::first();
    }
    
    if (!$user) {
        echo "❌ Aucun utilisateur trouvé. Créez d'abord un utilisateur.\n";
        exit(1);
    }
    
    echo "👤 Utilisateur: {$user->name} (ID: {$user->id})\n\n";
    
    // Générer des entrées pour les 14 derniers jours
    $entries = [];
    $activities = ['Travail', 'Sport', 'Méditation', 'Lecture', 'Amis/Famille', 'Nature', 'Musique'];
    $emotions = ['Joie', 'Gratitude', 'Calme', 'Anxiété', 'Stress', 'Confiance', 'Espoir'];
    
    for ($i = 13; $i >= 0; $i--) {
        $date = now()->subDays($i)->toDateString();
        
        // Vérifier si une entrée existe déjà
        $existingEntry = MoodEntry::where('user_id', $user->id)
            ->where('date', $date)
            ->first();
            
        if ($existingEntry) {
            echo "⏭️  Entrée déjà existante pour {$date}\n";
            continue;
        }
        
        // Simuler une progression réaliste (avec variations)
        $baseMood = 5 + ($i * 0.1) + rand(-2, 2); // Tendance légèrement croissante
        $baseMood = max(1, min(10, $baseMood)); // Limiter entre 1 et 10
        
        $moodEmojis = [
            1 => '😢', 2 => '😞', 3 => '😕', 4 => '😐', 5 => '🙂',
            6 => '😊', 7 => '😄', 8 => '😁', 9 => '🤩', 10 => '🥳'
        ];
        
        $selectedActivities = array_rand(array_flip($activities), rand(2, 4));
        if (!is_array($selectedActivities)) {
            $selectedActivities = [$selectedActivities];
        }
        $selectedActivities = array_intersect_key($activities, array_flip($selectedActivities));
        
        $selectedEmotions = array_rand(array_flip($emotions), rand(1, 3));
        if (!is_array($selectedEmotions)) {
            $selectedEmotions = [$selectedEmotions];
        }
        $selectedEmotions = array_intersect_key($emotions, array_flip($selectedEmotions));
        
        $entry = MoodEntry::create([
            'user_id' => $user->id,
            'date' => $date,
            'mood_level' => round($baseMood),
            'mood_emoji' => $moodEmojis[round($baseMood)],
            'energy_level' => max(1, min(10, $baseMood + rand(-2, 2))),
            'stress_level' => max(1, min(10, 11 - $baseMood + rand(-1, 3))), // Stress inversement proportionnel
            'sleep_quality' => max(1, min(10, $baseMood + rand(-1, 2))),
            'notes' => generateNote($baseMood, $date),
            'activities' => array_values($selectedActivities),
            'emotions' => array_values($selectedEmotions)
        ]);
        
        $entries[] = $entry;
        echo "✅ Créé entrée pour {$date} - Humeur: {$entry->mood_level}/10 {$entry->mood_emoji}\n";
    }
    
    echo "\n🎉 Terminé ! " . count($entries) . " nouvelles entrées d'humeur créées.\n\n";
    
    // Afficher quelques statistiques
    $weeklyAvg = MoodEntry::averageMoodForUser($user->id, 7);
    $monthlyAvg = MoodEntry::averageMoodForUser($user->id, 30);
    $totalEntries = MoodEntry::where('user_id', $user->id)->count();
    
    echo "📊 Statistiques:\n";
    echo "   - Moyenne 7 jours: " . round($weeklyAvg, 1) . "/10\n";
    echo "   - Moyenne 30 jours: " . round($monthlyAvg, 1) . "/10\n";
    echo "   - Total d'entrées: {$totalEntries}\n\n";
    
    echo "🌐 Vous pouvez maintenant tester le suivi d'humeur sur:\n";
    echo "   http://localhost:8080/mood\n\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

function generateNote($moodLevel, $date) {
    $dayOfWeek = date('w', strtotime($date));
    $isWeekend = in_array($dayOfWeek, [0, 6]);
    
    $goodNotes = [
        "Excellente journée ! Très productive et positive.",
        "Je me sens vraiment bien aujourd'hui. Tout semble aller dans le bon sens.",
        "Journée équilibrée avec de beaux moments de bonheur.",
        "Très satisfait de mes accomplissements aujourd'hui.",
        "Belle énergie positive, j'ai pris soin de moi."
    ];
    
    $neutralNotes = [
        "Journée normale, rien d'exceptionnel mais correct.",
        "Humeur stable, quelques hauts et bas.",
        "Journée productive mais fatiguante.",
        "Sentiment mitigé, entre motivation et lassitude.",
        "Journée tranquille, j'ai fait ce qu'il fallait."
    ];
    
    $lowNotes = [
        "Journée difficile, j'ai eu du mal à me motiver.",
        "Stress élevé au travail, j'ai besoin de décompresser.",
        "Fatigue émotionnelle, j'ai besoin de repos.",
        "Quelques difficultés personnelles qui m'affectent.",
        "Pas dans mon assiette aujourd'hui."
    ];
    
    if ($moodLevel >= 7) {
        return $goodNotes[array_rand($goodNotes)];
    } elseif ($moodLevel >= 4) {
        return $neutralNotes[array_rand($neutralNotes)];
    } else {
        return $lowNotes[array_rand($lowNotes)];
    }
}
