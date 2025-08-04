<?php

require_once 'vendor/autoload.php';

// Charger la configuration Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

echo "=== VÉRIFICATION DES UTILISATEURS DANS LA BASE DE DONNÉES ===" . PHP_EOL;

try {
    // Compter le nombre total d'utilisateurs
    $totalUsers = User::count();
    echo "Nombre total d'utilisateurs: " . $totalUsers . PHP_EOL . PHP_EOL;
    
    // Afficher les 10 derniers utilisateurs
    echo "=== DERNIERS UTILISATEURS CRÉÉS ===" . PHP_EOL;
    $latestUsers = User::orderBy('created_at', 'desc')->take(10)->get();
    
    if ($latestUsers->count() > 0) {
        foreach ($latestUsers as $user) {
            echo "ID: " . $user->id . PHP_EOL;
            echo "Nom: " . $user->name . PHP_EOL;
            echo "Email: " . $user->email . PHP_EOL;
            echo "Créé le: " . $user->created_at . PHP_EOL;
            echo "Mis à jour le: " . $user->updated_at . PHP_EOL;
            echo "---" . PHP_EOL;
        }
    } else {
        echo "Aucun utilisateur trouvé." . PHP_EOL;
    }
    
    // Vérifier spécifiquement l'utilisateur que vous venez de créer
    echo PHP_EOL . "=== RECHERCHE DE L'UTILISATEUR alicamara291@gmail.com ===" . PHP_EOL;
    $yourUser = User::where('email', 'alicamara291@gmail.com')->first();
    
    if ($yourUser) {
        echo "✅ Utilisateur trouvé!" . PHP_EOL;
        echo "ID: " . $yourUser->id . PHP_EOL;
        echo "Nom: " . $yourUser->name . PHP_EOL;
        echo "Email: " . $yourUser->email . PHP_EOL;
        echo "Créé le: " . $yourUser->created_at . PHP_EOL;
    } else {
        echo "❌ Utilisateur alicamara291@gmail.com non trouvé." . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== FIN DE LA VÉRIFICATION ===" . PHP_EOL;
