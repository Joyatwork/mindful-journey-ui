<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HrCommunication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CommunicationController extends Controller
{
    /**
     * Récupère toutes les communications publiées pour l'entreprise de l'utilisateur
     */
    public function index(Request $request): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Récupérer les communications publiées de l'entreprise de l'utilisateur
            $communications = HrCommunication::where('entreprise_id', $user->entreprise_id)
                ->where('status', 'published')
                ->orderByRaw('COALESCE(published_at, start_date) DESC')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $communications,
                'count' => $communications->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des communications',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère une communication spécifique
     */
    public function show(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $communication = HrCommunication::where('id', $id)
                ->where('entreprise_id', $user->entreprise_id)
                ->where('status', 'published')
                ->firstOrFail();

            // Incrémenter le compteur de vues
            $communication->increment('view_count');

            return response()->json([
                'success' => true,
                'data' => $communication
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Communication non trouvée',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Enregistre l'intérêt de l'utilisateur pour une communication
     */
    public function recordInterest(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $communication = HrCommunication::where('id', $id)
                ->where('entreprise_id', $user->entreprise_id)
                ->firstOrFail();

            $communication->increment('interested_count');

            return response()->json([
                'success' => true,
                'message' => 'Intérêt enregistré'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'enregistrement',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enregistre un clic sur le CTA (Call To Action)
     */
    public function recordCtaClick(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $communication = HrCommunication::where('id', $id)
                ->where('entreprise_id', $user->entreprise_id)
                ->firstOrFail();

            $communication->increment('cta_clicks');

            return response()->json([
                'success' => true,
                'message' => 'Clic enregistré'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'enregistrement',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les communications filtrées par type
     */
    public function filterByType(string $type): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $validTypes = ['annonce', 'campagne', 'evenement', 'barometre', 'bilan', 'conseil', 'autre'];

            if (!in_array($type, $validTypes)) {
                return response()->json(['error' => 'Type invalide'], 400);
            }

            $communications = HrCommunication::where('entreprise_id', $user->entreprise_id)
                ->where('type', $type)
                ->where('status', 'published')
                ->orderBy('published_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $communications,
                'count' => $communications->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du filtrage',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
