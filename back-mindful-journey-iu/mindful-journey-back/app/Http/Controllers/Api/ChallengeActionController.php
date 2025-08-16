<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChallengeActionController extends Controller
{
    /**
     * Démarrer un défi pour l'utilisateur connecté.
     * - Idempotent : si déjà en cours, on renvoie l'état courant.
     * - Si déjà terminé, on bloque (à adapter si tu veux autoriser un “restart”).
     */
    public function start(Request $request, Challenge $challenge)
    {
        $user = $request->user();

        // Cherche une participation existante
        $existing = $user->challenges()->where('challenge_id', $challenge->id)->first();

        if ($existing) {
            // Déjà en cours (completed_at null)
            if (is_null($existing->pivot->completed_at)) {
                return response()->json([
                    'message' => 'Défi déjà démarré.',
                    'status'  => 'in_progress',
                ], 200);
            }

            // Déjà terminé
            throw ValidationException::withMessages([
                'challenge' => 'Défi déjà terminé.',
            ]);
        }

        // Attache une nouvelle participation “en cours”
        $user->challenges()->attach($challenge->id, [
            'completed_at' => null,
        ]);

        return response()->json([
            'message' => 'Défi démarré.',
            'status'  => 'in_progress',
        ], 201);
    }

    /**
     * Terminer un défi pour l'utilisateur connecté.
     * - Nécessite qu'il ait été démarré avant.
     * - Idempotent : si déjà terminé, renvoie l'état courant.
     */
    public function finish(Request $request, Challenge $challenge)
    {
        $user = $request->user();

        $pivot = $user->challenges()->where('challenge_id', $challenge->id)->first()?->pivot;

        // Pas de participation → pas commencé
        if (!$pivot) {
            throw ValidationException::withMessages([
                'challenge' => 'Commence d’abord le défi.',
            ]);
        }

        // Déjà terminé → idempotent
        if (!is_null($pivot->completed_at)) {
            return response()->json([
                'message'      => 'Défi déjà terminé.',
                'status'       => 'finished',
                'completed_at' => $pivot->completed_at,
            ], 200);
        }

        // Marque terminé
        $user->challenges()->updateExistingPivot($challenge->id, [
            'completed_at' => now(),
        ]);

        return response()->json([
            'message'      => 'Bravo, défi terminé !',
            'status'       => 'finished',
            'completed_at' => now(),
        ], 200);
    }
}
