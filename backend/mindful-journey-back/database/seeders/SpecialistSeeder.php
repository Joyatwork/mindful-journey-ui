<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialist;

class SpecialistSeeder extends Seeder
{
    public function run(): void
    {
        if (Specialist::query()->count() > 0) return;

        $data = [
            [
                'name' => 'Dr. Marie Dubois',
                'specialty' => 'Psychologue clinicienne',
                'rating' => 4.9,
                'experience_years' => 12,
                'price_cents' => 8000,
                'availability' => 'Disponible cette semaine',
                'consultation_type' => 'both',
                'description' => "Spécialisée dans la gestion du stress et de l'anxiété",
                'location' => 'Paris 8ème',
                'education' => ['Doctorat en Psychologie - Sorbonne', 'Master en Thérapies Cognitives'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 127,
            ],
            [
                'name' => 'Dr. Pierre Martin',
                'specialty' => 'Médecin généraliste',
                'rating' => 4.7,
                'experience_years' => 15,
                'price_cents' => 5000,
                'availability' => 'Disponible demain',
                'consultation_type' => 'both',
                'description' => 'Expert en médecine préventive et troubles du sommeil',
                'location' => 'Lyon 2ème',
                'education' => ['Doctorat en Médecine - Université Lyon 1'],
                'languages' => ['Français'],
                'review_count' => 89,
            ],
            [
                'name' => 'Dr. Sophie Laurent',
                'specialty' => 'Psychiatre',
                'rating' => 4.8,
                'experience_years' => 10,
                'price_cents' => 12000,
                'availability' => 'Disponible dans 3 jours',
                'consultation_type' => 'video',
                'description' => 'Spécialisée en thérapies comportementales et cognitives',
                'location' => 'Consultation en ligne',
                'education' => ['Spécialisation en Psychiatrie - CHU Pitié-Salpêtrière'],
                'languages' => ['Français', 'Anglais', 'Espagnol'],
                'review_count' => 156,
            ],
        ];

        foreach ($data as $d) {
            Specialist::create($d);
        }
    }
}
