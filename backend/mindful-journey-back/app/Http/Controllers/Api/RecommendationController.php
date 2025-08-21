<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RecommendationController extends Controller
{
    /**
     * Obtenir des suggestions personnalisées pour l'utilisateur
     */
    public function getPersonalizedSuggestions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            // Récupérer les paramètres de contexte
            $currentMood = $request->get('mood', 3); // 1-5 échelle
            $stressLevel = $request->get('stress', 3); // 1-5 échelle
            $energyLevel = $request->get('energy', 3); // 1-5 échelle
            $timeOfDay = $request->get('time_of_day', date('H')); // Heure actuelle
            $diagnosticData = $request->get('diagnostic', []);

            // Analyser le profil utilisateur et générer des suggestions
            $suggestions = $this->generateSuggestions($user, [
                'mood' => $currentMood,
                'stress' => $stressLevel,
                'energy' => $energyLevel,
                'time_of_day' => $timeOfDay,
                'diagnostic' => $diagnosticData
            ]);

            return response()->json([
                'suggestions' => $suggestions,
                'user_context' => [
                    'mood' => $currentMood,
                    'stress' => $stressLevel,
                    'energy' => $energyLevel,
                    'time_of_day' => $timeOfDay
                ],
                'generated_at' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la génération des suggestions: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la génération des suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Algorithme principal de génération de suggestions
     */
    private function generateSuggestions(User $user, array $context): array
    {
        $suggestions = [
            'challenges' => $this->generateChallenges($context),
            'practitioners' => $this->generatePractitionerRecommendations($context),
            'content' => $this->generateContentRecommendations($context),
            'immediate_actions' => $this->generateImmediateActions($context)
        ];

        // Scorer et trier les suggestions
        return $this->scoreSuggestions($suggestions, $context);
    }

    /**
     * Générer des défis personnalisés
     */
    private function generateChallenges(array $context): array
    {
        $challenges = [];
        $mood = $context['mood'];
        $stress = $context['stress'];
        $energy = $context['energy'];
        $hour = intval($context['time_of_day']);

        // Défis basés sur l'humeur
        if ($mood <= 2) {
            $challenges[] = [
                'type' => 'mood_boost',
                'title' => 'Boost d\'humeur express',
                'description' => 'Exercice de gratitude et affirmations positives',
                'duration' => '5 min',
                'difficulty' => 'facile',
                'priority' => 'high',
                'icon' => '😊',
                'category' => 'Humeur',
                'score' => 95
            ];
        }

        // Défis basés sur le stress
        if ($stress >= 4) {
            $challenges[] = [
                'type' => 'stress_relief',
                'title' => 'Détente immédiate',
                'description' => 'Technique de respiration 4-7-8 pour calmer l\'esprit',
                'duration' => '3 min',
                'difficulty' => 'facile',
                'priority' => 'high',
                'icon' => '🧘‍♀️',
                'category' => 'Anti-stress',
                'score' => 90
            ];
        }

        // Défis basés sur l'énergie
        if ($energy <= 2) {
            $challenges[] = [
                'type' => 'energy_boost',
                'title' => 'Réveil corporel',
                'description' => 'Étirements énergisants et micro-mouvement',
                'duration' => '7 min',
                'difficulty' => 'facile',
                'priority' => 'medium',
                'icon' => '⚡',
                'category' => 'Énergie',
                'score' => 80
            ];
        }

        // Défis basés sur l'heure
        if ($hour >= 6 && $hour <= 10) {
            $challenges[] = [
                'type' => 'morning_routine',
                'title' => 'Routine matinale mindful',
                'description' => 'Commencez la journée avec intention et clarté',
                'duration' => '10 min',
                'difficulty' => 'moyen',
                'priority' => 'medium',
                'icon' => '🌅',
                'category' => 'Routine',
                'score' => 85
            ];
        } elseif ($hour >= 12 && $hour <= 14) {
            $challenges[] = [
                'type' => 'midday_reset',
                'title' => 'Reset de mi-journée',
                'description' => 'Pause mindfulness pour recharger votre après-midi',
                'duration' => '5 min',
                'difficulty' => 'facile',
                'priority' => 'medium',
                'icon' => '☀️',
                'category' => 'Pause',
                'score' => 75
            ];
        } elseif ($hour >= 18 && $hour <= 22) {
            $challenges[] = [
                'type' => 'evening_wind_down',
                'title' => 'Détente du soir',
                'description' => 'Préparation douce pour une nuit reposante',
                'duration' => '15 min',
                'difficulty' => 'facile',
                'priority' => 'medium',
                'icon' => '🌙',
                'category' => 'Sommeil',
                'score' => 80
            ];
        }

        return array_slice($challenges, 0, 3); // Maximum 3 défis
    }

    /**
     * Générer des recommandations de praticiens
     */
    private function generatePractitionerRecommendations(array $context): array
    {
        $stress = $context['stress'];
        $mood = $context['mood'];
        $energy = $context['energy'];

        // Ne proposer des praticiens que si les résultats sont « positifs » = faux
        $isPositive = ($stress <= 2) && ($mood >= 4) && ($energy >= 3);
        if ($isPositive) {
            return [];
        }

        // Construire une requête vers la table specialists pour retourner de VRAIS IDs
        $query = Specialist::query();

        // Filtrage simple selon le contexte
        if ($stress >= 4 || $mood <= 2) {
            $query->where(function ($q) {
                $q->where('specialty', 'like', '%Psychologue%')
                  ->orWhere('specialty', 'like', '%Psychiatre%');
            });
        } elseif ($energy <= 2) {
            $query->where(function ($q) {
                $q->where('specialty', 'like', '%généraliste%')
                  ->orWhere('specialty', 'like', '%Généraliste%');
            });
        }

        $list = $query->orderBy('rating', 'desc')->take(3)->get();

        // Fallback: si aucun résultat filtré, prendre les mieux notés
        if ($list->isEmpty()) {
            $list = Specialist::query()->orderBy('rating', 'desc')->take(3)->get();
        }

        $urgency = ($stress >= 4 || $mood <= 2) ? 'high' : (($energy <= 2) ? 'medium' : 'low');

        $practitioners = $list->map(function (Specialist $s) use ($context, $urgency) {
            return [
                'id' => (string) $s->id,
                'type' => 'specialist',
                'name' => $s->name,
                'specialty' => $s->specialty,
                'rating' => (float) $s->rating,
                'experience' => $s->experience_years . ' ans',
                'availability' => $s->availability,
                // Prix en euros (nombre) – l'UI accepte string|number
                'price' => intval($s->price_cents / 100),
                'consultationType' => $s->consultation_type,
                'reason' => $this->buildPractitionerReason($s, $context),
                'urgency' => $urgency,
                'icon' => '�‍⚕️',
                // Score simple basé sur la note
                'score' => min(100, intval(($s->rating / 5) * 100)),
            ];
        })->values()->all();

        return array_slice($practitioners, 0, 2); // Maximum 2 praticiens
    }

    private function buildPractitionerReason(Specialist $s, array $context): string
    {
        $parts = [];
        $spec = mb_strtolower($s->specialty);
        if (str_contains($spec, 'psychologue') || str_contains($spec, 'psychiatre')) {
            if (($context['stress'] ?? 0) >= 4) $parts[] = 'gestion du stress';
            if (($context['mood'] ?? 3) <= 2) $parts[] = 'troubles de l’humeur';
        } elseif (str_contains($spec, 'généraliste')) {
            if (($context['energy'] ?? 3) <= 2) $parts[] = 'fatigue/énergie';
            if (($context['stress'] ?? 0) >= 3) $parts[] = 'sommeil/stress';
        }

        if (empty($parts)) {
            return 'Recommandé selon votre profil récent';
        }
        return 'Recommandé pour: ' . implode(', ', $parts);
    }

    /**
     * Générer des recommandations de contenu
     */
    private function generateContentRecommendations(array $context): array
    {
        $content = [];
        $mood = $context['mood'];
        $stress = $context['stress'];
        $energy = $context['energy'];
        $hour = intval($context['time_of_day']);

        // Contenu basé sur le stress
        if ($stress >= 3) {
            $content[] = [
                'type' => 'meditation',
                'title' => 'Méditation anti-stress',
                'description' => 'Séance guidée pour réduire le stress et l\'anxiété',
                'duration' => '10 min',
                'category' => 'Méditation',
                'difficulty' => 'facile',
                'icon' => '🧘',
                'tags' => ['stress', 'relaxation', 'calme'],
                'score' => 90
            ];
        }

        // Contenu basé sur l'humeur
        if ($mood <= 3) {
            $content[] = [
                'type' => 'mood_improvement',
                'title' => 'Techniques de boost d\'humeur',
                'description' => 'Exercices pratiques pour améliorer votre moral',
                'duration' => '8 min',
                'category' => 'Psychologie positive',
                'difficulty' => 'facile',
                'icon' => '🌈',
                'tags' => ['humeur', 'positivité', 'motivation'],
                'score' => 85
            ];
        }

        // Contenu basé sur l'énergie
        if ($energy <= 2) {
            $content[] = [
                'type' => 'energy_boost',
                'title' => 'Réveil énergétique',
                'description' => 'Exercices pour booster votre énergie naturellement',
                'duration' => '6 min',
                'category' => 'Énergie',
                'difficulty' => 'moyen',
                'icon' => '⚡',
                'tags' => ['énergie', 'vitalité', 'mouvement'],
                'score' => 80
            ];
        }

        // Contenu basé sur l'heure
        if ($hour >= 21 || $hour <= 6) {
            $content[] = [
                'type' => 'sleep',
                'title' => 'Préparation au sommeil',
                'description' => 'Routine relaxante pour un sommeil réparateur',
                'duration' => '15 min',
                'category' => 'Sommeil',
                'difficulty' => 'facile',
                'icon' => '😴',
                'tags' => ['sommeil', 'détente', 'nuit'],
                'score' => 95
            ];
        }

        return array_slice($content, 0, 4); // Maximum 4 contenus
    }

    /**
     * Générer des actions immédiates
     */
    private function generateImmediateActions(array $context): array
    {
        $actions = [];
        $mood = $context['mood'];
        $stress = $context['stress'];
        $energy = $context['energy'];

        if ($stress >= 4) {
            $actions[] = [
                'type' => 'breathing',
                'title' => 'Respiration d\'urgence',
                'description' => 'Technique 4-7-8 pour calmer immédiatement',
                'duration' => '2 min',
                'priority' => 'urgent',
                'icon' => '💨',
                'action_steps' => [
                    'Inspirez par le nez pendant 4 secondes',
                    'Retenez votre souffle pendant 7 secondes',
                    'Expirez par la bouche pendant 8 secondes',
                    'Répétez 4 fois'
                ],
                'score' => 100
            ];
        }

        if ($mood <= 2) {
            $actions[] = [
                'type' => 'gratitude',
                'title' => 'Gratitude express',
                'description' => 'Listez 3 choses positives de votre journée',
                'duration' => '1 min',
                'priority' => 'high',
                'icon' => '🙏',
                'action_steps' => [
                    'Pensez à 3 choses positives d\'aujourd\'hui',
                    'Ressentez la gratitude pour chacune',
                    'Souriez intérieurement'
                ],
                'score' => 90
            ];
        }

        if ($energy <= 2) {
            $actions[] = [
                'type' => 'movement',
                'title' => 'Micro-mouvement',
                'description' => 'Étirements rapides pour réveiller le corps',
                'duration' => '30 sec',
                'priority' => 'medium',
                'icon' => '🤸',
                'action_steps' => [
                    'Levez-vous et étirez vos bras',
                    'Roulez vos épaules 5 fois',
                    'Respirez profondément 3 fois'
                ],
                'score' => 75
            ];
        }

        return $actions;
    }

    /**
     * Scorer et trier les suggestions par pertinence
     */
    private function scoreSuggestions(array $suggestions, array $context): array
    {
        // Trier chaque catégorie par score
        foreach ($suggestions as $category => &$items) {
            usort($items, function($a, $b) {
                return ($b['score'] ?? 0) <=> ($a['score'] ?? 0);
            });
        }

        return $suggestions;
    }

    /**
     * Obtenir des suggestions basées sur l'historique utilisateur
     */
    public function getHistoryBasedSuggestions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            // TODO: Analyser l'historique des activités de l'utilisateur
            // Pour l'instant, retourner des suggestions génériques

            $suggestions = [
                'trending' => [
                    [
                        'type' => 'popular_challenge',
                        'title' => 'Défi 7 jours de gratitude',
                        'description' => 'Challenge populaire cette semaine',
                        'participants' => 1247,
                        'success_rate' => 89,
                        'category' => 'Bien-être mental'
                    ]
                ],
                'personalized' => [
                    [
                        'type' => 'based_on_profile',
                        'title' => 'Méditation guidée personnalisée',
                        'description' => 'Basée sur vos préférences et progrès',
                        'match_percentage' => 95,
                        'category' => 'Méditation'
                    ]
                ]
            ];

            return response()->json([
                'suggestions' => $suggestions,
                'generated_at' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des suggestions historiques: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
