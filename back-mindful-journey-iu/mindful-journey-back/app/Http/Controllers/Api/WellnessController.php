<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WellnessController extends Controller
{
    /**
     * Obtenir les activités wellness
     */
    public function getActivities(): JsonResponse
    {
        $activities = [
            [
                'id' => 1,
                'title' => 'Méditation guidée',
                'description' => 'Séance de relaxation pour réduire le stress',
                'duration' => '10 min',
                'difficulty' => 'Facile',
                'category' => 'Mindfulness',
                'type' => 'meditation'
            ],
            [
                'id' => 2, 
                'title' => 'Exercices de respiration',
                'description' => 'Techniques de respiration pour gérer l\'anxiété',
                'duration' => '5 min',
                'difficulty' => 'Facile',
                'category' => 'Gestion du stress',
                'type' => 'breathing'
            ],
            [
                'id' => 3,
                'title' => 'Routine sommeil',
                'description' => 'Améliorez la qualité de votre sommeil',
                'duration' => '15 min',
                'difficulty' => 'Moyen',
                'category' => 'Sommeil',
                'type' => 'sleep'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Enregistrer une activité complétée
     */
    public function logActivity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => 'required|integer',
            'duration' => 'required|integer',
            'completion_rate' => 'nullable|integer|between:0,100',
            'notes' => 'nullable|string|max:500'
        ]);

        $activityLog = array_merge($validated, [
            'id' => time(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'completed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Activité enregistrée avec succès',
            'data' => $activityLog
        ], 201);
    }

    /**
     * Obtenir le progrès wellness
     */
    public function getProgress(): JsonResponse
    {
        $progress = [
            'totalActivities' => 28,
            'weeklyGoal' => 5,
            'weeklyCompleted' => 3,
            'favoriteActivity' => 'Méditation guidée',
            'totalMinutes' => 420,
            'streak' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $progress
        ]);
    }
}
