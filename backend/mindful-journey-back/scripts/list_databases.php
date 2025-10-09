<?php
// Simple script to list databases on remote MySQL (information_schema)
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $count = $pdo->query('SELECT COUNT(*) AS db_count FROM information_schema.SCHEMATA')->fetch();
    echo "DB count: " . $count['db_count'] . "\n\nList of databases:\n";
    $stmt = $pdo->query('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA ORDER BY SCHEMA_NAME');
    foreach ($stmt as $row) {
        echo $row['SCHEMA_NAME'] . "\n";
    }
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
