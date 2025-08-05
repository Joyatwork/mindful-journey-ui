<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\User;

echo "=== VÉRIFICATION DES UTILISATEURS DANS LA BASE ===\n\n";

$users = User::all();

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Nom: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Téléphone: " . ($user->phone ?: 'NULL') . "\n";
    echo "Bio: " . ($user->bio ?: 'NULL') . "\n";
    echo "Date de naissance: " . ($user->birth_date ?: 'NULL') . "\n";
    echo "Préférences: " . ($user->preferences ?: 'NULL') . "\n";
    echo "Mis à jour le: {$user->updated_at}\n";
    echo "-------------------\n";
}

echo "\nTotal utilisateurs: " . $users->count() . "\n";
