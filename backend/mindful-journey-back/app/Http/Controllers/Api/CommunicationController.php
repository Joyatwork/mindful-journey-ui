<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HrCommunication;
use App\Models\CampaignParticipant;
use App\Models\Campaign;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommunicationController extends Controller
{
    /**
     * Récupère toutes les communications publiées pour l'entreprise de l'utilisateur
     * Inclut également les campagnes actives de la table campaigns
     */
    public function index(Request $request): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Récupérer l'employee_id de l'utilisateur
            $employee = Employee::where('user_id', $user->id)->first();
            $employeeId = $employee?->id;

            // Récupérer les communications publiées (hors type campagne car on prend les vraies campagnes)
            $communications = HrCommunication::where('entreprise_id', $user->entreprise_id)
                ->where('status', 'published')
                ->where('type', '!=', 'campagne') // Exclure les annonces de type campagne
                ->orderByRaw('COALESCE(published_at, start_date) DESC')
                ->get()
                ->map(function ($comm) {
                    $comm->is_real_campaign = false;
                    $comm->is_participant = false;
                    $comm->participation_status = null;
                    $comm->participation_progress = null;
                    return $comm;
                });

            // Récupérer les vraies campagnes actives
            $campaigns = Campaign::where('entreprise_id', $user->entreprise_id)
                ->whereIn('status', ['planifiée', 'en_cours', 'scheduled', 'active'])
                ->orderBy('start_date', 'desc')
                ->get()
                ->map(function ($campaign) use ($employeeId) {
                    // Vérifier la participation
                    $participation = null;
                    if ($employeeId) {
                        $participation = CampaignParticipant::where('campaign_id', $campaign->id)
                            ->where('employee_id', $employeeId)
                            ->first();
                    }
                    
                    // Vérifier si participant actif (joined, pas withdrawn)
                    $isParticipant = $participation !== null && 
                        $participation->status === 'joined';
                    
                    // Transformer en format communication
                    return (object)[
                        'id' => $campaign->id,
                        'title' => $campaign->title,
                        'content' => $campaign->description ?? 'Campagne de bien-être',
                        'image_url' => null,
                        'type' => 'campagne',
                        'objective' => 'engagement',
                        'status' => 'published',
                        'published_at' => $campaign->created_at,
                        'start_date' => $campaign->start_date,
                        'end_date' => $campaign->end_date,
                        'progress' => $participation?->progress ?? 0,
                        'cta_label' => null,
                        'cta_target' => null,
                        'cta_clicks' => 0,
                        'view_count' => 0,
                        'interested_count' => $campaign->participants()->where('status', 'joined')->count(),
                        'reminder_count' => 0,
                        'is_real_campaign' => true,
                        'is_participant' => $isParticipant,
                        'participation_status' => $participation?->status,
                        'participation_progress' => $participation?->progress,
                        'campaign_status' => $campaign->status,
                        'theme' => $campaign->theme
                    ];
                });

            // Fusionner et trier
            $allItems = $communications->concat($campaigns)
                ->sortByDesc(function ($item) {
                    return $item->published_at ?? $item->start_date ?? now();
                })
                ->values();

            return response()->json([
                'success' => true,
                'data' => $allItems,
                'count' => $allItems->count()
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

    /**
     * Rejoindre une campagne (vraie table campaigns)
     */
    public function joinCampaign(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Vérifier que la campagne existe dans la table campaigns
            $campaign = Campaign::where('id', $id)
                ->where('entreprise_id', $user->entreprise_id)
                ->whereIn('status', ['planifiée', 'en_cours', 'scheduled', 'active'])
                ->firstOrFail();

            // Récupérer l'employee_id de l'utilisateur
            $employee = Employee::where('user_id', $user->id)->first();
            
            if (!$employee) {
                return response()->json([
                    'error' => 'Profil employé non trouvé'
                ], 404);
            }

            // Vérifier si déjà inscrit
            $existing = CampaignParticipant::where('campaign_id', $id)
                ->where('employee_id', $employee->id)
                ->first();

            if ($existing) {
                // Si déjà inscrit mais withdrawn, on peut réinscrire
                if ($existing->status === 'withdrawn') {
                    $existing->status = 'joined';
                    $existing->joined_at = now();
                    $existing->save();
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Réinscription à la campagne effectuée',
                        'status' => 'joined'
                    ]);
                }
                
                return response()->json([
                    'error' => 'Vous êtes déjà inscrit à cette campagne',
                    'status' => $existing->status
                ], 400);
            }

            // Créer la participation
            CampaignParticipant::create([
                'campaign_id' => $id,
                'employee_id' => $employee->id,
                'joined_at' => now(),
                'status' => 'joined',
                'progress' => 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inscription à la campagne effectuée',
                'status' => 'joined'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'inscription',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Se désinscrire d'une campagne
     */
    public function leaveCampaign(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $employee = Employee::where('user_id', $user->id)->first();
            
            if (!$employee) {
                return response()->json(['error' => 'Profil employé non trouvé'], 404);
            }

            $participation = CampaignParticipant::where('campaign_id', $id)
                ->where('employee_id', $employee->id)
                ->first();

            if (!$participation) {
                return response()->json([
                    'error' => 'Vous n\'êtes pas inscrit à cette campagne'
                ], 404);
            }

            // Supprimer complètement l'entrée de la base
            DB::table('campaign_participants')
                ->where('campaign_id', $id)
                ->where('employee_id', $employee->id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Désinscription effectuée',
                'status' => 'withdrawn'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la désinscription',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer le statut de participation à une campagne
     */
    public function getCampaignStatus(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $employee = Employee::where('user_id', $user->id)->first();
            
            if (!$employee) {
                return response()->json([
                    'is_participant' => false,
                    'status' => null,
                    'progress' => null
                ]);
            }

            $participation = CampaignParticipant::where('campaign_id', $id)
                ->where('employee_id', $employee->id)
                ->first();

            return response()->json([
                'is_participant' => $participation !== null && $participation->status !== 'withdrawn',
                'status' => $participation?->status,
                'progress' => $participation?->progress,
                'joined_at' => $participation?->joined_at
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
