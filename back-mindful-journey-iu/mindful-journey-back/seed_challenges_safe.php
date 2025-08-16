<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Challenge;

echo "\n🔎 Schema challenges:\n";
try {
    $sql = DB::select("select sql from sqlite_master where type='table' and name='challenges'");
    foreach ($sql as $row) {
        echo $row->sql . "\n";
    }
} catch (Exception $e) {
    echo "(schema read failed) " . $e->getMessage() . "\n";
}

$candidates = [
    ['title' => 'Défi Quotidien: Méditation 5 min', 'description' => 'Pratique une courte méditation aujourd\'hui.', 'type' => 'day'],
    ['title' => 'Défi Quotidien: Respiration 4-7-8', 'description' => 'Séance de respiration anti-stress.', 'type' => 'day'],
    ['title' => 'Défi Hebdo: Routine de sommeil', 'description' => 'Améliore ta routine du soir cette semaine.', 'type' => 'week'],
];

$created = 0; $skipped = 0;
foreach ($candidates as $data) {
    $exists = Challenge::where('type', $data['type'])->first();
    if ($exists) { $skipped++; echo "⏭️  Existe: {$data['type']}\n"; continue; }
    try {
        Challenge::create($data);
        echo "✅ Créé: {$data['type']}\n";
        $created++;
    } catch (Exception $e) {
        echo "❌ Échec {$data['type']}: " . $e->getMessage() . "\n";
    }
}

$total = Challenge::count();
echo "\n📋 Total défis: {$total} (créés: {$created}, existants: {$skipped})\n\n";
