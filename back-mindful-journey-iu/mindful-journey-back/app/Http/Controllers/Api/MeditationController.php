<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MeditationSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MeditationController extends Controller
{
    /**
     * Récupérer les méditations disponibles
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $category = $request->get('category');
        $difficulty = $request->get('difficulty');
        
        // Récupérer les templates de méditation (pas encore des sessions personnelles)
        $meditations = $this->getMeditationTemplates();
        
        // Filtrer par catégorie si spécifiée
        if ($category) {
            $meditations = array_filter($meditations, function($med) use ($category) {
                return $med['category'] === $category;
            });
        }
        
        // Filtrer par difficulté si spécifiée
        if ($difficulty) {
            $meditations = array_filter($meditations, function($med) use ($difficulty) {
                return $med['difficulty_level'] == $difficulty;
            });
        }
        
        // Ajouter les statistiques utilisateur pour chaque méditation
        foreach ($meditations as &$meditation) {
            $completedCount = MeditationSession::where('user_id', $user->id)
                ->where('category', $meditation['category'])
                ->where('duration_minutes', $meditation['duration_minutes'])
                ->completed()
                ->count();
                
            $meditation['completed_count'] = $completedCount;
            $meditation['is_new'] = $completedCount === 0;
        }
        
        return response()->json([
            'success' => true,
            'meditations' => array_values($meditations),
            'categories' => $this->getCategories(),
            'total_count' => count($meditations)
        ]);
    }

    /**
     * Démarrer une session de méditation
     */
    public function startSession(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1|max:120',
            'category' => 'required|string|in:breathing,mindfulness,sleep,stress,focus,gratitude',
            'difficulty_level' => 'required|integer|between:1,3',
            'description' => 'nullable|string',
            'instructions' => 'nullable|array',
            'benefits' => 'nullable|array'
        ]);

        try {
            $session = MeditationSession::create([
                'user_id' => $user->id,
                ...$validated,
                'session_data' => [
                    'started_at' => now()->toISOString(),
                    'device_info' => $request->header('User-Agent'),
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Session de méditation démarrée',
                'session' => $session
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du démarrage: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminer une session de méditation
     */
    public function completeSession($sessionId, Request $request)
    {
        $user = Auth::user();
        
        $session = MeditationSession::where('user_id', $user->id)
            ->where('id', $sessionId)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session non trouvée'
            ], 404);
        }

        $validated = $request->validate([
            'actual_duration_minutes' => 'nullable|integer|min:1',
            'rating' => 'nullable|integer|between:1,5',
            'notes' => 'nullable|string|max:500',
            'mood_before' => 'nullable|integer|between:1,10',
            'mood_after' => 'nullable|integer|between:1,10'
        ]);

        try {
            $sessionData = $session->session_data ?? [];
            $sessionData['completed_data'] = [
                ...$validated,
                'completed_at_timestamp' => now()->toISOString()
            ];

            $session->update([
                'completed_at' => now(),
                'session_data' => $sessionData
            ]);

            // Calculer les nouvelles statistiques
            $stats = $this->getUserMeditationStats($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Session terminée avec succès !',
                'session' => $session,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la finalisation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir l'historique des méditations
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        $period = $request->get('period', 'month'); // week, month, year
        
        $query = MeditationSession::where('user_id', $user->id)->completed();
        
        switch ($period) {
            case 'week':
                $query->where('completed_at', '>=', now()->subWeek());
                break;
            case 'month':
                $query->where('completed_at', '>=', now()->subMonth());
                break;
            case 'year':
                $query->where('completed_at', '>=', now()->subYear());
                break;
        }
        
        $sessions = $query->orderBy('completed_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'sessions' => $sessions,
            'period' => $period,
            'total_sessions' => $sessions->count(),
            'total_minutes' => $sessions->sum('duration_minutes')
        ]);
    }

    /**
     * Statistiques de méditation
     */
    public function stats()
    {
        $user = Auth::user();
        $stats = $this->getUserMeditationStats($user->id);
        
        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Marquer/démarquer une méditation comme favorite
     */
    public function toggleFavorite($sessionId)
    {
        $user = Auth::user();
        
        $session = MeditationSession::where('user_id', $user->id)
            ->where('id', $sessionId)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session non trouvée'
            ], 404);
        }

        $session->update([
            'is_favorite' => !$session->is_favorite
        ]);

        return response()->json([
            'success' => true,
            'is_favorite' => $session->is_favorite,
            'message' => $session->is_favorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
        ]);
    }

    /**
     * Templates de méditations disponibles
     */
    private function getMeditationTemplates()
    {
        return [
            [
                'id' => 'breathing-basic',
                'title' => 'Respiration Consciente',
                'description' => 'Une méditation simple centrée sur la respiration pour se détendre.',
                'duration_minutes' => 5,
                'category' => 'breathing',
                'difficulty_level' => 1,
                'image_url' => '/images/breathing.jpg',
                'instructions' => [
                    'Asseyez-vous confortablement',
                    'Fermez les yeux doucement',
                    'Concentrez-vous sur votre respiration naturelle',
                    'Comptez vos respirations de 1 à 10',
                    'Si vous perdez le fil, recommencez à 1'
                ],
                'benefits' => ['Réduction du stress', 'Amélioration de la concentration', 'Calme mental']
            ],
            [
                'id' => 'mindfulness-body',
                'title' => 'Scan Corporel',
                'description' => 'Exploration consciente des sensations corporelles.',
                'duration_minutes' => 15,
                'category' => 'mindfulness',
                'difficulty_level' => 2,
                'image_url' => '/images/body-scan.jpg',
                'instructions' => [
                    'Allongez-vous confortablement',
                    'Commencez par vos orteils',
                    'Remontez lentement le long de votre corps',
                    'Observez chaque sensation sans jugement',
                    'Terminez par le sommet de votre tête'
                ],
                'benefits' => ['Conscience corporelle', 'Relaxation profonde', 'Libération des tensions']
            ],
            [
                'id' => 'sleep-preparation',
                'title' => 'Préparation au Sommeil',
                'description' => 'Méditation douce pour faciliter l\'endormissement.',
                'duration_minutes' => 10,
                'category' => 'sleep',
                'difficulty_level' => 1,
                'image_url' => '/images/sleep.jpg',
                'instructions' => [
                    'Installez-vous dans votre lit',
                    'Relâchez tous vos muscles',
                    'Respirez lentement et profondément',
                    'Visualisez un lieu paisible',
                    'Laissez venir le sommeil naturellement'
                ],
                'benefits' => ['Meilleur endormissement', 'Sommeil plus profond', 'Réveil plus reposé']
            ],
            [
                'id' => 'stress-relief',
                'title' => 'Libération du Stress',
                'description' => 'Techniques pour évacuer le stress et les tensions.',
                'duration_minutes' => 12,
                'category' => 'stress',
                'difficulty_level' => 2,
                'image_url' => '/images/stress-relief.jpg',
                'instructions' => [
                    'Identifiez vos zones de tension',
                    'Respirez dans ces zones',
                    'Imaginez le stress qui s\'évacue',
                    'Remplacez par de la détente',
                    'Ancrez cette sensation de calme'
                ],
                'benefits' => ['Réduction de l\'anxiété', 'Détente musculaire', 'Paix intérieure']
            ],
            [
                'id' => 'focus-concentration',
                'title' => 'Amélioration de la Concentration',
                'description' => 'Renforcer votre capacité de concentration et de focus.',
                'duration_minutes' => 8,
                'category' => 'focus',
                'difficulty_level' => 2,
                'image_url' => '/images/focus.jpg',
                'instructions' => [
                    'Choisissez un point de focus',
                    'Maintenez votre attention dessus',
                    'Quand l\'esprit divague, revenez gentiment',
                    'Prolongez progressivement la durée',
                    'Célébrez chaque retour à l\'attention'
                ],
                'benefits' => ['Concentration accrue', 'Clarté mentale', 'Productivité améliorée']
            ],
            [
                'id' => 'gratitude-practice',
                'title' => 'Pratique de Gratitude',
                'description' => 'Cultiver la reconnaissance et la positivité.',
                'duration_minutes' => 7,
                'category' => 'gratitude',
                'difficulty_level' => 1,
                'image_url' => '/images/gratitude.jpg',
                'instructions' => [
                    'Pensez à 3 choses pour lesquelles vous êtes reconnaissant',
                    'Ressentez vraiment cette gratitude',
                    'Laissez cette sensation vous remplir',
                    'Étendez cette gratitude à vous-même',
                    'Partagez mentalement cette énergie positive'
                ],
                'benefits' => ['Humeur positive', 'Satisfaction personnelle', 'Relations améliorées']
            ]
        ];
    }

    /**
     * Catégories disponibles
     */
    private function getCategories()
    {
        return [
            'breathing' => 'Respiration',
            'mindfulness' => 'Pleine conscience',
            'sleep' => 'Sommeil',
            'stress' => 'Gestion du stress',
            'focus' => 'Concentration',
            'gratitude' => 'Gratitude'
        ];
    }

    /**
     * Statistiques personnalisées de méditation
     */
    private function getUserMeditationStats($userId)
    {
        $totalMinutes = MeditationSession::getTotalMeditationTime($userId);
        $totalSessions = MeditationSession::getCompletedSessionsCount($userId);
        $currentStreak = MeditationSession::getCurrentStreak($userId);
        
        // Sessions par catégorie
        $sessionsByCategory = MeditationSession::where('user_id', $userId)
            ->completed()
            ->selectRaw('category, COUNT(*) as count, SUM(duration_minutes) as total_minutes')
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        return [
            'total_minutes' => $totalMinutes,
            'total_sessions' => $totalSessions,
            'current_streak' => $currentStreak,
            'average_session_length' => $totalSessions > 0 ? round($totalMinutes / $totalSessions, 1) : 0,
            'sessions_by_category' => $sessionsByCategory,
            'this_week_sessions' => MeditationSession::where('user_id', $userId)
                ->where('completed_at', '>=', now()->subWeek())
                ->completed()
                ->count(),
            'this_month_minutes' => MeditationSession::where('user_id', $userId)
                ->where('completed_at', '>=', now()->subMonth())
                ->completed()
                ->sum('duration_minutes')
        ];
    }
}
