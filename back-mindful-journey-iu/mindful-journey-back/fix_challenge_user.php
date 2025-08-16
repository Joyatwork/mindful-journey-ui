<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

function columnExists($table, $column) {
    $cols = DB::select("PRAGMA table_info('$table')");
    foreach ($cols as $c) { if (strcasecmp($c->name, $column) === 0) return true; }
    return false;
}

$table = 'challenge_user';
$added = [];

try {
    if (!columnExists($table, 'completed_at')) {
        DB::statement("ALTER TABLE $table ADD COLUMN completed_at DATETIME NULL");
        $added[] = 'completed_at';
    }
    if (!columnExists($table, 'created_at')) {
        DB::statement("ALTER TABLE $table ADD COLUMN created_at DATETIME NULL");
        $added[] = 'created_at';
    }
    if (!columnExists($table, 'updated_at')) {
        DB::statement("ALTER TABLE $table ADD COLUMN updated_at DATETIME NULL");
        $added[] = 'updated_at';
    }

    echo "OK: added [" . implode(', ', $added) . "]\n";

    // Dump columns for verification
    $cols = DB::select("PRAGMA table_info('$table')");
    foreach ($cols as $c) {
        echo $c->name . " | type=" . $c->type . "\n";
    }
} catch (Exception $e) {
    echo "ERR: " . $e->getMessage() . "\n";
}
