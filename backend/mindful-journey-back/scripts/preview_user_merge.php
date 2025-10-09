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

    // Find matching users by email
    $sql = "SELECT j.id AS joy_id, j.email AS email, m.id AS mindful_id, m.name AS mindful_name, j.name AS joy_name
            FROM `$schemaA`.users j
            LEFT JOIN `$schemaB`.users m ON LOWER(TRIM(j.email)) = LOWER(TRIM(m.email))";
    $stmt = $pdo->query($sql);
    $matches = $stmt->fetchAll();

    $matched = 0;
    $onlyJoy = 0;
    $onlyMindful = 0;
    $joyOnlyList = [];
    foreach ($matches as $row) {
        if ($row['mindful_id']) {
            $matched++;
            echo "MATCH: Joy(id={$row['joy_id']}) email={$row['email']} -> Mindful(id={$row['mindful_id']}) name={$row['mindful_name']}\n";
        } else {
            $onlyJoy++;
            $joyOnlyList[] = $row;
        }
    }

    // Count mindful-only users (emails in mindful not in joy)
    $sql2 = "SELECT COUNT(*) AS c FROM `$schemaB`.users m WHERE NOT EXISTS (SELECT 1 FROM `$schemaA`.users j WHERE LOWER(TRIM(j.email)) = LOWER(TRIM(m.email)))";
    $countMindfulOnly = $pdo->query($sql2)->fetch()['c'];

    echo "\nSummary:\n";
    echo " - matched by email: $matched\n";
    echo " - only in $schemaA (JoyAtWork): $onlyJoy\n";
    echo " - only in $schemaB (mindful_journey): $countMindfulOnly\n";

    if ($onlyJoy > 0) {
        echo "\nUsers only in $schemaA (JoyAtWork) sample (up to 50):\n";
        $limit = min(50, count($joyOnlyList));
        for ($i = 0; $i < $limit; $i++) {
            $r = $joyOnlyList[$i];
            echo " Joy id={$r['joy_id']} email={$r['email']} name={$r['joy_name']}\n";
        }
    }

    // Show potential conflicts: emails differing only by case/whitespace are normalized above.
    echo "\nNote: matching is case-insensitive and trims whitespace.\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
