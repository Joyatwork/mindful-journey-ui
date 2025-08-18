<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Challenge;

echo "\n🚀 Création de défis par défaut...\n";

$defaults = [
    [
        'title' => 'Méditation 5 minutes',
        'description' => 'Une courte méditation guidée pour débuter en douceur.',
        'type' => 'meditation',
    ],
    [
        'title' => 'Respiration 4-7-8',
        'description' => 'Technique de respiration pour réduire le stress et apaiser l’esprit.',
        'type' => 'breathing',
    ],
    [
        'title' => 'Routine de sommeil',
        'description' => 'Prépare-toi au coucher avec une routine simple et efficace.',
        'type' => 'sleep',
    ],
];

$created = 0;
foreach ($defaults as $data) {
    $exists = Challenge::where('title', $data['title'])->first();
    if (!$exists) {
        Challenge::create($data);
        $created++;
        echo "✅ Défi créé: {$data['title']}\n";
    } else {
        echo "⏭️  Défi existant: {$data['title']}\n";
    }
}

$total = Challenge::count();
echo "\n📋 Total défis en base: {$total}\n";
echo "✨ Terminé.\n\n";
