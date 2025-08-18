<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DiagnosticController extends Controller
{
    /**
     * Obtenir le diagnostic de l'utilisateur
     */
    public function show(): JsonResponse
    {
        // Données mockées du diagnostic
        $diagnostic = [
            'id' => 1,
            'stress_level' => 6,
            'energy_level' => 4,
            'work_pressure' => 'Souvent, je ressens une pression constante',
            'completed_at' => '2024-08-01',
            'recommendations' => [
                'Méditation quotidienne recommandée',
                'Exercices de respiration en cas de stress',
                'Consultation avec un spécialiste suggérée'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $diagnostic
        ]);
    }

    /**
     * Sauvegarder un diagnostic
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stress_level' => 'required|integer|between:1,10',
            'energy_level' => 'required|integer|between:1,10',
            'work_pressure' => 'required|string',
            'answers' => 'nullable|array'
        ]);

        $diagnostic = array_merge($validated, [
            'id' => time(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'completed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Diagnostic sauvegardé avec succès',
            'data' => $diagnostic
        ], 201);
    }
}
