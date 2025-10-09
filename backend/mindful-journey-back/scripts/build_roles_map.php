<?php
// Build merge_maps.roles_map: match roles by name between JoyAtWork and mindful_journey
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

    echo "Creating roles_map table...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$mapDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$mapDb`");
    $pdo->exec("DROP TABLE IF EXISTS `roles_map`");
    $pdo->exec(
        <<<'SQL'
CREATE TABLE `roles_map` (
  `joy_id` BIGINT NOT NULL,
  `joy_name` VARCHAR(255) NULL,
  `mindful_id` BIGINT NULL,
  `mindful_name` VARCHAR(255) NULL,
  `action` VARCHAR(32) NOT NULL,
  `notes` TEXT NULL,
  PRIMARY KEY (joy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    echo "Populating matched roles by name...\n";
    $insertMatched = <<<SQL
INSERT INTO `$mapDb`.roles_map (joy_id, joy_name, mindful_id, mindful_name, action)
SELECT j.id AS joy_id,
       LOWER(TRIM(j.name)) COLLATE utf8mb4_unicode_ci AS joy_name,
       m.id AS mindful_id,
       LOWER(TRIM(m.name)) COLLATE utf8mb4_unicode_ci AS mindful_name,
       'reuse_target' AS action
FROM `$schemaA`.roles j
JOIN `$schemaB`.roles m ON LOWER(TRIM(j.name)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(m.name)) COLLATE utf8mb4_unicode_ci;
SQL;
    // Execute safely (silently if table missing)
    try {
        $pdo->exec($insertMatched);
    } catch (PDOException $e) {
        echo "(note) join query failed: " . $e->getMessage() . "\n";
    }

    echo "Populating Joy-only roles (to insert)...\n";
    $insertJoyOnly = <<<SQL
INSERT IGNORE INTO `$mapDb`.roles_map (joy_id, joy_name, action)
SELECT j.id, LOWER(TRIM(j.name)) COLLATE utf8mb4_unicode_ci AS joy_name, 'insert_target' AS action
FROM `$schemaA`.roles j
WHERE NOT EXISTS (
  SELECT 1 FROM `$schemaB`.roles m WHERE LOWER(TRIM(m.name)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(j.name)) COLLATE utf8mb4_unicode_ci
);
SQL;
    try {
        $pdo->exec($insertJoyOnly);
    } catch (PDOException $e) {
        echo "(note) insertJoyOnly failed: " . $e->getMessage() . "\n";
    }

    $totalMatched = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.roles_map WHERE action='reuse_target'")->fetch()['c'];
    $totalJoyOnly = $pdo->query("SELECT COUNT(*) AS c FROM `$mapDb`.roles_map WHERE action='insert_target'")->fetch()['c'];
    $countMindfulOnly = 0;
    try {
        $countMindfulOnly = $pdo->query("SELECT COUNT(*) AS c FROM `$schemaB`.roles m WHERE NOT EXISTS (SELECT 1 FROM `$schemaA`.roles j WHERE LOWER(TRIM(j.name)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(m.name)) COLLATE utf8mb4_unicode_ci)")->fetch()['c'];
    } catch (PDOException $e) { /* ignore */
    }

    echo "\nPreview summary for roles:\n";
    echo " - matched by name: $totalMatched\n";
    echo " - only in $schemaA (JoyAtWork) candidates to insert: $totalJoyOnly\n";
    echo " - only in $schemaB (mindful_journey) count: $countMindfulOnly\n\n";

    echo "Sample Joy-only roles:\n";
    $rows = $pdo->query("SELECT joy_id, joy_name FROM `$mapDb`.roles_map WHERE action='insert_target' LIMIT 20")->fetchAll();
    foreach ($rows as $r) echo "Joy {$r['joy_id']} name={$r['joy_name']}\n";

    echo "\nroles_map built (preview).\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
