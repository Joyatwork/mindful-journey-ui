<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HealthDataController extends Controller
{
    /**
     * Obtenir les données d'humeur
     */
    public function getMoodData(Request $request): JsonResponse
    {
        $period = $request->get('period', 'week');

        // Données mockées pour l'humeur
        $moodData = [
            ['date' => '2024-08-01', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 5],
            ['date' => '2024-08-02', 'mood' => 3, 'stress' => 4, 'energy' => 3, 'sleep' => 4],
            ['date' => '2024-08-03', 'mood' => 5, 'stress' => 2, 'energy' => 5, 'sleep' => 4],
            ['date' => '2024-08-04', 'mood' => 4, 'stress' => 2, 'energy' => 4, 'sleep' => 5],
            ['date' => '2024-08-05', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 4],
        ];

        return response()->json([
            'success' => true,
            'data' => $moodData,
            'period' => $period
        ]);
    }

    /**
     * Sauvegarder les données d'humeur
     */
    public function saveMoodData(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mood' => 'required|integer|between:1,5',
            'stress' => 'nullable|integer|between:1,5',
            'energy' => 'nullable|integer|between:1,5',
            'sleep' => 'nullable|integer|between:1,5',
            'notes' => 'nullable|string|max:500',
            'date' => 'nullable|date'
        ]);

        // Simuler la sauvegarde
        $moodEntry = array_merge($validated, [
            'id' => time(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'date' => $validated['date'] ?? now()->toDateString(),
            'created_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Données d\'humeur sauvegardées avec succès',
            'data' => $moodEntry
        ], 201);
    }

    /**
     * Obtenir les données de progression
     */
    public function getProgressData(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');

        // Données mockées de progression
        $progressData = [
            'totalSessions' => 45,
            'streakDays' => 7,
            'totalMinutes' => 320,
            'weeklyProgress' => [
                ['date' => 'Lun', 'mood' => 3, 'stress' => 4, 'energy' => 3, 'sleep' => 4],
                ['date' => 'Mar', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 3],
                ['date' => 'Mer', 'mood' => 3, 'stress' => 5, 'energy' => 2, 'sleep' => 4],
                ['date' => 'Jeu', 'mood' => 4, 'stress' => 2, 'energy' => 4, 'sleep' => 5],
                ['date' => 'Ven', 'mood' => 5, 'stress' => 2, 'energy' => 5, 'sleep' => 4],
                ['date' => 'Sam', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 5],
                ['date' => 'Dim', 'mood' => 4, 'stress' => 2, 'energy' => 4, 'sleep' => 4],
            ],
            'achievements' => [
                ['name' => 'Premier pas', 'description' => 'Première séance complétée', 'earned' => true],
                ['name' => 'Semaine zen', 'description' => '7 jours consécutifs', 'earned' => true],
                ['name' => 'Maître de la méditation', 'description' => '50 séances complétées', 'earned' => false],
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $progressData,
            'period' => $period
        ]);
    }
}
