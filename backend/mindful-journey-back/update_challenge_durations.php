<?php
/**
 * Script pour mettre à jour les durées des défis existants
 * Usage: php update_challenge_durations.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Mise à jour des durées des défis ===\n\n";

// Définir les durées basées sur les titres
$durationMapping = [
    // Yoga
    'yoga' => ['duration' => 15, 'difficulty' => 'easy', 'category' => 'Yoga'],
    
    // Stretching
    'stretch' => ['duration' => 10, 'difficulty' => 'easy', 'category' => 'Stretching'],
    'étirement' => ['duration' => 10, 'difficulty' => 'easy', 'category' => 'Stretching'],
    
    // Méditation
    'méditation' => ['duration' => 10, 'difficulty' => 'easy', 'category' => 'Mindfulness'],
    'meditation' => ['duration' => 10, 'difficulty' => 'easy', 'category' => 'Mindfulness'],
    
    // Respiration
    'respir' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Respiration'],
    'breath' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Respiration'],
    
    // Sommeil
    'sommeil' => ['duration' => 15, 'difficulty' => 'medium', 'category' => 'Sommeil'],
    'sleep' => ['duration' => 15, 'difficulty' => 'medium', 'category' => 'Sommeil'],
    
    // Focus
    'focus' => ['duration' => 30, 'difficulty' => 'medium', 'category' => 'Focus'],
    'concentration' => ['duration' => 30, 'difficulty' => 'medium', 'category' => 'Focus'],
    
    // Hydratation
    'hydrat' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Hydratation'],
    'eau' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Hydratation'],
    'water' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Hydratation'],
    
    // Équipe/Pause
    'pause' => ['duration' => 10, 'difficulty' => 'easy', 'category' => 'Équipe'],
    'équipe' => ['duration' => 15, 'difficulty' => 'easy', 'category' => 'Équipe'],
    'team' => ['duration' => 15, 'difficulty' => 'easy', 'category' => 'Équipe'],
    
    // Fitness
    'bench' => ['duration' => 20, 'difficulty' => 'hard', 'category' => 'Fitness'],
    'press' => ['duration' => 20, 'difficulty' => 'hard', 'category' => 'Fitness'],
    'pulldown' => ['duration' => 15, 'difficulty' => 'medium', 'category' => 'Fitness'],
    'lat pull' => ['duration' => 15, 'difficulty' => 'medium', 'category' => 'Fitness'],
    'incline' => ['duration' => 20, 'difficulty' => 'hard', 'category' => 'Fitness'],
    
    // Test images - défaut
    'test image' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Test'],
    'sauter' => ['duration' => 5, 'difficulty' => 'easy', 'category' => 'Fitness'],
];

// Récupérer tous les défis
$challenges = DB::table('challenges')->get();

echo "Nombre de défis trouvés: " . count($challenges) . "\n\n";

$updated = 0;
foreach ($challenges as $challenge) {
    $titleLower = strtolower($challenge->title ?? '');
    
    $duration = 10; // Défaut
    $difficulty = 'easy';
    $category = 'Bien-être';
    
    // Chercher la correspondance
    foreach ($durationMapping as $keyword => $config) {
        if (strpos($titleLower, $keyword) !== false) {
            $duration = $config['duration'];
            $difficulty = $config['difficulty'];
            $category = $config['category'];
            break;
        }
    }
    
    // Mettre à jour le défi
    DB::table('challenges')
        ->where('id', $challenge->id)
        ->update([
            'duration_minutes' => $duration,
            'difficulty' => $difficulty,
            'category' => $category,
        ]);
    
    echo "✓ {$challenge->title}: {$duration} min, {$difficulty}, {$category}\n";
    $updated++;
}

echo "\n=== {$updated} défis mis à jour ===\n";
