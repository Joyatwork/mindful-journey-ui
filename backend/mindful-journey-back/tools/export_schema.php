<?php
// export_schema.php
// Extrait la structure (colonnes, clés étrangères, indexes) de toutes les tables
// et génère un fichier JSON + un fichier Markdown résumé.
// Usage: php tools/export_schema.php

$envPath = __DIR__ . '/../.env';
if (!file_exists($envPath)) {
    fwrite(STDERR, ".env introuvable. Placez ce script dans le dossier backend/mindful-journey-back/tools.\n");
    exit(2);
}

$env = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$config = [];
foreach ($env as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') === false) continue;
    [$k, $v] = array_map('trim', explode('=', $line, 2));
    $config[$k] = trim($v, "\"'");
}

$dbDriver = $config['DB_CONNECTION'] ?? 'mysql';
$host = $config['DB_HOST'] ?? '127.0.0.1';
$port = $config['DB_PORT'] ?? '3306';
$db = $config['DB_DATABASE'] ?? '';
$user = $config['DB_USERNAME'] ?? '';
$pass = $config['DB_PASSWORD'] ?? '';

if ($dbDriver !== 'mysql') {
    fwrite(STDERR, "Ce script supporte uniquement MySQL/MariaDB. DB_CONNECTION={$dbDriver}\n");
    exit(3);
}

$dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    fwrite(STDERR, "Échec connexion DB: " . $e->getMessage() . "\n");
    exit(4);
}

try {
    $stmt = $pdo->query('SHOW TABLES');
    $tables = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    $schema = [
        'database' => $db,
        'generated_at' => date('c'),
        'tables' => new stdClass(),
    ];

    foreach ($tables as $table) {
        // colonnes
        $colStmt = $pdo->prepare('SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_KEY, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table
            ORDER BY ORDINAL_POSITION');
        $colStmt->execute([':db' => $db, ':table' => $table]);
        $cols = $colStmt->fetchAll(PDO::FETCH_ASSOC);

        // foreign keys
        $fkStmt = $pdo->prepare("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table AND REFERENCED_TABLE_NAME IS NOT NULL");
        $fkStmt->execute([':db' => $db, ':table' => $table]);
        $fks = $fkStmt->fetchAll(PDO::FETCH_ASSOC);

        // indexes
        $idxStmt = $pdo->prepare('SHOW INDEX FROM `' . $table . '`');
        $idxStmt->execute();
        $indexesRaw = $idxStmt->fetchAll(PDO::FETCH_ASSOC);
        $indexes = [];
        foreach ($indexesRaw as $ir) {
            $key = $ir['Key_name'];
            if (!isset($indexes[$key])) $indexes[$key] = [
                'non_unique' => (int)$ir['Non_unique'],
                'columns' => [],
                'index_type' => $ir['Index_type'] ?? null,
                'seq_in_index' => [],
            ];
            $indexes[$key]['columns'][$ir['Seq_in_index']] = $ir['Column_name'];
            $indexes[$key]['seq_in_index'][] = $ir['Seq_in_index'];
        }
        // normalize columns order
        foreach ($indexes as &$ix) {
            ksort($ix['columns']);
            $ix['columns'] = array_values($ix['columns']);
        }
        unset($ix);

        $schema['tables']->{$table} = [
            'columns' => $cols,
            'foreign_keys' => $fks,
            'indexes' => $indexes,
        ];
    }

    // write JSON to storage/app/schema.json
    $storageDir = __DIR__ . '/../storage/app';
    if (!is_dir($storageDir)) @mkdir($storageDir, 0755, true);
    $jsonFile = $storageDir . '/schema.json';
    file_put_contents($jsonFile, json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // write Markdown summary to docs/database.md
    $docsDir = __DIR__ . '/../docs';
    if (!is_dir($docsDir)) @mkdir($docsDir, 0755, true);
    $mdFile = $docsDir . '/database.md';

    $md = "# Documentation de la base de données ({$db})\n\n";
    $md .= "Généré le: " . date('Y-m-d H:i:s') . "\n\n";
    $md .= "## Tables (" . count($tables) . ")\n\n";

    foreach ($tables as $table) {
        $md .= "### {$table}\n\n";
        $md .= "**Colonnes**:\n\n";
        $cols = $schema['tables']->{$table}['columns'];
        $md .= "| Nom | Type | Null | Défaut | Extra | Key | Longueur |\n";
        $md .= "|---|---:|:---:|---|---|---:|\n";
        foreach ($cols as $c) {
            $md .= "| {$c['COLUMN_NAME']} | {$c['COLUMN_TYPE']} | {$c['IS_NULLABLE']} | " . (is_null($c['COLUMN_DEFAULT']) ? '' : $c['COLUMN_DEFAULT']) . " | {$c['EXTRA']} | {$c['COLUMN_KEY']} | " . (isset($c['CHARACTER_MAXIMUM_LENGTH']) ? $c['CHARACTER_MAXIMUM_LENGTH'] : '') . " |\n";
        }
        $md .= "\n**Clés étrangères**:\n\n";
        $fks = $schema['tables']->{$table}['foreign_keys'];
        if (count($fks) === 0) {
            $md .= "Aucune clé étrangère déclarée.\n\n";
        } else {
            $md .= "| Constraint | Colonne | Table référencée | Colonne référencée |\n";
            $md .= "|---|---|---|---|\n";
            foreach ($fks as $fk) {
                $md .= "| {$fk['CONSTRAINT_NAME']} | {$fk['COLUMN_NAME']} | {$fk['REFERENCED_TABLE_NAME']} | {$fk['REFERENCED_COLUMN_NAME']} |\n";
            }
            $md .= "\n";
        }

        $md .= "**Indexes**:\n\n";
        $indexes = $schema['tables']->{$table}['indexes'];
        if (count($indexes) === 0) {
            $md .= "Aucun index trouvé.\n\n";
        } else {
            $md .= "| Nom | Non unique | Type | Colonnes |\n";
            $md .= "|---|---:|---|---|\n";
            foreach ($indexes as $name => $ix) {
                $colsTxt = implode(', ', $ix['columns']);
                $md .= "| {$name} | {$ix['non_unique']} | {$ix['index_type']} | {$colsTxt} |\n";
            }
            $md .= "\n";
        }

        $md .= "---\n\n";
    }

    file_put_contents($mdFile, $md);

    // print summary JSON to stdout
    echo json_encode(['status' => 'ok', 'database' => $db, 'tables' => count($tables), 'json' => $jsonFile, 'markdown' => $mdFile], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
} catch (PDOException $e) {
    fwrite(STDERR, "Erreur: " . $e->getMessage() . "\n");
    exit(5);
}
