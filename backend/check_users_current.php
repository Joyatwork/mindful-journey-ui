<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Charger la configuration Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VÉRIFICATION DES UTILISATEURS DANS LE BACKEND RÉORGANISÉ ===\n";

try {
    $users = DB::table('users')->get();
    
    echo "Nombre d'utilisateurs: " . $users->count() . "\n\n";
    
    if ($users->count() > 0) {
        foreach ($users as $user) {
            echo "ID: {$user->id}\n";
            echo "Email: {$user->email}\n";
            echo "Nom: {$user->name}\n";
            echo "Google ID: " . ($user->google_id ?? 'N/A') . "\n";
            echo "Créé le: {$user->created_at}\n";
            echo "------------------------\n";
        }
    } else {
        echo "Aucun utilisateur trouvé dans la base de données.\n";
    }
    
    // Vérifier aussi la structure de la table
    echo "\n=== STRUCTURE DE LA TABLE USERS ===\n";
    $columns = DB::select("PRAGMA table_info(users)");
    foreach ($columns as $column) {
        echo "- {$column->name} ({$column->type})\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
