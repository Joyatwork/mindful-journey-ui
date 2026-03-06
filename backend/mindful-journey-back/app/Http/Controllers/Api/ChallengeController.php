<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    /**
     * Liste tous les défis avec leur statut pour l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $challenges = Challenge::query()
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($c) use ($user) {
                $pivot = $c->users()->where('user_id', $user->id)->first()?->pivot;

                // Déterminer le statut
                $status = 'not_started';
                if ($pivot) {
                    $status = $pivot->completed_at ? 'finished' : 'in_progress';
                }

                return [
                    'id' => $c->id,
                    'title' => $c->title,
                    'description' => $c->description,
                    'duration_minutes' => $c->duration_minutes ?? 10,
                    'difficulty' => $c->difficulty ?? 'easy',
                    'category' => $c->category ?? 'Bien-être',
                    'status' => $status,
                    'completed_at' => $pivot?->completed_at,
                ];
            });

        return response()->json([
            'data' => $challenges
        ]);
    }
}
