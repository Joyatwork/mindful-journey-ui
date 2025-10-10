<?php
// Build challenges_map from joyatwork_clone -> mindful_journey
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'joyatwork_clone';
$schemaB = 'mindful_journey';
$mapDb = 'merge_maps';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$schemaB;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$mapDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$mapDb`");
    $pdo->exec("DROP TABLE IF EXISTS `challenges_map`");
    $pdo->exec(
        <<<'SQL'
CREATE TABLE `challenges_map` (
  `joy_id` BIGINT NOT NULL,
  `joy_title` VARCHAR(255) NULL,
  `mindful_id` BIGINT NULL,
  `mindful_title` VARCHAR(255) NULL,
  `action` VARCHAR(32) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (joy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    echo "Populating matched challenges by title...\n";
    $pdo->exec("INSERT INTO `$mapDb`.challenges_map (joy_id, joy_title, mindful_id, mindful_title, action) SELECT j.id, j.title, m.id, m.title, 'reuse_target' FROM `$schemaA`.challenges j JOIN `$schemaB`.challenges m ON LOWER(TRIM(j.title)) = LOWER(TRIM(m.title))");

    echo "Populating Joy-only challenges (to insert)...\n";
    $pdo->exec("INSERT IGNORE INTO `$mapDb`.challenges_map (joy_id, joy_title, action) SELECT j.id, j.title, 'insert_target' FROM `$schemaA`.challenges j WHERE NOT EXISTS (SELECT 1 FROM `$schemaB`.challenges m WHERE LOWER(TRIM(m.title)) = LOWER(TRIM(j.title)))");

    $totalMatched = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.challenges_map WHERE action='reuse_target'")->fetch()['c'];
    $totalJoyOnly = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.challenges_map WHERE action='insert_target'")->fetch()['c'];

    echo "\nPreview summary for challenges:\n - matched by title: $totalMatched\n - only in $schemaA (joyatwork_clone) candidates to insert: $totalJoyOnly\n";
    echo "\nchallenges_map built (preview).\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
