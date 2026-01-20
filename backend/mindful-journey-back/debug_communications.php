<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\HrCommunication;

echo "=== DIAGNOSTIC COMMUNICATIONS / ANNONCES ===\n\n";

try {
    $total = HrCommunication::count();
    $published = HrCommunication::where('status', 'published')->count();
    $notDeleted = HrCommunication::whereNull('deleted_at')->count();

    echo "Total communications: $total\n";
    echo "Published: $published\n";
    echo "Not soft-deleted: $notDeleted\n\n";

    $byEntreprise = HrCommunication::selectRaw('COALESCE(entreprise_id, "NULL") as entreprise_id, COUNT(*) as cnt')
        ->groupBy('entreprise_id')
        ->orderBy('cnt', 'desc')
        ->get();

    echo "Par entreprise_id:\n";
    foreach ($byEntreprise as $row) {
        echo " - entreprise_id=" . ($row->entreprise_id === null ? 'NULL' : $row->entreprise_id) . ": {$row->cnt}\n";
    }

    // echo "\nExemples (limité à 10):\n";
    // $sample = HrCommunication::orderByRaw('COALESCE(published_at, start_date) DESC')->limit(10)->get(array(
    //     'id', 'entreprise_id', 'status', 'type', 'objective', 'title', 'start_date', 'published_at', 'deleted_at'
    // ));
    // foreach ($sample as $c) {
    //     echo " - id={$c->id} | ent={$c->entreprise_id} | status={$c->status} | type={$c->type} | obj={$c->objective} | title=" . ($c->title ?? '') . " | start=" . ($c->start_date ?? 'null') . " | published=" . ($c->published_at ?? 'null') . " | deleted=" . ($c->deleted_at ?? 'null') . "\n";
    // }

    echo "\n✅ Diagnostic terminé.\n";
} catch (Throwable $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
