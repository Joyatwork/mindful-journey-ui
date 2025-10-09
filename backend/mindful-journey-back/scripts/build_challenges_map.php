<?php
// Build merge_maps.challenges_map: match challenges by title between JoyAtWork and mindful_journey
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'JoyAtWork';
$schemaB = 'mindful_journey';
$mapDb = 'merge_maps';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=information_schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    echo "Creating challenges_map table...\n";
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
  PRIMARY KEY (joy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    echo "Populating matched challenges by title...\n";
    $insertMatched = <<<SQL
INSERT INTO `$mapDb`.challenges_map (joy_id, joy_title, mindful_id, mindful_title, action)
SELECT j.id AS joy_id,
       LOWER(TRIM(j.title)) COLLATE utf8mb4_unicode_ci AS joy_title,
       m.id AS mindful_id,
       LOWER(TRIM(m.title)) COLLATE utf8mb4_unicode_ci AS mindful_title,
       'reuse_target' AS action
FROM `$schemaA`.challenges j
JOIN `$schemaB`.challenges m ON LOWER(TRIM(j.title)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(m.title)) COLLATE utf8mb4_unicode_ci;
SQL;
    $pdo->exec($insertMatched);

    echo "Populating Joy-only challenges (to insert)...\n";
    $insertJoyOnly = <<<SQL
INSERT IGNORE INTO `$mapDb`.challenges_map (joy_id, joy_title, action)
SELECT j.id, LOWER(TRIM(j.title)) COLLATE utf8mb4_unicode_ci AS joy_title, 'insert_target' AS action
FROM `$schemaA`.challenges j
WHERE NOT EXISTS (
  SELECT 1 FROM `$schemaB`.challenges m WHERE LOWER(TRIM(m.title)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(j.title)) COLLATE utf8mb4_unicode_ci
);
SQL;
    $pdo->exec($insertJoyOnly);

    $totalMatched = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.challenges_map WHERE action='reuse_target'")->fetch()['c'];
    $totalJoyOnly = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.challenges_map WHERE action='insert_target'")->fetch()['c'];
    $countMindfulOnly = $pdo->query("SELECT COUNT(*) AS c FROM `$schemaB`.challenges m WHERE NOT EXISTS (SELECT 1 FROM `$schemaA`.challenges j WHERE LOWER(TRIM(j.title)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(m.title)) COLLATE utf8mb4_unicode_ci)")->fetch()['c'];

    echo "\nPreview summary for challenges:\n";
    echo " - matched by title: $totalMatched\n";
    echo " - only in $schemaA (JoyAtWork) candidates to insert: $totalJoyOnly\n";
    echo " - only in $schemaB (mindful_journey) count: $countMindfulOnly\n\n";

    echo "Sample Joy-only challenges:\n";
    $rows = $pdo->query("SELECT joy_id, joy_title FROM `$mapDb`.challenges_map WHERE action='insert_target' LIMIT 20")->fetchAll();
    foreach ($rows as $r) echo "Joy {$r['joy_id']} title={$r['joy_title']}\n";

    echo "\nchallenges_map built (preview).\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
