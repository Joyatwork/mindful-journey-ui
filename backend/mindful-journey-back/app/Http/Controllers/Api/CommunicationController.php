<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HrCommunication;
use App\Models\CampaignParticipant;
use App\Models\Campaign;
use App\Models\CommunicationRead;
use App\Models\Notification;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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

    /**
     * Marquer une annonce comme lue et notifier les RH
     */
    public function markAsRead(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Vérifier que la communication existe
            $communication = HrCommunication::where('id', $id)
                ->where('entreprise_id', $user->entreprise_id)
                ->where('status', 'published')
                ->first();

            if (!$communication) {
                return response()->json([
                    'error' => 'Communication non trouvée'
                ], 404);
            }

            // Vérifier si déjà lu par cet utilisateur
            $alreadyRead = CommunicationRead::where('communication_id', $id)
                ->where('user_id', $user->id)
                ->exists();

            if ($alreadyRead) {
                return response()->json([
                    'success' => true,
                    'message' => 'Déjà marqué comme lu',
                    'already_read' => true
                ]);
            }

            // Enregistrer la lecture
            CommunicationRead::create([
                'communication_id' => $id,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'read_at' => now()
            ]);

            // Incrémenter le compteur de vues
            $communication->increment('view_count');

            // Notifier les RH de l'entreprise
            $this->notifyHrAboutRead($communication, $user);

            return response()->json([
                'success' => true,
                'message' => 'Annonce marquée comme lue',
                'already_read' => false
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'enregistrement de la lecture',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notifier les RH qu'un employé a lu une annonce
     */
    private function notifyHrAboutRead(HrCommunication $communication, User $reader): void
    {
        // Trouver les utilisateurs RH de l'entreprise (role = 'rh' ou 'admin')
        $hrUsers = User::where('entreprise_id', $communication->entreprise_id)
            ->where(function ($query) {
                $query->whereIn('role', ['rh', 'admin', 'hr']);

                if (Schema::hasTable('roles') && Schema::hasColumn('users', 'role_id')) {
                    $query->orWhereHas('role', function ($query) {
                        $query->whereIn('name', ['rh', 'admin', 'hr']);
                    });
                }
            })
            ->where('id', '!=', $reader->id) // Ne pas notifier si c'est le RH lui-même
            ->get();

        foreach ($hrUsers as $hrUser) {
            Notification::create([
                'user_id' => $hrUser->id,
                'title' => 'Annonce lue',
                'message' => "{$reader->name} a lu l'annonce \"{$communication->title}\"",
                'type' => 'info',
                'is_read' => false,
                'related_table' => 'hr_communications',
                'related_id' => $communication->id
            ]);
        }
    }

    /**
     * Récupérer les statistiques de lecture d'une communication (pour les RH)
     */
    public function getReadStats(string $id): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Vérifier que l'utilisateur est RH ou admin
            if (!$user->hasAnyRole(['rh', 'admin', 'hr'])) {
                return response()->json(['error' => 'Accès non autorisé'], 403);
            }

            $communication = HrCommunication::where('id', $id)
                ->where('entreprise_id', $user->entreprise_id)
                ->firstOrFail();

            $reads = CommunicationRead::where('communication_id', $id)
                ->orderBy('read_at', 'desc')
                ->get(['user_name', 'user_email', 'read_at']);

            return response()->json([
                'success' => true,
                'communication_title' => $communication->title,
                'total_reads' => $reads->count(),
                'readers' => $reads
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
