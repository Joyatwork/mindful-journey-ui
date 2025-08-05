<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

echo "=== VÉRIFICATION DE LA BASE DE DONNÉES ===\n\n";

// Compter les utilisateurs
$userCount = User::count();
echo "Nombre total d'utilisateurs: {$userCount}\n\n";

if ($userCount > 0) {
    echo "Liste des utilisateurs:\n";
    echo str_repeat("-", 80) . "\n";
    
    $users = User::all();
    foreach ($users as $user) {
        echo "ID: {$user->id}\n";
        echo "Nom: {$user->name}\n";
        echo "Email: {$user->email}\n";
        echo "Créé le: {$user->created_at}\n";
        echo "Téléphone: " . ($user->phone ?? 'Non renseigné') . "\n";
        echo "Bio: " . ($user->bio ?? 'Non renseignée') . "\n";
        echo "Statut: {$user->status}\n";
        echo str_repeat("-", 80) . "\n";
    }
} else {
    echo "❌ Aucun utilisateur trouvé dans la base de données.\n";
}

// Vérifier les tokens
$tokenCount = \Laravel\Sanctum\PersonalAccessToken::count();
echo "\nNombre de tokens actifs: {$tokenCount}\n";

echo "\n=== FIN DE LA VÉRIFICATION ===\n";
