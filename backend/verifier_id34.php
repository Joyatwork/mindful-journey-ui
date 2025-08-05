<?php

echo "==========================================\n";
echo "   VÉRIFICATION BASE DE DONNÉES ACTIVE\n";
echo "==========================================\n\n";

// Afficher le chemin complet de la base de données
$dbPath = __DIR__ . '/database/database.sqlite';
echo "📍 FICHIER DE BASE UTILISÉ:\n";
echo "   " . realpath($dbPath) . "\n\n";

echo "📊 TAILLE DU FICHIER: " . filesize($dbPath) . " octets\n";
echo "📅 DERNIÈRE MODIFICATION: " . date('Y-m-d H:i:s', filemtime($dbPath)) . "\n\n";

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Charger la configuration Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $users = DB::table('users')->orderBy('id', 'desc')->get();
    
    echo "👥 NOMBRE D'UTILISATEURS: " . $users->count() . "\n\n";
    
    echo "🔍 RECHERCHE SPÉCIFIQUE - ID 34:\n";
    $user34 = DB::table('users')->where('id', 34)->first();
    if ($user34) {
        echo "   ✅ TROUVÉ!\n";
        echo "   Email: {$user34->email}\n";
        echo "   Nom: {$user34->name}\n";
        echo "   Google ID: {$user34->google_id}\n";
        echo "   Créé le: {$user34->created_at}\n";
    } else {
        echo "   ❌ UTILISATEUR ID 34 NON TROUVÉ\n";
    }
    
    echo "\n📋 TOUS LES UTILISATEURS (du plus récent au plus ancien):\n";
    foreach ($users as $user) {
        $indicator = $user->id == 34 ? "👉 " : "   ";
        echo "{$indicator}ID: {$user->id} | {$user->email} | {$user->name}\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
}

echo "\n==========================================\n";
echo "Si vous ne voyez pas l'ID 34, vous consultez\n";
echo "probablement une autre base de données !\n";
echo "==========================================\n";
