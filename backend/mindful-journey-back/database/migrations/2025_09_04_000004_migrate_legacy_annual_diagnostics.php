<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Migrer les anciens enregistrements avec scope = 'annual' depuis diagnostics -> annual_diagnostics
        if (!Schema::hasTable('diagnostics') || !Schema::hasTable('annual_diagnostics')) {
            return; // sécurité
        }

        DB::transaction(function () {
            DB::table('diagnostics')
                ->where('scope', 'annual')
                ->orderBy('id')
                ->chunkById(200, function ($rows) {
                    foreach ($rows as $row) {
                        $answers = json_decode($row->answers ?? '[]', true) ?: [];

                        // Extraire info démographique potentielle
                        $gender     = $answers['gender'] ?? $answers['genre'] ?? null;
                        $ageGroup   = $answers['age_group'] ?? $answers['age'] ?? null;
                        $department = $answers['department'] ?? $answers['departement'] ?? null;

                        // Empêcher les doublons (même user + completed_at)
                        $exists = DB::table('annual_diagnostics')
                            ->where('user_id', $row->user_id)
                            ->where('completed_at', $row->completed_at)
                            ->exists();
                        if ($exists) {
                            continue;
                        }

                        DB::table('annual_diagnostics')->insert([
                            'user_id'       => $row->user_id,
                            'gender'        => $gender,
                            'age_group'     => $ageGroup,
                            'department'    => $department,
                            'stress_level'  => $row->stress_level ?? ($answers['stress_level'] ?? 5),
                            'energy_level'  => $row->energy_level ?? ($answers['energy_level'] ?? 5),
                            'work_pressure' => $row->work_pressure ?? ($answers['work_pressure'] ?? 'Non précisé'),
                            'answers'       => json_encode($answers, JSON_UNESCAPED_UNICODE),
                            'completed_at'  => $row->completed_at,
                            'created_at'    => now(),
                            'updated_at'    => now(),
                        ]);
                    }
                });

            // Suppression des anciens enregistrements annuels dans diagnostics
            DB::table('diagnostics')->where('scope', 'annual')->delete();
        });
    }

    public function down(): void
    {
        // Pas de restauration (one-way). Si nécessaire, on pourrait réinsérer dans diagnostics.
    }
};
