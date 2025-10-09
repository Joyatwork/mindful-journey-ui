<?php
// Create a full copy of mindful_journey into mindful_journey_backup_YYYY_MM_DD
// Then show DDL and sample rows for critical tables.
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$source = 'mindful_journey';
$backup = 'mindful_journey_backup_' . date('Y_m_d');
$critical = ['users', 'migrations', 'mood_entries', 'challenges', 'roles', 'companies', 'practitioners'];

try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

    echo "Creating backup database: $backup\n";
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

    echo "\nBackup complete. Now showing DDL and sample rows for critical tables in source ($source).\n\n";

    foreach ($critical as $t) {
        echo "=== Table: $t ===\n";
        // Show if exists
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

        $dataDsn = "mysql:host=$host;port=$port;dbname=$source;charset=utf8mb4";
        $pdoSrc = new PDO($dataDsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        $rows = $pdoSrc->query("SELECT * FROM `$t` LIMIT 5")->fetchAll();
        if (empty($rows)) {
            echo "(no rows)\n\n";
        } else {
            foreach ($rows as $r) {
                print_r($r);
                echo "\n";
            }
            echo "\n";
        }
    }

    echo "Inspection complete. Backup kept as: $backup\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
