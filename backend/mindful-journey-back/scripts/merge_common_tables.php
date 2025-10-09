<?php
// Merge common tables from JoyAtWork into mindful_journey
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'JoyAtWork';
$schemaB = 'mindful_journey';
$mapDb = 'merge_maps';
// tables we've already handled and want to skip
$handled = ['users', 'challenges', 'migrations', 'roles', 'user_roles', 'cache', 'cache_locks', 'companies', 'practitioners'];
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    // find common tables
    $stmt = $pdo->prepare("SELECT t1.TABLE_NAME FROM information_schema.TABLES t1 JOIN information_schema.TABLES t2 ON t1.TABLE_NAME = t2.TABLE_NAME WHERE t1.TABLE_SCHEMA = ? AND t2.TABLE_SCHEMA = ?");
    $stmt->execute([$schemaA, $schemaB]);
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $toProcess = array_filter($tables, function ($t) use ($handled) {
        return !in_array($t, $handled);
    });

    if (empty($toProcess)) {
        echo "No common tables left to merge.\n";
        exit(0);
    }

    echo "Tables to process: " . implode(', ', $toProcess) . "\n\n";

    foreach ($toProcess as $table) {
        echo "Processing table: $table\n";
        // get columns
        $colStmt = $pdo->prepare('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION');
        $colStmt->execute([$schemaA, $table]);
        $cols = $colStmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($cols)) {
            echo " - no columns, skipping\n";
            continue;
        }

        // build select expression for columns, applying mappings when appropriate
        $selectParts = [];
        $joins = [];
        foreach ($cols as $col) {
            if ($col === 'user_id') {
                // map user_id via users_map
                $selectParts[] = "COALESCE(um.mindful_id, j.user_id) AS user_id";
                $joins['um'] = "LEFT JOIN `$mapDb`.users_map um ON j.user_id = um.joy_id";
            } elseif ($col === 'challenge_id') {
                $selectParts[] = "COALESCE(cm.mindful_id, j.challenge_id) AS challenge_id";
                $joins['cm'] = "LEFT JOIN `$mapDb`.challenges_map cm ON j.challenge_id = cm.joy_id";
            } else {
                $selectParts[] = "j.`$col`";
            }
        }

        $colsList = implode(', ', array_map(function ($c) {
            return "`$c`";
        }, $cols));
        $selectExpr = implode(', ', $selectParts);
        $joinExpr = implode(' ', $joins);

        // perform insert ignore
        $sql = "INSERT IGNORE INTO `$schemaB`.`$table` ($colsList) SELECT $selectExpr FROM `$schemaA`.`$table` j $joinExpr";
        try {
            $affected = $pdo->exec($sql);
            if ($affected === false) $affected = 0;
            echo " - rows inserted/ignored: $affected\n";
        } catch (PDOException $e) {
            echo " - ERROR while merging $table: " . $e->getMessage() . "\n";
        }
    }

    echo "\nMerge of common tables complete.\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
