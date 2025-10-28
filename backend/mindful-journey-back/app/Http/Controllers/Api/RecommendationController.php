<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use App\Models\MoodEntry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

            // Récupérer l'humeur courante : priorité au paramètre, sinon dernière entrée en base (colonne dynamique)
            $moodFromRequest = $request->get('mood');
            $moodSource = 'request';
            if ($moodFromRequest === null) {
                [$ownerCol, $ownerId] = $this->resolveOwner($user->id);
                $moodCol = $this->resolveMoodColumn();
                if ($ownerCol && $ownerId && $moodCol) {
                    $latestMood = MoodEntry::where($ownerCol, $ownerId)
                        ->orderByDesc('date')
                        ->value($moodCol);
                } else {
                    $latestMood = null;
                }
                if ($latestMood !== null) {
                    // Normaliser si l'échelle stockée est 1-10 (ramener à 1-5 arrondi)
                    if ((int)$latestMood > 5) {
                        $normalized = max(1, min(5, (int) round(((int)$latestMood) / 2)));
                        $currentMood = $normalized;
                    } else {
                        $currentMood = (int) $latestMood;
                    }
                    $moodSource = 'latest_entry';
                } else {
                    $currentMood = 3; // neutre par défaut
                    $moodSource = 'default';
                }
            } else {
                $currentMood = (int) $moodFromRequest;
            }
            $stressLevel = (int) $request->get('stress', 3); // 1-5 échelle
            $energyLevel = (int) $request->get('energy', 3); // 1-5 échelle
            // time_of_day peut être 'HH' ou 'HH:mm'; extraire l'heure
            $todRaw = (string) $request->get('time_of_day', date('H'));
            $timeOfDay = (int) (str_contains($todRaw, ':') ? explode(':', $todRaw)[0] : $todRaw);
            $diagnosticData = $request->get('diagnostic', []);
            // If diagnostic arrives as a JSON-encoded string (query param), decode it to array
            if (is_string($diagnosticData) && $diagnosticData !== '') {
                $decoded = json_decode($diagnosticData, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $diagnosticData = $decoded;
                } else {
                    // Log decode error and fallback to empty array
                    Log::warning('RecommendationController: failed to decode diagnostic JSON', ['diagnostic_raw' => $diagnosticData, 'json_error' => json_last_error_msg()]);
                    $diagnosticData = [];
                }
            }

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
                    'mood_label' => $this->labelMood($currentMood),
                    'mood_source' => $moodSource,
                    'stress' => $stressLevel,
                    'energy' => $energyLevel,
                    'time_of_day' => $timeOfDay
                ],
                'generated_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la génération des suggestions: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Erreur lors de la génération des suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Résout la colonne d'appartenance pour mood_entries (user_id vs employee_id)
     */
    private function resolveOwner(int $currentUserId): array
    {
        if (Schema::hasColumn('mood_entries', 'user_id')) {
            return ['user_id', $currentUserId];
        }
        if (Schema::hasColumn('mood_entries', 'employee_id')) {
            $employeeId = DB::table('employees')->where('user_id', $currentUserId)->value('id');
            return ['employee_id', $employeeId ?? 0];
        }
        return ['user_id', $currentUserId];
    }

    /**
     * Résout la colonne d'humeur dans mood_entries
     */
    private function resolveMoodColumn(): ?string
    {
        foreach (['mood_level', 'mood_score', 'mood'] as $cand) {
            if (Schema::hasColumn('mood_entries', $cand)) return $cand;
        }
        return null;
    }

    /**
     * Algorithme principal de génération de suggestions
     */
    private function generateSuggestions(User $user, array $context): array
    {
        $suggestions = [
            'challenges' => $this->generateChallenges($context),
            'practitioners' => $this->generatePractitionerRecommendations($user, $context),
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
        // Humeur très positive : proposer un défi de consolidation / progression
        if ($mood >= 4) {
            $challenges[] = [
                'type' => 'progression',
                'title' => 'Défi progression bien-être',
                'description' => 'Capitaliser sur votre bonne humeur avec une action d\'impact',
                'duration' => '10 min',
                'difficulty' => 'moyen',
                'priority' => 'medium',
                'icon' => '🚀',
                'category' => 'Croissance',
                'score' => 70
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
    private function generatePractitionerRecommendations(User $user, array $context): array
    {
        $stress = $context['stress'];
        $mood = $context['mood'];
        $energy = $context['energy'];
        $diagnostic = $context['diagnostic'] ?? [];

        // Ne proposer des praticiens que si les résultats sont « positifs » = faux
        $isPositive = ($stress <= 2) && ($mood >= 4) && ($energy >= 3);
        if ($isPositive) {
            return [];
        }

        // Déterminer les spécialités candidates selon le diagnostic + contexte
        $candidates = $this->determineSpecialtiesFromDiagnostic($diagnostic, $context);

        // NOTE: practitioners table stores specializations differently (e.g. JSON `specializations`)
        // The `Specialist` model exposes a virtual `specialty` accessor. We must avoid SQL references
        // to a non-existing `specialty` column. Instead, retrieve a small pool by rating and filter in PHP.

        // Get a candidate pool ordered by rating if table/column available, sinon fallback
        $pool = collect();
        try {
            if (Schema::hasTable('specialists')) {
                $q = Specialist::query();
                // si la colonne rating n'existe pas, éviter orderBy dessus
                if (Schema::hasColumn('specialists', 'rating')) {
                    $q = $q->orderBy('rating', 'desc');
                }
                $pool = $q->take(20)->get();
            }
        } catch (\Throwable $e) {
            Log::warning('generatePractitionerRecommendations: unable to fetch specialists', ['error' => $e->getMessage()]);
            $pool = collect();
        }

        // Exclude psychologues at PHP level using the accessor
        $pool = $pool->filter(function (Specialist $s) {
            $spec = strtolower((string) $s->specialty);
            return !str_contains($spec, 'psychologue');
        })->values();

        // If candidates provided, filter by them (match via accessor or specializations array)
        if (!empty($candidates)) {
            $pool = $pool->filter(function (Specialist $s) use ($candidates) {
                $candidateMatched = false;
                $specStr = strtolower((string) $s->specialty);
                foreach ($candidates as $c) {
                    if (str_contains($specStr, strtolower($c))) {
                        $candidateMatched = true;
                        break;
                    }
                }
                // also inspect raw specializations array if accessor not helpful
                if (!$candidateMatched && isset($s->specializations) && is_array($s->specializations)) {
                    foreach ($s->specializations as $sp) {
                        if (is_string($sp) && in_array(strtolower($sp), array_map('strtolower', $candidates), true)) {
                            $candidateMatched = true;
                            break;
                        }
                    }
                }
                return $candidateMatched;
            })->values();
        } else {
            // Apply fallback preferences in PHP
            if ($stress >= 4 || $mood <= 2) {
                $pool = $pool->filter(function (Specialist $s) {
                    return str_contains(strtolower((string) $s->specialty), 'psychiatre')
                        || $this->containsInSpecializations($s, 'psychiatre');
                })->values();
            } elseif ($energy <= 2) {
                $pool = $pool->filter(function (Specialist $s) {
                    $spec = strtolower((string) $s->specialty);
                    return str_contains($spec, 'généraliste') || str_contains($spec, 'generaliste')
                        || $this->containsInSpecializations($s, 'médecin généraliste')
                        || $this->containsInSpecializations($s, 'generaliste');
                })->values();
            }
        }

        if ($pool->isEmpty()) {
            return [];
        }

        $idx = crc32($user->id . '|' . date('Y-m-d')) % max(1, $pool->count());
        $chosen = $pool->values()->get($idx);

        $urgency = ($stress >= 4 || $mood <= 2) ? 'high' : (($energy <= 2) ? 'medium' : 'low');

        $one = [
            'id' => (string) $chosen->id,
            'type' => 'specialist',
            'name' => $chosen->name,
            'specialty' => $chosen->specialty,
            'rating' => (float) $chosen->rating,
            'experience' => $chosen->experience_years . ' ans',
            'availability' => $chosen->availability,
            'price' => intval($chosen->price_cents / 100),
            'consultationType' => $chosen->consultation_type,
            'reason' => $this->buildPractitionerReason($chosen, $context),
            'urgency' => $urgency,
            'icon' => '�‍⚕️',
            'score' => min(100, intval(($chosen->rating / 5) * 100)),
        ];

        return [$one]; // Un seul praticien ciblé
    }

    /**
     * Déterminer les spécialités en fonction des réponses de diagnostic/annuel
     */
    private function determineSpecialtiesFromDiagnostic(array $diagnostic, array $context): array
    {
        $candidates = [];

        // Anxiété / stress élevé -> Psychiatre
        $anxiety = intval($diagnostic['anxiety_level'] ?? 0);
        $stress = intval($context['stress'] ?? 0);
        $mood = intval($context['mood'] ?? 0);
        if ($anxiety >= 4 || $stress >= 4 || $mood <= 2) {
            $candidates[] = 'Psychiatre';
        }

        // Douleurs musculosquelettiques -> Kinésithérapeute / Ostéopathe
        $pain = intval($diagnostic['pain_level'] ?? 0);
        $painLoc = strtolower((string)($diagnostic['pain_location'] ?? ''));
        if ($pain >= 5 || preg_match('/dos|cou|épaule|epaules|lomb/i', $painLoc)) {
            // Prioriser kiné, puis ostéo
            $candidates[] = 'Kinésithérapeute';
            $candidates[] = 'Ostéopathe';
        }

        // Sommeil bas -> Médecin généraliste (ou ORL si disponible)
        $sleepQ = intval($diagnostic['sleep_quality'] ?? 0);
        if ($sleepQ && $sleepQ <= 2) {
            $candidates[] = 'Médecin généraliste';
            $candidates[] = 'ORL';
        }

        // Nutrition bas -> Nutritionniste / Diététicienne
        $nutrition = intval($diagnostic['nutrition_level'] ?? 0);
        if ($nutrition && $nutrition <= 2) {
            $candidates[] = 'Nutritionniste';
            $candidates[] = 'Diététicienne';
        }

        // Énergie/fatigue -> Généraliste
        $energy = intval($context['energy'] ?? 0);
        $physFatigue = intval($diagnostic['physical_fatigue'] ?? 0);
        if ($energy <= 2 || $physFatigue >= 4) {
            $candidates[] = 'Médecin généraliste';
        }

        // Nettoyer doublons et conserver l'ordre de priorité
        $uniq = [];
        foreach ($candidates as $c) {
            if (!in_array($c, $uniq, true)) $uniq[] = $c;
        }
        return $uniq;
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
     * Helper: check whether a given keyword appears in a Specialist's specializations array
     */
    private function containsInSpecializations(Specialist $s, string $keyword): bool
    {
        $key = strtolower($keyword);
        $specs = $s->specializations ?? null;
        if (!$specs) return false;
        if (is_string($specs)) {
            $decoded = json_decode($specs, true);
            if (is_array($decoded)) $specs = $decoded;
        }
        if (is_array($specs)) {
            foreach ($specs as $sp) {
                if (!is_string($sp)) continue;
                if (str_contains(strtolower($sp), $key)) return true;
            }
        }
        return false;
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
        // Contenu de consolidation si humeur élevée
        if ($mood >= 4) {
            $content[] = [
                'type' => 'optimisation',
                'title' => 'Optimiser votre bonne dynamique',
                'description' => 'Plan court pour maintenir énergie et focus sur la journée',
                'duration' => '7 min',
                'category' => 'Performance sereine',
                'difficulty' => 'moyen',
                'icon' => '🔥',
                'tags' => ['performance', 'focus', 'maintien'],
                'score' => 75
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
            usort($items, function ($a, $b) {
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

    /**
     * Libellé lisible pour une valeur d'humeur 1-5
     */
    private function labelMood(int $mood): string
    {
        return match (true) {
            $mood <= 1 => 'très bas',
            $mood === 2 => 'bas',
            $mood === 3 => 'neutre',
            $mood === 4 => 'bon',
            $mood >= 5 => 'excellent',
        };
    }
}
