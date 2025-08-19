<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Diagnostic;

class DiagnosticController extends Controller
{
    /**
     * Obtenir le diagnostic de l'utilisateur
     */
    public function show(): JsonResponse
    {
        $user = request()->user();
        $diagnostic = $user ? Diagnostic::where('user_id', $user->id)->latest('completed_at')->first() : null;
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
        $user = $request->user();
        $record = Diagnostic::create([
            'user_id' => $user ? $user->id : null,
            'stress_level' => $validated['stress_level'],
            'energy_level' => $validated['energy_level'],
            'work_pressure' => $validated['work_pressure'],
            'answers' => $validated['answers'] ?? null,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Diagnostic sauvegardé avec succès',
            'data' => $record
        ], 201);
    }
}
