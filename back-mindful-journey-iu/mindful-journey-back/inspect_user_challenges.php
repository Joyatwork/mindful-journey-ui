<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Challenge;

$email = $argv[1] ?? 'test.recommendations@example.com';

$user = User::where('email', $email)->first();
if (!$user) {
    echo "User not found for email: $email\n";
    exit(1);
}

echo "User: {$user->id} - {$user->name} <{$user->email}>\n";

$totalChallenges = DB::table('challenges')->count();
$userTotal = DB::table('challenge_user')->where('user_id', $user->id)->count();
$userFinished = DB::table('challenge_user')
    ->where('user_id', $user->id)
    ->whereNotNull('completed_at')
    ->count();
$userInProgress = $userTotal - $userFinished;
$userDistinct = DB::table('challenge_user')
    ->where('user_id', $user->id)
    ->distinct()
    ->count('challenge_id');

echo "Totals -> challenges_available={$totalChallenges}, user_entries={$userTotal}, finished={$userFinished}, in_progress={$userInProgress}, distinct_challenges={$userDistinct}\n";

$rows = DB::table('challenge_user')
    ->join('challenges', 'challenge_user.challenge_id', '=', 'challenges.id')
    ->select(
        'challenge_user.id',
        'challenges.title as challenge',
        'challenges.type',
        'challenge_user.user_id',
        'challenge_user.created_at',
        'challenge_user.updated_at',
        'challenge_user.completed_at'
    )
    ->where('challenge_user.user_id', $user->id)
    ->orderByDesc('challenge_user.id')
    ->limit(20)
    ->get();

if ($rows->isEmpty()) {
    echo "No challenge entries found for this user.\n";
    echo "Recent entries across all users (latest 10):\n";
    $all = DB::table('challenge_user')
        ->join('users', 'challenge_user.user_id', '=', 'users.id')
        ->join('challenges', 'challenge_user.challenge_id', '=', 'challenges.id')
        ->select(
            'challenge_user.id',
            'users.email',
            'challenges.title as challenge',
            'challenges.type',
            'challenge_user.created_at',
            'challenge_user.completed_at'
        )
        ->orderByDesc('challenge_user.id')
        ->limit(10)
        ->get();
    if ($all->isEmpty()) {
        echo "(challenge_user table is empty)\n";
        exit(0);
    }
    foreach ($all as $r) {
        $status = $r->completed_at ? 'finished' : 'in_progress';
        echo "#{$r->id} | {$r->email} | {$r->challenge} [{$r->type}] | status={$status} | created_at={$r->created_at} | completed_at=" . ($r->completed_at ?? 'null') . "\n";
    }
    exit(0);
}

foreach ($rows as $r) {
    $status = $r->completed_at ? 'finished' : 'in_progress';
    echo "#{$r->id} | {$r->challenge} [{$r->type}] | status={$status} | created_at={$r->created_at} | completed_at=" . ($r->completed_at ?? 'null') . "\n";
}
