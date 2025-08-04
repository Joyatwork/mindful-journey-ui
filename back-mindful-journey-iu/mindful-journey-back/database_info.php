<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

echo "=== INFORMATIONS DE LA BASE DE DONNÉES ===\n\n";

// Afficher la configuration de la base de données
echo "Type de base de données: " . env('DB_CONNECTION', 'non défini') . "\n";
echo "Fichier de base de données: " . database_path('database.sqlite') . "\n";
echo "Le fichier existe: " . (file_exists(database_path('database.sqlite')) ? 'OUI' : 'NON') . "\n";
echo "Taille du fichier: " . (file_exists(database_path('database.sqlite')) ? round(filesize(database_path('database.sqlite')) / 1024, 2) . ' KB' : 'N/A') . "\n";

echo "\n=== POUR ACCÉDER À VOS DONNÉES ===\n\n";

echo "1. Chemin absolu du fichier SQLite:\n";
echo "   " . database_path('database.sqlite') . "\n\n";

echo "2. Outils recommandés pour visualiser SQLite:\n";
echo "   - DB Browser for SQLite (https://sqlitebrowser.org/)\n";
echo "   - SQLite Studio (https://sqlitestudio.pl/)\n";
echo "   - VS Code avec extension SQLite Viewer\n\n";

echo "3. Commande pour ouvrir avec sqlite3 (si installé):\n";
echo "   sqlite3 \"" . database_path('database.sqlite') . "\"\n\n";

echo "4. Tables principales dans votre base:\n";
try {
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    
    $pdo = DB::connection()->getPdo();
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "   - $table\n";
    }
} catch (Exception $e) {
    echo "   Erreur lors de la récupération des tables: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DES INFORMATIONS ===\n";
