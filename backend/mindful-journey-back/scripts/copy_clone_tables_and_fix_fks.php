<?php
// Copy tables that exist only in joyatwork_clone into mindful_journey and remap user_id via merge_maps.users_map
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'joyatwork_clone';
$schemaB = 'mindful_journey';
$mapDb = 'merge_maps';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    // find tables only in clone
    $stmt = $pdo->prepare("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME NOT IN (SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?) ORDER BY TABLE_NAME");
    $stmt->execute([$schemaA, $schemaB]);
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "No clone-only tables to copy.\n";
        exit(0);
    }

    echo "Clone-only tables to copy: " . implode(', ', $tables) . "\n";

    foreach ($tables as $table) {
        echo "\nProcessing table: $table\n";
        try {
            // create table in target like source
            $createSql = "CREATE TABLE IF NOT EXISTS `$schemaB`.`$table` LIKE `$schemaA`.`$table`";
            $pdo->exec($createSql);
            echo " - Created table schema in $schemaB (if not exists)\n";

            // insert data (use IGNORE to avoid duplicate key errors)
            $insertSql = "INSERT IGNORE INTO `$schemaB`.`$table` SELECT * FROM `$schemaA`.`$table`";
            $pdo->exec($insertSql);
            echo " - Data copied (INSERT IGNORE)\n";

            // check if table has user_id column in target
            $colStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'user_id'");
            $colStmt->execute([$schemaB, $table]);
            $hasUserId = $colStmt->fetch()['c'] > 0;
            if ($hasUserId) {
                // update user_id mapping
                $updateSql = "UPDATE `$schemaB`.`$table` t JOIN `$mapDb`.users_map m ON t.user_id = m.joy_id SET t.user_id = m.mindful_id WHERE m.mindful_id IS NOT NULL";
                $affected = $pdo->exec($updateSql);
                echo " - user_id remapped using merge_maps.users_map (rows affected: $affected)\n";
            } else {
                echo " - no user_id column to remap\n";
            }

        } catch (PDOException $e) {
            echo "ERROR processing $table: " . $e->getMessage() . "\n";
        }
    }

    echo "\nClone copy complete: tables copied and user_id remapped where applicable.\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
