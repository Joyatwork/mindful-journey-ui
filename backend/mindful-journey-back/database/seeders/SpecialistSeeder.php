<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialist;

class SpecialistSeeder extends Seeder
{
    public function run(): void
    {
    // Idempotent seeding: upsert by unique (name, specialty)

        $data = [
            // Psychologues
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
                'name' => 'Dr. Clara Fournier',
                'specialty' => 'Psychologue clinicienne',
                'rating' => 4.8,
                'experience_years' => 9,
                'price_cents' => 7500,
                'availability' => 'Disponible demain',
                'consultation_type' => 'video',
                'description' => 'Approche TCC, gestion des émotions et burn-out',
                'location' => 'Consultation en ligne',
                'education' => ['Master Psychologie Clinique - Paris Descartes'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 98,
            ],

            // Psychiatres
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
            [
                'name' => 'Dr. Alain Bernard',
                'specialty' => 'Psychiatre',
                'rating' => 4.6,
                'experience_years' => 18,
                'price_cents' => 13000,
                'availability' => 'Disponible la semaine prochaine',
                'consultation_type' => 'inPerson',
                'description' => 'Troubles de l’humeur et anxiété sévère',
                'location' => 'Marseille 6ème',
                'education' => ['DES Psychiatrie - Aix-Marseille'],
                'languages' => ['Français', 'Italien'],
                'review_count' => 112,
            ],

            // Médecins généralistes
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
                'name' => 'Dr. Nadia Benali',
                'specialty' => 'Médecin généraliste',
                'rating' => 4.5,
                'experience_years' => 7,
                'price_cents' => 4500,
                'availability' => 'Disponible aujourd’hui',
                'consultation_type' => 'both',
                'description' => 'Prévention, vaccinations et suivi des maladies chroniques',
                'location' => 'Toulouse Centre',
                'education' => ['Doctorat en Médecine - Toulouse III'],
                'languages' => ['Français', 'Arabe'],
                'review_count' => 64,
            ],

            // Nutrition / Diététique
            [
                'name' => 'Camille Leroy',
                'specialty' => 'Nutritionniste',
                'rating' => 4.7,
                'experience_years' => 8,
                'price_cents' => 6000,
                'availability' => 'Disponible cette semaine',
                'consultation_type' => 'video',
                'description' => 'Rééquilibrage alimentaire et nutrition sportive',
                'location' => 'Consultation en ligne',
                'education' => ['Master Nutrition Humaine - AgroParisTech'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 73,
            ],
            [
                'name' => 'Julie Morel',
                'specialty' => 'Diététicienne',
                'rating' => 4.6,
                'experience_years' => 6,
                'price_cents' => 5500,
                'availability' => 'Disponible vendredi',
                'consultation_type' => 'both',
                'description' => 'Perte de poids durable et TCA légers',
                'location' => 'Nantes',
                'education' => ['BTS Diététique'],
                'languages' => ['Français'],
                'review_count' => 58,
            ],

            // Kinésithérapeutes
            [
                'name' => 'Thomas Renaud',
                'specialty' => 'Kinésithérapeute',
                'rating' => 4.5,
                'experience_years' => 11,
                'price_cents' => 5000,
                'availability' => 'Disponible mardi',
                'consultation_type' => 'inPerson',
                'description' => 'Rééducation posture et douleurs lombaires',
                'location' => 'Bordeaux Chartrons',
                'education' => ['DE Masso-kinésithérapie'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 91,
            ],
            [
                'name' => 'Elisa Caron',
                'specialty' => 'Kinésithérapeute',
                'rating' => 4.4,
                'experience_years' => 5,
                'price_cents' => 4800,
                'availability' => 'Disponible la semaine prochaine',
                'consultation_type' => 'both',
                'description' => 'Rééducation sportive et renforcement musculaire',
                'location' => 'Lille Centre',
                'education' => ['DE Masso-kinésithérapie'],
                'languages' => ['Français'],
                'review_count' => 40,
            ],

            // Ostéopathes
            [
                'name' => 'Paul Chevalier',
                'specialty' => 'Ostéopathe',
                'rating' => 4.7,
                'experience_years' => 9,
                'price_cents' => 6500,
                'availability' => 'Disponible jeudi',
                'consultation_type' => 'inPerson',
                'description' => 'Maux de dos, cervicalgies et migraines',
                'location' => 'Paris 15ème',
                'education' => ['DO - École d’ostéopathie de Paris'],
                'languages' => ['Français'],
                'review_count' => 77,
            ],
            [
                'name' => 'Anaïs Petit',
                'specialty' => 'Ostéopathe',
                'rating' => 4.6,
                'experience_years' => 7,
                'price_cents' => 6200,
                'availability' => 'Disponible lundi',
                'consultation_type' => 'both',
                'description' => 'Ostéopathie périnatale et troubles musculosquelettiques',
                'location' => 'Rennes',
                'education' => ['DO - Rennes'],
                'languages' => ['Français'],
                'review_count' => 52,
            ],

            // Sexologue / Addictologue
            [
                'name' => 'Dr. Laura Girard',
                'specialty' => 'Sexologue',
                'rating' => 4.5,
                'experience_years' => 8,
                'price_cents' => 9000,
                'availability' => 'Disponible cette semaine',
                'consultation_type' => 'video',
                'description' => 'Santé sexuelle, couple et troubles du désir',
                'location' => 'Consultation en ligne',
                'education' => ['Diplôme Universitaire de Sexologie'],
                'languages' => ['Français'],
                'review_count' => 63,
            ],
            [
                'name' => 'Dr. Marc Delorme',
                'specialty' => 'Addictologue',
                'rating' => 4.6,
                'experience_years' => 13,
                'price_cents' => 9500,
                'availability' => 'Disponible mercredi',
                'consultation_type' => 'both',
                'description' => 'Addictions comportementales et substances',
                'location' => 'Montpellier',
                'education' => ['DES Médecine, Spécialisation Addictologie'],
                'languages' => ['Français'],
                'review_count' => 70,
            ],

            // Pédiatre
            [
                'name' => 'Dr. Emmanuelle Rey',
                'specialty' => 'Pédiatre',
                'rating' => 4.8,
                'experience_years' => 14,
                'price_cents' => 7000,
                'availability' => 'Disponible vendredi',
                'consultation_type' => 'both',
                'description' => 'Suivi enfant et adolescent, sommeil et anxiété',
                'location' => 'Nice',
                'education' => ['DES Pédiatrie - Nice'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 88,
            ],

            // Cardiologue
            [
                'name' => 'Dr. Julien Robert',
                'specialty' => 'Cardiologue',
                'rating' => 4.7,
                'experience_years' => 16,
                'price_cents' => 12000,
                'availability' => 'Disponible mardi',
                'consultation_type' => 'inPerson',
                'description' => 'Prévention cardiovasculaire et réadaptation',
                'location' => 'Paris 12ème',
                'education' => ['DES Cardiologie - Paris'],
                'languages' => ['Français'],
                'review_count' => 101,
            ],

            // Dermatologue
            [
                'name' => 'Dr. Aline Lefèvre',
                'specialty' => 'Dermatologue',
                'rating' => 4.6,
                'experience_years' => 10,
                'price_cents' => 10000,
                'availability' => 'Disponible jeudi',
                'consultation_type' => 'both',
                'description' => 'Dermatologie médicale et esthétique',
                'location' => 'Strasbourg',
                'education' => ['DES Dermatologie'],
                'languages' => ['Français', 'Allemand'],
                'review_count' => 67,
            ],

            // Rhumatologue
            [
                'name' => 'Dr. Patrick Millet',
                'specialty' => 'Rhumatologue',
                'rating' => 4.5,
                'experience_years' => 20,
                'price_cents' => 11000,
                'availability' => 'Disponible lundi',
                'consultation_type' => 'inPerson',
                'description' => 'Douleurs articulaires et maladies inflammatoires',
                'location' => 'Grenoble',
                'education' => ['DES Rhumatologie'],
                'languages' => ['Français'],
                'review_count' => 59,
            ],

            // ORL
            [
                'name' => 'Dr. Hélène Marchal',
                'specialty' => 'ORL',
                'rating' => 4.4,
                'experience_years' => 8,
                'price_cents' => 9500,
                'availability' => 'Disponible mercredi',
                'consultation_type' => 'both',
                'description' => 'Troubles ORL, apnées du sommeil',
                'location' => 'Dijon',
                'education' => ['DES ORL'],
                'languages' => ['Français'],
                'review_count' => 42,
            ],

            // Ophtalmologue
            [
                'name' => 'Dr. Xavier Colin',
                'specialty' => 'Ophtalmologue',
                'rating' => 4.6,
                'experience_years' => 12,
                'price_cents' => 11500,
                'availability' => 'Disponible la semaine prochaine',
                'consultation_type' => 'inPerson',
                'description' => 'Bilan visuel et fatigue oculaire',
                'location' => 'Rennes',
                'education' => ['DES Ophtalmologie'],
                'languages' => ['Français'],
                'review_count' => 74,
            ],

            // Sage-femme
            [
                'name' => 'Claire Dubreuil',
                'specialty' => 'Sage-femme',
                'rating' => 4.8,
                'experience_years' => 9,
                'price_cents' => 6500,
                'availability' => 'Disponible demain',
                'consultation_type' => 'both',
                'description' => 'Suivi périnatal et rééducation périnéale',
                'location' => 'Brest',
                'education' => ['Diplôme d’État de Sage-femme'],
                'languages' => ['Français'],
                'review_count' => 85,
            ],

            // Endocrinologue
            [
                'name' => 'Dr. Ahmed Kaci',
                'specialty' => 'Endocrinologue',
                'rating' => 4.5,
                'experience_years' => 11,
                'price_cents' => 12000,
                'availability' => 'Disponible vendredi',
                'consultation_type' => 'both',
                'description' => 'Thyroïde, diabète et troubles hormonaux',
                'location' => 'Lille',
                'education' => ['DES Endocrinologie'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 69,
            ],

            // Gastro-entérologue
            [
                'name' => 'Dr. Isabelle Perrot',
                'specialty' => 'Gastro-entérologue',
                'rating' => 4.6,
                'experience_years' => 13,
                'price_cents' => 11500,
                'availability' => 'Disponible mardi',
                'consultation_type' => 'inPerson',
                'description' => 'Troubles digestifs et MICI',
                'location' => 'Tours',
                'education' => ['DES Gastro-entérologie'],
                'languages' => ['Français'],
                'review_count' => 71,
            ],

            // Gynécologue
            [
                'name' => 'Dr. Fatou Diop',
                'specialty' => 'Gynécologue',
                'rating' => 4.7,
                'experience_years' => 10,
                'price_cents' => 11000,
                'availability' => 'Disponible la semaine prochaine',
                'consultation_type' => 'both',
                'description' => 'Santé de la femme, suivi gynécologique',
                'location' => 'Paris 19ème',
                'education' => ['DES Gynécologie'],
                'languages' => ['Français', 'Anglais'],
                'review_count' => 92,
            ],

            // Coach / Sophrologue / Thérapie
            [
                'name' => 'Maëlle Vincent',
                'specialty' => 'Coach bien-être',
                'rating' => 4.4,
                'experience_years' => 6,
                'price_cents' => 5000,
                'availability' => 'Disponible cette semaine',
                'consultation_type' => 'video',
                'description' => 'Gestion du stress, objectifs de vie et routines saines',
                'location' => 'Consultation en ligne',
                'education' => ['Certification Coach ICF'],
                'languages' => ['Français'],
                'review_count' => 54,
            ],
            [
                'name' => 'Sonia Gauthier',
                'specialty' => 'Sophrologue',
                'rating' => 4.5,
                'experience_years' => 8,
                'price_cents' => 5200,
                'availability' => 'Disponible jeudi',
                'consultation_type' => 'both',
                'description' => 'Relaxation dynamique, respiration et sommeil',
                'location' => 'Rouen',
                'education' => ['Certificat de Sophrologie'],
                'languages' => ['Français'],
                'review_count' => 60,
            ],
        ];

        foreach ($data as $d) {
            Specialist::updateOrCreate(
                ['name' => $d['name'], 'specialty' => $d['specialty']],
                $d
            );
        }
    }
}
