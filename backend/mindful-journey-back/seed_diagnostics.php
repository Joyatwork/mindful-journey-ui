<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Diagnostic;

$users = User::limit(3)->get();
if ($users->isEmpty()) {
    echo "No users found. Create a user first.\n";
    exit(0);
}

foreach ($users as $u) {
    echo "Seeding diagnostics for user {$u->id} ({$u->email})...\n";
    for ($i=6; $i>=0; $i--) {
        $date = now()->subDays($i)->setTime(rand(8, 20), rand(0,59));
        Diagnostic::updateOrCreate([
            'user_id' => $u->id,
            'completed_at' => $date,
        ],[
            'stress_level' => rand(2,9),
            'energy_level' => rand(2,9),
            'work_pressure' => ['faible','modérée','élevée'][rand(0,2)],
            'answers' => [
                'mood_emoji' => ['😞','☹️','😐','🙂','😊','😄'][rand(0,5)],
                'sleep_quality' => ['très mauvais','difficile','moyen','bon','excellent'][rand(0,4)],
            ],
        ]);
    }
}

echo "Done.\n";
