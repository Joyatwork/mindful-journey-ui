<?php
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
    // Ensure connection uses utf8mb4 and a consistent collation to avoid collation mix errors
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    $pdo->exec("SET collation_connection = 'utf8mb4_unicode_ci'");
    $pdo->exec("SET character_set_connection = 'utf8mb4'");

    echo "Creating map database and table...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$mapDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$mapDb`");
    $pdo->exec("DROP TABLE IF EXISTS `users_map`");
    $pdo->exec(<<<'SQL'
CREATE TABLE `users_map` (
    `joy_id` BIGINT NOT NULL,
  `joy_email` VARCHAR(255) NULL,
  `joy_name` VARCHAR(255) NULL,
  `mindful_id` BIGINT NULL,
  `mindful_email` VARCHAR(255) NULL,
  `mindful_name` VARCHAR(255) NULL,
  `action` VARCHAR(32) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (joy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    echo "Populating matched users (by email)...\n";
    $insertMatched = <<<SQL
INSERT INTO `$mapDb`.users_map (joy_id, joy_email, joy_name, mindful_id, mindful_email, mindful_name, action)
SELECT j.id AS joy_id,
       LOWER(TRIM(j.email)) COLLATE utf8mb4_unicode_ci AS joy_email,
       CONCAT(COALESCE(j.first_name,''), ' ', COALESCE(j.last_name,'')) AS joy_name,
       m.id AS mindful_id,
       LOWER(TRIM(m.email)) COLLATE utf8mb4_unicode_ci AS mindful_email,
       m.name COLLATE utf8mb4_unicode_ci AS mindful_name,
       'reuse_target' AS action
FROM `$schemaA`.users j
JOIN `$schemaB`.users m ON LOWER(TRIM(j.email)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(m.email)) COLLATE utf8mb4_unicode_ci;
SQL;
    echo "Executing: INSERT matched...\n";
    try { $pdo->exec($insertMatched); } catch (PDOException $e) { echo "FAILED query: INSERT matched\n"; throw $e; }

    echo "Populating Joy-only users (candidates to insert into mindful_journey)...\n";
    $insertJoyOnly = <<<SQL
INSERT IGNORE INTO `$mapDb`.users_map (joy_id, joy_email, joy_name, action)
SELECT j.id,
       LOWER(TRIM(j.email)) COLLATE utf8mb4_unicode_ci AS joy_email,
       CONCAT(COALESCE(j.first_name,''), ' ', COALESCE(j.last_name,'')) AS joy_name,
       'insert_target' AS action
FROM `$schemaA`.users j
WHERE NOT EXISTS (
    SELECT 1 FROM `$schemaB`.users m WHERE LOWER(TRIM(m.email)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(j.email)) COLLATE utf8mb4_unicode_ci
);
SQL;
    echo "Executing: INSERT Joy-only...\n";
    try { $pdo->exec($insertJoyOnly); } catch (PDOException $e) { echo "FAILED query: INSERT Joy-only\n"; throw $e; }

    echo "Populating Mindful-only summary count...\n";
    $countQuery = "SELECT COUNT(*) AS c FROM `$schemaB`.users m WHERE NOT EXISTS (SELECT 1 FROM `$schemaA`.users j WHERE LOWER(TRIM(j.email)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(m.email)) COLLATE utf8mb4_unicode_ci)";
    echo "Executing: count mindful-only...\n";
    try { $countMindfulOnly = $pdo->query($countQuery)->fetch()['c']; } catch (PDOException $e) { echo "FAILED query: count mindful-only\n"; throw $e; }

    // Summaries
    $totalMatched = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.users_map WHERE action='reuse_target'")->fetch()['c'];
    $totalJoyOnly = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.users_map WHERE action='insert_target'")->fetch()['c'];

    echo "\nPreview summary:\n";
    echo " - matched by email: $totalMatched\n";
    echo " - only in $schemaA (JoyAtWork) candidates to insert: $totalJoyOnly\n";
    echo " - only in $schemaB (mindful_journey) count: $countMindfulOnly\n\n";

    // Show some samples
    echo "Sample matched rows:\n";
    $rows = $pdo->query("SELECT joy_id, joy_email, joy_name, mindful_id, mindful_email, mindful_name FROM `$mapDb`.users_map WHERE action='reuse_target' LIMIT 20")->fetchAll();
    foreach ($rows as $r) {
        printf("Joy %s (%s) -> Mindful %s (%s)\n", $r['joy_id'], $r['joy_email'], $r['mindful_id'], $r['mindful_email']);
    }

    echo "\nSample Joy-only rows (to insert):\n";
    $rows2 = $pdo->query("SELECT joy_id, joy_email, joy_name FROM `$mapDb`.users_map WHERE action='insert_target' LIMIT 20")->fetchAll();
    foreach ($rows2 as $r) {
        printf("Joy %s (%s) name=%s\n", $r['joy_id'], $r['joy_email'], $r['joy_name']);
    }

    echo "\nTable `merge_maps.users_map` built — this is a preview. No user rows were modified.\n";

} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
