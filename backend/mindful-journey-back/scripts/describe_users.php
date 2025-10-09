<?php
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'JoyAtWork';
$schemaB = 'mindful_journey';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

    $describe = function($schema) use ($pdo, $host, $port, $user, $pass) {
        echo "Schema: $schema\n";
        echo str_repeat('-', 40) . "\n";
        $cols = $pdo->prepare('SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION');
        $cols->execute([$schema, 'users']);
        $colsAll = $cols->fetchAll();
        if (empty($colsAll)) {
            echo "(no users table)\n\n";
            return;
        }
        foreach ($colsAll as $c) {
            printf("%30s : %20s %8s %s\n", $c['COLUMN_NAME'], $c['COLUMN_TYPE'], $c['IS_NULLABLE'], $c['COLUMN_DEFAULT']);
        }

        // sample rows
    $dataDsn = "mysql:host={$host};port={$port};dbname={$schema};charset=utf8mb4";
    $pdoSrc = new PDO($dataDsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        $rows = $pdoSrc->query('SELECT * FROM `users` LIMIT 5')->fetchAll();
        echo "\nSample rows:\n";
        if (empty($rows)) {
            echo "(no rows)\n\n";
        } else {
            foreach ($rows as $r) {
                print_r($r);
                echo "\n";
            }
        }
        echo "\n";
    };

    $describe($schemaA);
    $describe($schemaB);

} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
