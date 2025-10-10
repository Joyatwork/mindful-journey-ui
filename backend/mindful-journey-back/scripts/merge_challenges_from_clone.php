<?php
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

    $toInsert = $pdo->query("SELECT joy_id FROM `$mapDb`.challenges_map WHERE action='insert_target'")->fetchAll(PDO::FETCH_COLUMN);
    if (empty($toInsert)) { echo "No Joy-only challenges to insert.\n"; exit(0); }

    $dsnJoy = "mysql:host=$host;port=$port;dbname=$schemaA;charset=utf8mb4";
    $pdoJoy = new PDO($dsnJoy, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdoJoy->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    $insertStmt = $pdo->prepare("INSERT INTO `$schemaB`.challenges (title, description, type, created_at, updated_at) VALUES (:title, :description, :type, :created_at, :updated_at)");
    $updateMap = $pdo->prepare("UPDATE `$mapDb`.challenges_map SET mindful_id = ?, mindful_title = ?, action = 'inserted' WHERE joy_id = ?");

    $created = 0;
    foreach ($toInsert as $joyId) {
        $row = $pdoJoy->prepare("SELECT * FROM `challenges` WHERE id = ?");
        $row->execute([$joyId]);
        $c = $row->fetch();
        if (!$c) { echo "Joy challenge id=$joyId not found, skipping.\n"; continue; }
        $params = [
            ':title' => $c['title'] ?? null,
            ':description' => $c['description'] ?? null,
            ':type' => $c['type'] ?? null,
            ':created_at' => $c['created_at'] ?? date('Y-m-d H:i:s'),
            ':updated_at' => $c['updated_at'] ?? date('Y-m-d H:i:s')
        ];
        try {
            $pdo->beginTransaction();
            $insertStmt->execute($params);
            $newId = $pdo->lastInsertId();
            $updateMap->execute([$newId, $c['title'], $joyId]);
            $pdo->commit();
            echo "Inserted challenge Joy id=$joyId as mindful_id=$newId\n";
            $created++;
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo "Error inserting challenge $joyId: " . $e->getMessage() . "\n";
            $pdo->exec("UPDATE `$mapDb`.challenges_map SET action='error', notes = '" . addslashes($e->getMessage()) . "' WHERE joy_id = $joyId");
        }
    }

    echo "\nChallenges merged: $created created.\n";

    $remapSql = "UPDATE `$schemaB`.challenge_user cu JOIN `$mapDb`.challenges_map m ON cu.challenge_id = m.joy_id SET cu.challenge_id = m.mindful_id WHERE m.mindful_id IS NOT NULL";
    try {
        $affected = $pdo->exec($remapSql);
        echo "Remapped challenge_id in challenge_user (rows affected: $affected)\n";
    } catch (PDOException $e) {
        echo "Error remapping challenge_id: " . $e->getMessage() . "\n";
    }
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
