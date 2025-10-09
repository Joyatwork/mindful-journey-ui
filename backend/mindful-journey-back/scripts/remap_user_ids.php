<?php
// Remap user_id values in all tables of mindful_journey that have a user_id column
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schema = 'mindful_journey';
$mapDb = 'merge_maps';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    $colStmt = $pdo->prepare("SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = 'user_id'");
    $colStmt->execute([$schema]);
    $tables = $colStmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "No tables in $schema have a user_id column.\n";
        exit(0);
    }

    echo "Tables with user_id in $schema: " . implode(', ', $tables) . "\n\n";

    $totalAffected = 0;
    foreach ($tables as $table) {
        try {
            $sql = "UPDATE `$schema`.`$table` t JOIN `$mapDb`.users_map m ON t.user_id = m.joy_id SET t.user_id = m.mindful_id WHERE m.mindful_id IS NOT NULL";
            $affected = $pdo->exec($sql);
            if ($affected === false) $affected = 0;
            echo "Table $table: rows affected = $affected\n";
            $totalAffected += $affected;
        } catch (PDOException $e) {
            echo "Table $table: ERROR updating: " . $e->getMessage() . "\n";
        }
    }

    echo "\nRemapping complete. Total rows affected across all tables: $totalAffected\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
