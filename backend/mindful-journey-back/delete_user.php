<?php
// Suppression complète d'un utilisateur et de ses diagnostics
// Usage: php delete_user.php <user_id>

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Diagnostic;
use App\Models\AnnualDiagnostic;
use Illuminate\Support\Facades\DB;

$id = $argv[1] ?? null;
if (!$id || !ctype_digit($id)) {
    echo "Usage: php delete_user.php <user_id>\n";
    exit(1);
}

$user = User::find($id);
if (!$user) {
    echo "Utilisateur $id introuvable.\n";
    exit(0);
}

$quickCount = Diagnostic::where('user_id', $id)->count();
$annualCount = AnnualDiagnostic::where('user_id', $id)->count();

DB::transaction(function () use ($id, $user) {
    Diagnostic::where('user_id', $id)->delete();
    AnnualDiagnostic::where('user_id', $id)->delete();
    $user->delete();
});

echo "Suppression terminée: user=$id | quick=$quickCount | annual=$annualCount\n";
