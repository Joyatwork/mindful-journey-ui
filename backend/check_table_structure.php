<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔍 Structure de la table users:\n";
echo "================================\n";

$pdo = DB::connection()->getPdo();
$result = $pdo->query('PRAGMA table_info(users)');

foreach ($result as $row) {
    echo $row['name'] . " | " . $row['type'] . " | " . ($row['notnull'] ? 'NOT NULL' : 'NULL') . "\n";
}

echo "\n🔍 Contraintes CHECK sur la table users:\n";
echo "==========================================\n";

$result = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
foreach ($result as $row) {
    echo $row['sql'] . "\n";
}
