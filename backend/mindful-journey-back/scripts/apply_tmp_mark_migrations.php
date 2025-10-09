<?php
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$dbname = 'mindful_journey';
try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $file = __DIR__ . '/../tmp_mark_migrations.sql';
    if (!file_exists($file)) {
        echo "tmp_mark_migrations.sql not found at $file\n";
        exit(1);
    }
    $sql = file_get_contents($file);
    // Execute the INSERT statement(s). Use exec.
    $pdo->beginTransaction();
    $pdo->exec($sql);
    $pdo->commit();
    echo "Applied tmp_mark_migrations.sql successfully.\n";
} catch (PDOException $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    echo "ERROR applying tmp_mark_migrations.sql: " . $e->getMessage() . "\n";
    exit(1);
}
