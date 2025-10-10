<?php
// Summary checks for mindful_journey unified DB
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schema = 'mindful_journey';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$schema;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    $tables = [
        'users','challenges','mood_entries','campaigns','employees','appointments','campaign_participants','challenge_user'
    ];

    echo "== Counts in $schema ==\n";
    foreach ($tables as $t) {
        try {
            $c = $pdo->query("SELECT COUNT(*) AS c FROM `$t`")->fetch()['c'];
            echo sprintf("%20s : %8d\n", $t, $c);
        } catch (Exception $e) {
            echo sprintf("%20s : (missing) - %s\n", $t, $e->getMessage());
        }
    }

    echo "\n== Referential integrity checks ==\n";
    // mood_entries.user_id referencing users
    try {
        $orphanMood = $pdo->query("SELECT COUNT(*) AS c FROM mood_entries me LEFT JOIN users u ON me.user_id = u.id WHERE u.id IS NULL")->fetch()['c'];
        echo "mood_entries with missing user_id refs: $orphanMood\n";
    } catch (Exception $e) { echo "mood_entries check failed: " . $e->getMessage() . "\n"; }

    // employees.user_id referencing users
    try {
        $orphanEmp = $pdo->query("SELECT COUNT(*) AS c FROM employees e LEFT JOIN users u ON e.user_id = u.id WHERE u.id IS NULL")->fetch()['c'];
        echo "employees with missing user_id refs: $orphanEmp\n";
    } catch (Exception $e) { echo "employees check failed: " . $e->getMessage() . "\n"; }

    // challenge_user.challenge_id referencing challenges
    try {
        $orphanCU = $pdo->query("SELECT COUNT(*) AS c FROM challenge_user cu LEFT JOIN challenges c ON cu.challenge_id = c.id WHERE c.id IS NULL")->fetch()['c'];
        echo "challenge_user rows with missing challenge refs: $orphanCU\n";
    } catch (Exception $e) { echo "challenge_user check failed: " . $e->getMessage() . "\n"; }

    // campaign_participants.user_id referencing users
    try {
        $orphanCP = $pdo->query("SELECT COUNT(*) AS c FROM campaign_participants cp LEFT JOIN users u ON cp.user_id = u.id WHERE u.id IS NULL")->fetch()['c'];
        echo "campaign_participants with missing user refs: $orphanCP\n";
    } catch (Exception $e) { echo "campaign_participants check failed: " . $e->getMessage() . "\n"; }

    echo "\nChecks complete. If any 'missing' counts are >0, we can attempt remapping or manual review.\n";

} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
