<?php
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = 18136;
$user = 'Ali_CAMARA';
$pass = 'AVNS_TaUyL9dsB37NJOKRllf';
$mapDb = 'merge_maps';
$outDir = __DIR__ . '/exports';
if (!is_dir($outDir)) mkdir($outDir, 0755, true);
try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$mapDb;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $tables = ['users_map', 'challenges_map', 'roles_map'];
    $reportLines = [];
    foreach ($tables as $t) {
        // check exists
        $res = $pdo->query("SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . $mapDb . "' AND TABLE_NAME = '$t'")->fetch();
        if ($res['c'] == 0) {
            $reportLines[] = "Table $t: not present\n";
            continue;
        }
        $rows = $pdo->query("SELECT * FROM `$t` ORDER BY joy_id LIMIT 10000")->fetchAll();
        $csvPath = "$outDir/$t.csv";
        $fh = fopen($csvPath, 'w');
        if ($fh === false) throw new Exception("Cannot open $csvPath for write");
        // header
        if (!empty($rows)) {
            fputcsv($fh, array_keys($rows[0]));
            foreach ($rows as $r) fputcsv($fh, $r);
        }
        fclose($fh);
        $reportLines[] = "Exported $t: " . count($rows) . " rows -> $csvPath";

        // summary by action if column exists
        $cols = $pdo->query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '$mapDb' AND TABLE_NAME = '$t'")->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('action', $cols)) {
            $summary = $pdo->query("SELECT action, COUNT(*) AS c FROM `$t` GROUP BY action")->fetchAll();
            $reportLines[] = "Summary for $t:";
            foreach ($summary as $s) $reportLines[] = " - {$s['action']} : {$s['c']}";
            // add sample of each action
            foreach ($summary as $s) {
                $act = $s['action'];
                $sample = $pdo->query("SELECT * FROM `$t` WHERE action = '" . addslashes($act) . "' LIMIT 10")->fetchAll();
                $reportLines[] = " Samples for action=$act:";
                foreach ($sample as $row) $reportLines[] = '   ' . json_encode($row);
            }
        }
        $reportLines[] = "";
    }
    $reportPath = "$outDir/merge_maps_audit.txt";
    file_put_contents($reportPath, implode("\n", $reportLines));
    echo "Exported CSVs and report to: $outDir\n";
    echo "Report file: $reportPath\n";
} catch (PDOException $e) {
    fwrite(STDERR, 'DB ERROR: ' . $e->getMessage() . "\n");
    exit(1);
} catch (Exception $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
