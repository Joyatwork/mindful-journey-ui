<?php
// Simple printer for merge_maps tables. Connects directly using the same
// credentials used by other scripts and prints users_map and challenges_map.
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';

function db_connect_direct($host, $port, $user, $pass) {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    $pdo->exec("SET collation_connection = 'utf8mb4_unicode_ci'");
    $pdo->exec("SET character_set_connection = 'utf8mb4'");
    return $pdo;
}

function print_table($pdo, $table) {
    echo "=== $table ===\n";
    try {
        $st = $pdo->query("SELECT * FROM merge_maps.$table");
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);
        if (!$rows) {
            echo "(vide)\n";
            return;
        }
        // print header
        $cols = array_keys($rows[0]);
        echo implode(' | ', $cols) . "\n";
        foreach ($rows as $r) {
            $vals = array_map(function($v){ return $v === null ? '<NULL>' : $v; }, $r);
            echo implode(' | ', $vals) . "\n";
        }
    } catch (Exception $e) {
        echo "Erreur en lisant $table: " . $e->getMessage() . "\n";
    }
}

$pdo = db_connect_direct($host, $port, $user, $pass);
print_table($pdo, 'users_map');
print_table($pdo, 'challenges_map');

echo "\n(End)\n";
