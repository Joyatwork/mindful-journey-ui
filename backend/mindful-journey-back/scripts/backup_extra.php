<?php
// Create a timestamped full copy of mindful_journey into mindful_journey_backup_YYYY_MM_DD_HH_II_SS
// This is a safe, idempotent backup (uses CREATE DATABASE IF NOT EXISTS for safety) with precise timestamp.
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$source = 'mindful_journey';
$backup = 'mindful_journey_backup_' . date('Y_m_d_H_i_s');
$critical = ['users', 'migrations', 'mood_entries', 'challenges', 'roles', 'companies', 'practitioners'];

try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

    echo "Creating timestamped backup database: $backup\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$backup` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // Get tables from source
    $stmt = $pdo->prepare('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?');
    $stmt->execute([$source]);
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $table) {
        echo "Copying table $table... ";
        try {
            $pdo->exec("DROP TABLE IF EXISTS `$backup`.`$table`");
            $pdo->exec("CREATE TABLE `$backup`.`$table` LIKE `$source`.`$table`");
            $pdo->exec("INSERT INTO `$backup`.`$table` SELECT * FROM `$source`.`$table`");
            echo "done\n";
        } catch (PDOException $e) {
            echo "ERROR: " . $e->getMessage() . "\n";
        }
    }

    echo "\nTimestamped backup complete. Backup DB: $backup\n";

    // Optionally show DDL for a few critical tables
    foreach ($critical as $t) {
        echo "=== Table: $t ===\n";
        $exists = $pdo->prepare('SELECT COUNT(*) as c FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?');
        $exists->execute([$source, $t]);
        $c = $exists->fetch()['c'];
        if (!$c) {
            echo "(not present in $source)\n\n";
            continue;
        }
        $ddlStmt = $pdo->query("SHOW CREATE TABLE `$source`.`$t`");
        $ddl = $ddlStmt->fetch();
        echo $ddl['Create Table'] . "\n\n";
    }
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
