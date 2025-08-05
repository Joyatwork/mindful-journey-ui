<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SpecialistController extends Controller
{
    /**
     * Liste des spécialistes avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        // Données mockées des spécialistes
        $specialists = [
            [
                'id' => '1',
                'name' => 'Dr. Marie Dubois',
                'specialty' => 'Psychologue clinicienne',
                'rating' => 4.9,
                'experience' => '12 ans',
                'price' => '80€',
                'availability' => 'Disponible cette semaine',
                'consultationType' => 'both',
                'description' => 'Spécialisée dans la gestion du stress et de l\'anxiété',
                'location' => 'Paris 8ème',
                'image' => null,
                'education' => ['Doctorat en Psychologie - Sorbonne', 'Master en Thérapies Cognitives'],
                'languages' => ['Français', 'Anglais'],
                'reviewCount' => 127
            ],
            [
                'id' => '2',
                'name' => 'Dr. Pierre Martin',
                'specialty' => 'Médecin généraliste',
                'rating' => 4.7,
                'experience' => '15 ans',
                'price' => '50€',
                'availability' => 'Disponible demain',
                'consultationType' => 'both',
                'description' => 'Expert en médecine préventive et troubles du sommeil',
                'location' => 'Lyon 2ème',
                'image' => null,
                'education' => ['Doctorat en Médecine - Université Lyon 1'],
                'languages' => ['Français'],
                'reviewCount' => 89
            ],
            [
                'id' => '3',
                'name' => 'Dr. Sophie Laurent',
                'specialty' => 'Psychiatre',
                'rating' => 4.8,
                'experience' => '10 ans',
                'price' => '120€',
                'availability' => 'Disponible dans 3 jours',
                'consultationType' => 'video',
                'description' => 'Spécialisée en thérapies comportementales et cognitives',
                'location' => 'Consultation en ligne',
                'image' => null,
                'education' => ['Spécialisation en Psychiatrie - CHU Pitié-Salpêtrière'],
                'languages' => ['Français', 'Anglais', 'Espagnol'],
                'reviewCount' => 156
            ]
        ];

        // Appliquer les filtres si fournis
        $specialty = $request->get('specialty');
        $consultationType = $request->get('consultationType');
        $search = $request->get('search');

        if ($specialty && $specialty !== 'all') {
            $specialists = array_filter($specialists, function($specialist) use ($specialty) {
                return $specialist['specialty'] === $specialty;
            });
        }

        if ($consultationType && $consultationType !== 'all') {
            $specialists = array_filter($specialists, function($specialist) use ($consultationType) {
                return $specialist['consultationType'] === $consultationType || 
                       $specialist['consultationType'] === 'both';
            });
        }

        if ($search) {
            $specialists = array_filter($specialists, function($specialist) use ($search) {
                return stripos($specialist['name'], $search) !== false ||
                       stripos($specialist['specialty'], $search) !== false ||
                       stripos($specialist['description'], $search) !== false;
            });
        }

        return response()->json([
            'success' => true,
            'data' => array_values($specialists)
        ]);
    }

    /**
     * Afficher un spécialiste spécifique
     */
    public function show(string $id): JsonResponse
    {
        // Simuler la récupération d'un spécialiste par ID
        $specialist = [
            'id' => $id,
            'name' => 'Dr. Marie Dubois',
            'specialty' => 'Psychologue clinicienne',
            'rating' => 4.9,
            'experience' => '12 ans',
            'price' => '80€',
            'availability' => 'Disponible cette semaine',
            'consultationType' => 'both',
            'description' => 'Spécialisée dans la gestion du stress et de l\'anxiété avec plus de 12 ans d\'expérience.',
            'location' => 'Paris 8ème',
            'image' => null,
            'education' => [
                'Doctorat en Psychologie - Université Sorbonne',
                'Master en Thérapies Cognitives et Comportementales',
                'Certification en Mindfulness - Institut Mindful Schools'
            ],
            'languages' => ['Français', 'Anglais'],
            'reviewCount' => 127,
            'nextAvailable' => '2024-08-15',
            'reason' => 'Recommandée pour la gestion du stress et de l\'anxiété'
        ];

        return response()->json([
            'success' => true,
            'data' => $specialist
        ]);
    }

    /**
     * Rechercher des spécialistes
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        // Simuler une recherche
        $allSpecialists = $this->index($request)->getData()->data;
        
        $results = array_filter($allSpecialists, function($specialist) use ($query) {
            return stripos($specialist->name, $query) !== false ||
                   stripos($specialist->specialty, $query) !== false ||
                   stripos($specialist->description, $query) !== false;
        });

        return response()->json([
            'success' => true,
            'data' => array_values($results),
            'query' => $query
        ]);
    }

    /**
     * Liste publique des spécialistes (sans authentification)
     */
    public function publicIndex(): JsonResponse
    {
        return $this->index(new Request());
    }
}
