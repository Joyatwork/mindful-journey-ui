<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AppointmentController extends Controller
{
    /**
     * Liste des rendez-vous de l'utilisateur
     */
    public function index(Request $request): JsonResponse
    {
        // Pour l'instant, retourner des données mockées
        // Plus tard, vous pourrez remplacer par des données de base de données
        $appointments = [
            [
                'id' => '1',
                'specialistName' => 'Dr. Marie Dubois',
                'specialty' => 'Psychologue clinicienne',
                'date' => '2024-08-15',
                'time' => '14:30',
                'type' => 'video',
                'status' => 'confirmed',
                'price' => '80€',
                'notes' => 'Première consultation'
            ],
            [
                'id' => '2',
                'specialistName' => 'Dr. Pierre Martin',
                'specialty' => 'Médecin généraliste',
                'date' => '2024-08-18',
                'time' => '09:00',
                'type' => 'inPerson',
                'status' => 'pending',
                'price' => '50€',
                'notes' => 'Suivi de routine'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    /**
     * Créer un nouveau rendez-vous
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'specialistName' => 'required|string',
            'specialty' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'type' => 'required|in:video,inPerson,phone',
            'price' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // Simuler la création d'un rendez-vous
        $appointment = array_merge($validated, [
            'id' => (string) time(),
            'status' => 'confirmed',
            'user_id' => $request->user() ? $request->user()->id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous créé avec succès',
            'data' => $appointment
        ], 201);
    }

    /**
     * Afficher un rendez-vous spécifique
     */
    public function show(string $id): JsonResponse
    {
        // Simulation - remplacer par une vraie requête DB
        $appointment = [
            'id' => $id,
            'specialistName' => 'Dr. Marie Dubois',
            'specialty' => 'Psychologue clinicienne',
            'date' => '2024-08-15',
            'time' => '14:30',
            'type' => 'video',
            'status' => 'confirmed',
            'price' => '80€',
            'notes' => 'Première consultation'
        ];

        return response()->json([
            'success' => true,
            'data' => $appointment
        ]);
    }

    /**
     * Modifier un rendez-vous
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'time' => 'sometimes|string',
            'type' => 'sometimes|in:video,inPerson,phone',
            'notes' => 'nullable|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous mis à jour avec succès',
            'data' => array_merge(['id' => $id], $validated)
        ]);
    }

    /**
     * Supprimer un rendez-vous
     */
    public function destroy(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous supprimé avec succès'
        ]);
    }

    /**
     * Annuler un rendez-vous
     */
    public function cancel(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous annulé avec succès',
            'data' => [
                'id' => $id,
                'status' => 'cancelled'
            ]
        ]);
    }
}
