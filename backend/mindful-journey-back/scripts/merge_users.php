<?php
// Merge Joy-only users into mindful_journey.users according to merge_maps.users_map
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$schemaA = 'JoyAtWork';
$schemaB = 'mindful_journey';
$mapDb = 'merge_maps';
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$schemaB;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    // ensure consistent collation
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    $pdo->exec("SET collation_connection = 'utf8mb4_unicode_ci'");

    // Fetch map entries to insert
    $mapStmt = $pdo->prepare("SELECT joy_id, joy_email, joy_name FROM `$mapDb`.users_map WHERE action = 'insert_target'");
    $mapStmt->execute();
    $toInsert = $mapStmt->fetchAll();

    if (empty($toInsert)) {
        echo "No Joy-only users to insert.\n";
        exit(0);
    }

    // Prepare select from Joy DB (use separate connection for source schema)
    $dsnJoy = "mysql:host=$host;port=$port;dbname=$schemaA;charset=utf8mb4";
    $pdoJoy = new PDO($dsnJoy, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdoJoy->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    // Prepare insert into mindful_journey.users
    $insertSql = "INSERT INTO `$schemaB`.users (google_id, provider, name, email, email_verified_at, birth_date, gender, phone, bio, avatar, avatar_url, preferences, health_goals, status, last_login_at, password, remember_token, created_at, updated_at) VALUES (:google_id, :provider, :name, :email, :email_verified_at, :birth_date, :gender, :phone, :bio, :avatar, :avatar_url, :preferences, :health_goals, :status, :last_login_at, :password, :remember_token, :created_at, :updated_at)";
    $insertStmt = $pdo->prepare($insertSql);

    $updated = 0;
    $created = 0;
    $linkedExisting = 0;
    foreach ($toInsert as $row) {
        $joyId = $row['joy_id'];
        // fetch joy user
        $u = $pdoJoy->prepare("SELECT * FROM `users` WHERE id = ?");
        $u->execute([$joyId]);
        $joyUser = $u->fetch();
        if (!$joyUser) {
            echo "Warning: Joy user id=$joyId not found, skipping.\n";
            continue;
        }

        // Map fields
        $name = trim((($joyUser['first_name'] ?? '') . ' ' . ($joyUser['last_name'] ?? '')));
        if ($name === '') $name = null;
        $email = isset($joyUser['email']) && $joyUser['email'] !== '' ? $joyUser['email'] : null;
        $password = $joyUser['password_hash'] ?? null;
        $phone = $joyUser['phone'] ?? null;
        $status = null;
        if (array_key_exists('is_active', $joyUser)) {
            $isActive = $joyUser['is_active'];
            if ($isActive === '1' || $isActive === 1 || $isActive === 'true' || $isActive === 't') $status = 'active';
            else $status = 'inactive';
        }
        $createdAt = $joyUser['created_at'] ?: date('Y-m-d H:i:s');
        $updatedAt = $joyUser['updated_at'] ?: date('Y-m-d H:i:s');

        // Build params for insert (nullable fields)
        $params = [
            ':google_id' => null,
            ':provider' => null,
            ':name' => $name,
            ':email' => $email,
            ':email_verified_at' => null,
            ':birth_date' => null,
            ':gender' => null,
            ':phone' => $phone,
            ':bio' => null,
            ':avatar' => null,
            ':avatar_url' => null,
            ':preferences' => null,
            ':health_goals' => null,
            ':status' => $status ?? 'active',
            ':last_login_at' => null,
            ':password' => $password,
            ':remember_token' => null,
            ':created_at' => $createdAt,
            ':updated_at' => $updatedAt,
        ];

        // Try insert within transaction per user
        try {
            $pdo->beginTransaction();
            $insertStmt->execute($params);
            $newId = $pdo->lastInsertId();
            // update map
            $upd = $pdo->prepare("UPDATE `$mapDb`.users_map SET mindful_id = ?, mindful_email = ?, mindful_name = ?, action='inserted' WHERE joy_id = ?");
            $upd->execute([$newId, $email, $name, $joyId]);
            $pdo->commit();
            echo "Inserted Joy user id=$joyId as mindful_id=$newId (email={$email})\n";
            $created++;
        } catch (PDOException $e) {
            $pdo->rollBack();
            // If duplicate email, link to existing mindful user
            if ($e->getCode() == '23000' && stripos($e->getMessage(), 'Duplicate') !== false) {
                // find existing mindful user by email
                $find = $pdo->prepare("SELECT id FROM `$schemaB`.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) COLLATE utf8mb4_unicode_ci LIMIT 1");
                $find->execute([$email]);
                $ex = $find->fetch();
                if ($ex) {
                    $existingId = $ex['id'];
                    $upd = $pdo->prepare("UPDATE `$mapDb`.users_map SET mindful_id = ?, mindful_email = ?, mindful_name = ?, action='linked_existing', notes = ? WHERE joy_id = ?");
                    $note = 'Email already exists; linked to existing mindful user';
                    $upd->execute([$existingId, $email, $name, $note, $joyId]);
                    echo "Linked Joy user id=$joyId to existing mindful user id=$existingId (email={$email})\n";
                    $linkedExisting++;
                    continue;
                }
            }
            // otherwise record error in notes
            $upd = $pdo->prepare("UPDATE `$mapDb`.users_map SET notes = ?, action='error' WHERE joy_id = ?");
            $upd->execute(["Error inserting: " . $e->getMessage(), $joyId]);
            echo "Error inserting Joy user id=$joyId: " . $e->getMessage() . "\n";
        }
    }

    echo "\nMerge complete. Created: $created, linked existing: $linkedExisting, updated/errored: $updated\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
