<?php
// Compare tables and row counts between two schemas on the same MySQL server
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'JoyAtWork';
$schemaB = 'mindful_journey';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

    $getTables = function($schema) use ($pdo) {
        $stmt = $pdo->prepare('SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME');
        $stmt->execute([$schema]);
        return $stmt->fetchAll();
    };

    $tablesA = $getTables($schemaA);
    $tablesB = $getTables($schemaB);

    echo "Schema: $schemaA\n";
    echo str_repeat('=', 40) . "\n";
    foreach ($tablesA as $t) {
        printf("%40s : %10s\n", $t['TABLE_NAME'], $t['TABLE_ROWS']);
    }
    echo "\nSchema: $schemaB\n";
    echo str_repeat('=', 40) . "\n";
    foreach ($tablesB as $t) {
        printf("%40s : %10s\n", $t['TABLE_NAME'], $t['TABLE_ROWS']);
    }

    // Compute set differences
    $namesA = array_column($tablesA, 'TABLE_NAME');
    $namesB = array_column($tablesB, 'TABLE_NAME');

    $onlyA = array_diff($namesA, $namesB);
    $onlyB = array_diff($namesB, $namesA);
    $both = array_intersect($namesA, $namesB);

    echo "\nTables only in $schemaA:\n";
    foreach ($onlyA as $n) echo " - $n\n";
    echo "\nTables only in $schemaB:\n";
    foreach ($onlyB as $n) echo " - $n\n";
    echo "\nTables in both schemas (name match):\n";
    foreach ($both as $n) echo " - $n\n";

} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
