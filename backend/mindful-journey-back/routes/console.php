<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * db:sync-missing-columns
 *
 * Sync structure and data for columns that exist in the restored database but
 * are missing in the current database.
 *
 * Options:
 *  --tables=users,appointments        Limit to specific tables (comma-separated)
 *  --dry                              Only print actions without executing
 *
 * Assumptions:
 *  - Single-column primary key named "id" (Laravel convention)
 *  - Source connection: "restore" (configured in config/database.php)
 */
Artisan::command('db:sync-missing-columns {--tables=} {--dry}', function () {
    $this->info('Starting sync of missing columns from restore database...');

    $targetConn = DB::connection('mysql');
    $sourceConn = DB::connection('restore');

    $targetDb = $targetConn->getDatabaseName();
    $sourceDb = $sourceConn->getDatabaseName();

    if (!$sourceDb) {
        $this->error('RESTORE_DB_DATABASE is not configured. Aborting.');
        return self::FAILURE;
    }

    $tablesFilter = $this->option('tables');
    $dry = (bool) $this->option('dry');

    $tablesFilterArr = null;
    if ($tablesFilter) {
        $tablesFilterArr = collect(explode(',', $tablesFilter))
            ->map(fn($t) => trim($t))
            ->filter()
            ->values()
            ->all();
    }

    // Fetch columns for both schemas
    $colsSql = "SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?";
    $sourceCols = collect($sourceConn->select($colsSql, [$sourceDb]))
        ->groupBy('TABLE_NAME');
    $targetCols = collect($targetConn->select($colsSql, [$targetDb]))
        ->groupBy('TABLE_NAME');

    // Determine candidate tables
    $candidateTables = $sourceCols->keys();
    if ($tablesFilterArr) {
        $candidateTables = collect($tablesFilterArr);
    }

    $totalAdded = 0;
    $totalUpdated = 0;
    $totalTables = 0;

    foreach ($candidateTables as $table) {
        $src = $sourceCols->get($table);
        if (!$src) {
            continue;
        }

        $tgt = $targetCols->get($table) ?? collect();
        $tgtNames = collect($tgt)->pluck('COLUMN_NAME')->all();

        $missing = collect($src)->filter(fn($c) => !in_array($c->COLUMN_NAME, $tgtNames));
        if ($missing->isEmpty()) {
            continue;
        }

        $this->line("Table {$table}: " . $missing->count() . " missing column(s)");
        $totalTables++;

        foreach ($missing as $col) {
            $colName = $col->COLUMN_NAME;
            $colType = $col->COLUMN_TYPE; // e.g., varchar(255), int(11), json, text

            $alter = "ALTER TABLE `{$targetDb}`.`{$table}` ADD COLUMN `{$colName}` {$colType} NULL";

            if ($dry) {
                $this->warn("DRY-RUN: {$alter}");
            } else {
                $targetConn->statement($alter);
                $totalAdded++;
            }

            // Copy values from restore to target by joining on id
            $update = "UPDATE `{$targetDb}`.`{$table}` t JOIN `{$sourceDb}`.`{$table}` r ON r.id = t.id SET t.`{$colName}` = r.`{$colName}`";

            if ($dry) {
                $this->warn("DRY-RUN: {$update}");
            } else {
                $affected = $targetConn->update($update);
                $totalUpdated += $affected;
                $this->line(" -> Copied {$affected} row(s) for column `{$colName}`");
            }
        }
    }

    $this->info("Done. Tables affected: {$totalTables}, columns added: {$totalAdded}, rows updated: {$totalUpdated}.");

    return self::SUCCESS;
})->purpose('Sync missing columns and data from the restore database into the current database');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
