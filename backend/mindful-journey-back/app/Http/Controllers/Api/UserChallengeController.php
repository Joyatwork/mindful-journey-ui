<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserChallenge;
use App\Models\Challenge;

class UserChallengeController extends Controller
{
    // Enregistrer un défi réalisé
    public function store(Request $request)
    {
        $request->validate([
            'challenge_id' => 'required|exists:challenges,id',
        ]);

        $user = Auth::user();
        $challengeId = $request->challenge_id;

        // Empêcher la duplication
        $exists = UserChallenge::where('user_id', $user->id)
            ->where('challenge_id', $challengeId)
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'Défi déjà effectué'], 409);
        }

        $userChallenge = UserChallenge::create([
            'user_id' => $user->id,
            'challenge_id' => $challengeId,
            'completed_at' => now(),
        ]);

        return response()->json(['message' => 'Défi enregistré', 'user_challenge' => $userChallenge]);
    }

    // Récupérer les défis réalisés
    public function index()
    {
        $user = Auth::user();
        $userChallenges = UserChallenge::with('challenge')
            ->where('user_id', $user->id)
            ->get();

        return response()->json(['user_challenges' => $userChallenges]);
    }
}
