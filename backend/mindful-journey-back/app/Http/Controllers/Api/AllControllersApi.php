<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class HealthDataController extends Controller
{
    /**
     * Obtenir les données d'humeur
     */
    public function getMoodData(Request $request): JsonResponse
    {
        $period = $request->get('period', 'week');

        // Données mockées pour l'humeur
        $moodData = [
            ['date' => '2024-08-01', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 5],
            ['date' => '2024-08-02', 'mood' => 3, 'stress' => 4, 'energy' => 3, 'sleep' => 4],
            ['date' => '2024-08-03', 'mood' => 5, 'stress' => 2, 'energy' => 5, 'sleep' => 4],
            ['date' => '2024-08-04', 'mood' => 4, 'stress' => 2, 'energy' => 4, 'sleep' => 5],
            ['date' => '2024-08-05', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 4],
        ];

        return response()->json([
            'success' => true,
            'data' => $moodData,
            'period' => $period
        ]);
    }

    /**
     * Sauvegarder les données d'humeur
     */
    public function saveMoodData(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mood' => 'required|integer|between:1,5',
            'stress' => 'nullable|integer|between:1,5',
            'energy' => 'nullable|integer|between:1,5',
            'sleep' => 'nullable|integer|between:1,5',
            'notes' => 'nullable|string|max:500',
            'date' => 'nullable|date'
        ]);

        // Simuler la sauvegarde
        $moodEntry = array_merge($validated, [
            'id' => time(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'date' => $validated['date'] ?? now()->toDateString(),
            'created_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Données d\'humeur sauvegardées avec succès',
            'data' => $moodEntry
        ], 201);
    }

    /**
     * Obtenir les données de progression
     */
    public function getProgressData(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');

        // Données mockées de progression
        $progressData = [
            'totalSessions' => 45,
            'streakDays' => 7,
            'totalMinutes' => 320,
            'weeklyProgress' => [
                ['date' => 'Lun', 'mood' => 3, 'stress' => 4, 'energy' => 3, 'sleep' => 4],
                ['date' => 'Mar', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 3],
                ['date' => 'Mer', 'mood' => 3, 'stress' => 5, 'energy' => 2, 'sleep' => 4],
                ['date' => 'Jeu', 'mood' => 4, 'stress' => 2, 'energy' => 4, 'sleep' => 5],
                ['date' => 'Ven', 'mood' => 5, 'stress' => 2, 'energy' => 5, 'sleep' => 4],
                ['date' => 'Sam', 'mood' => 4, 'stress' => 3, 'energy' => 4, 'sleep' => 5],
                ['date' => 'Dim', 'mood' => 4, 'stress' => 2, 'energy' => 4, 'sleep' => 4],
            ],
            'achievements' => [
                ['name' => 'Premier pas', 'description' => 'Première séance complétée', 'earned' => true],
                ['name' => 'Semaine zen', 'description' => '7 jours consécutifs', 'earned' => true],
                ['name' => 'Maître de la méditation', 'description' => '50 séances complétées', 'earned' => false],
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $progressData,
            'period' => $period
        ]);
    }
}

class WellnessController extends Controller
{
    /**
     * Obtenir les activités wellness
     */
    public function getActivities(): JsonResponse
    {
        $activities = [
            [
                'id' => 1,
                'title' => 'Méditation guidée',
                'description' => 'Séance de relaxation pour réduire le stress',
                'duration' => '10 min',
                'difficulty' => 'Facile',
                'category' => 'Mindfulness',
                'type' => 'meditation'
            ],
            [
                'id' => 2,
                'title' => 'Exercices de respiration',
                'description' => 'Techniques de respiration pour gérer l\'anxiété',
                'duration' => '5 min',
                'difficulty' => 'Facile',
                'category' => 'Gestion du stress',
                'type' => 'breathing'
            ],
            [
                'id' => 3,
                'title' => 'Routine sommeil',
                'description' => 'Améliorez la qualité de votre sommeil',
                'duration' => '15 min',
                'difficulty' => 'Moyen',
                'category' => 'Sommeil',
                'type' => 'sleep'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Enregistrer une activité complétée
     */
    public function logActivity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => 'required|integer',
            'duration' => 'required|integer',
            'completion_rate' => 'nullable|integer|between:0,100',
            'notes' => 'nullable|string|max:500'
        ]);

        $activityLog = array_merge($validated, [
            'id' => time(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'completed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Activité enregistrée avec succès',
            'data' => $activityLog
        ], 201);
    }

    /**
     * Obtenir le progrès wellness
     */
    public function getProgress(): JsonResponse
    {
        $progress = [
            'totalActivities' => 28,
            'weeklyGoal' => 5,
            'weeklyCompleted' => 3,
            'favoriteActivity' => 'Méditation guidée',
            'totalMinutes' => 420,
            'streak' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $progress
        ]);
    }
}

class DiagnosticController extends Controller
{
    /**
     * Obtenir le diagnostic de l'utilisateur
     */
    public function show(): JsonResponse
    {
        // Données mockées du diagnostic
        $diagnostic = [
            'id' => 1,
            'stress_level' => 6,
            'energy_level' => 4,
            'work_pressure' => 'Souvent, je ressens une pression constante',
            'completed_at' => '2024-08-01',
            'recommendations' => [
                'Méditation quotidienne recommandée',
                'Exercices de respiration en cas de stress',
                'Consultation avec un spécialiste suggérée'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $diagnostic
        ]);
    }

    /**
     * Sauvegarder un diagnostic
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stress_level' => 'required|integer|between:1,10',
            'energy_level' => 'required|integer|between:1,10',
            'work_pressure' => 'required|string',
            'answers' => 'nullable|array'
        ]);

        $diagnostic = array_merge($validated, [
            'id' => time(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'completed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Diagnostic sauvegardé avec succès',
            'data' => $diagnostic
        ], 201);
    }
}

class ProfileController extends Controller
{
    /**
     * Afficher le profil utilisateur
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        Log::info('ProfileController@update - payload reçu', $request->all());

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'preferences' => 'nullable|array',
            // Champs de préférences à aplatir
            'location' => 'nullable|string|max:255',
            'job_position' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'goals' => 'nullable|string|max:1000',
            // Avatar via upload fichier ou URL externe
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'avatar_url' => 'nullable|string|url|max:2048',
        ]);

        // Gestion de l'upload d'avatar si fourni
        if ($request->hasFile('avatar')) {
            try {
                if (!empty($user->avatar)) {
                    try {
                        Storage::disk('public')->delete($user->avatar);
                    } catch (\Throwable $e) { /* ignore */
                    }
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $path;
                // Si on uploade un fichier, ignorer une éventuelle URL explicite
                $validated['avatar_url'] = null;
                Log::info('ProfileController@update - avatar stocké', ['path' => $path]);
            } catch (\Throwable $e) {
                Log::error('ProfileController@update - échec upload avatar: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => "Erreur lors de l'upload de l'avatar."], 500);
            }
        } else {
            // Normaliser une chaîne vide envoyée pour avatar_url
            if (array_key_exists('avatar_url', $validated) && $validated['avatar_url'] === '') {
                $validated['avatar_url'] = null;
            }
        }

        // Fusionner les préférences dans users.preferences si la colonne existe
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        foreach (['location', 'job_position', 'company', 'goals'] as $prefKey) {
            if (array_key_exists($prefKey, $validated)) {
                $preferences[$prefKey] = $validated[$prefKey];
                unset($validated[$prefKey]);
            }
        }

        try {
            $userColumns = Schema::getColumnListing('users');
            $allowed = array_intersect_key($validated, array_flip($userColumns));

            if (!empty($allowed)) {
                $user->update($allowed);
            }

            if (in_array('preferences', $userColumns)) {
                $user->preferences = $preferences;
                $user->save();
            } else {
                Log::warning('ProfileController@update - colonne preferences absente, skip write', ['user_id' => $user->id]);
            }

            $fresh = $user->fresh();

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $fresh,
            ]);
        } catch (\Throwable $e) {
            Log::error('ProfileController@update - exception during update: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Impossible de mettre à jour le profil. Consultez les logs serveur.'
            ], 500);
        }
    }
}
