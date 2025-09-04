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
        if (!$user) {
            return response()->json([
                'success' => true,
                'data' => null
            ]);
        }

        $scope = request()->query('scope'); // 'quick' | 'annual' | null

        if ($scope) {
                if ($scope === 'annual') {
                    $annual = \App\Models\AnnualDiagnostic::where('user_id', $user->id)->latest('completed_at')->first();
                    return response()->json(['success' => true,'data' => $annual,'scope' => 'annual','source' => 'annual_diagnostics']);
                }
                $diagnostic = Diagnostic::where('user_id', $user->id)->where('scope', $scope)->latest('completed_at')->first();
                return response()->json(['success' => true,'data' => $diagnostic,'scope' => $scope]);
        }

        // Par défaut: renvoyer les deux derniers (quick & annual) distincts
        $latestQuick = Diagnostic::where('user_id', $user->id)
            ->where('scope', 'quick')
            ->latest('completed_at')
            ->first();
        $latestAnnual = Diagnostic::where('user_id', $user->id)
            ->where('scope', 'annual')
            ->latest('completed_at')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'quick' => $latestQuick,
                'annual' => $latestAnnual
            ]
        ]);
    }

    /**
     * Sauvegarder un diagnostic
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scope' => 'nullable|string|in:quick,annual',
            'stress_level' => 'required|integer|between:1,10',
            'energy_level' => 'required|integer|between:1,10',
            'work_pressure' => 'required|string',
            'answers' => 'nullable|array'
        ]);
        $user = $request->user();
        $scope = $validated['scope'] ?? 'quick';

        // Règle optionnelle: on pourrait empêcher >1 annuel / 11 mois, non appliquée ici (TODO)

        $record = Diagnostic::create([
            'user_id' => $user ? $user->id : null,
            'scope' => $scope,
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
