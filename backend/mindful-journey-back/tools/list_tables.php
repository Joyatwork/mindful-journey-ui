<?php
// Script simple pour lister les tables d'une base MySQL en lisant les variables DB_ depuis le .env
// Usage: php tools/list_tables.php

$envPath = __DIR__ . '/../.env';
if (!file_exists($envPath)) {
    fwrite(STDERR, "Fichier .env introuvable dans le dossier backend.\n");
    exit(2);
}

$env = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$config = [];
foreach ($env as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') === false) continue;
    [$k, $v] = array_map('trim', explode('=', $line, 2));
    $config[$k] = trim($v, "\"'");
}

$dbDriver = $config['DB_CONNECTION'] ?? 'mysql';
$host = $config['DB_HOST'] ?? '127.0.0.1';
$port = $config['DB_PORT'] ?? '3306';
$db = $config['DB_DATABASE'] ?? '';
$user = $config['DB_USERNAME'] ?? '';
$pass = $config['DB_PASSWORD'] ?? '';

if ($dbDriver !== 'mysql') {
    fwrite(STDERR, "Ce script supporte uniquement MySQL/MariaDB. DB_CONNECTION={$dbDriver}\n");
    exit(3);
}

$dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    fwrite(STDERR, "Échec connexion DB: " . $e->getMessage() . "\n");
    exit(4);
}

try {
    $stmt = $pdo->query('SHOW TABLES');
    $tables = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    $out = [
        'database' => $db,
        'count' => count($tables),
        'tables' => $tables,
    ];
    // write to storage/app/tables.json if possible
    $storageDir = __DIR__ . '/../storage/app';
    if (!is_dir($storageDir)) {
        @mkdir($storageDir, 0755, true);
    }
    $file = $storageDir . '/tables.json';
    @file_put_contents($file, json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
} catch (PDOException $e) {
    fwrite(STDERR, "Erreur lors de la requête: " . $e->getMessage() . "\n");
    exit(5);
}
