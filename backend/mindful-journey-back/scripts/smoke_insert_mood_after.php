<?php
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$db = 'mindful_journey';
try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    $userId = 4;
    $date = date('Y-m-d', strtotime('+3 days'));

    $stmt = $pdo->prepare("INSERT INTO mood_entries (user_id, date, mood_level, mood_emoji, energy_level, stress_level, sleep_quality, notes, details, activities, emotions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $activities = json_encode(['test_activity_after']);
    $emotions = json_encode(['test_emotion_after']);
    $details = 'Details after migration test';
    $stmt->execute([$userId, $date, 8, '😄', 7, 2, 8, 'Smoke test after migration', $details, $activities, $emotions]);
    $id = $pdo->lastInsertId();
    echo "Inserted mood_entry id=$id for user_id=$userId date=$date with details\n";

    $row = $pdo->query("SELECT id, user_id, date, notes, details FROM mood_entries WHERE id = $id")->fetch();
    print_r($row);
} catch (PDOException $e) {
    fwrite(STDERR, "ERROR: " . $e->getMessage() . "\n");
    exit(1);
}
