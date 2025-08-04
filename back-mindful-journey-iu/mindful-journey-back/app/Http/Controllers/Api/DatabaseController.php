<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseController extends Controller
{
    /**
     * Retourne les statistiques et utilisateurs de la base de données
     */
    public function getStats()
    {
        try {
            // Statistiques générales
            $totalUsers = User::count();
            $activeUsers = User::where('email_verified_at', '!=', null)->count();
            
            // Récupérer tous les utilisateurs avec leurs données complètes
            $users = User::select([
                'id', 'name', 'email', 'phone', 'bio', 'birth_date', 'gender',
                'preferences', 'health_goals', 'email_verified_at', 'created_at', 'updated_at'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'birth_date' => $user->birth_date,
                    'gender' => $user->gender,
                    'preferences' => is_string($user->preferences) ? json_decode($user->preferences, true) : $user->preferences,
                    'health_goals' => is_string($user->health_goals) ? json_decode($user->health_goals, true) : $user->health_goals,
                    'status' => $user->email_verified_at ? 'active' : 'pending',
                    'created_at' => $user->created_at->format('Y-m-d\TH:i:s\Z'),
                    'updated_at' => $user->updated_at->format('Y-m-d\TH:i:s\Z'),
                ];
            });

            // Informations sur la base de données
            $dbPath = database_path('database.sqlite');
            $dbSize = file_exists($dbPath) ? filesize($dbPath) : 0;
            
            return response()->json([
                'success' => true,
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'activeUsers' => $activeUsers,
                    'databaseSize' => $dbSize,
                    'databasePath' => $dbPath,
                ],
                'users' => $users,
                'message' => "Base de données: {$totalUsers} utilisateurs trouvés"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des données: ' . $e->getMessage(),
                'stats' => [
                    'totalUsers' => 0,
                    'activeUsers' => 0,
                ],
                'users' => []
            ], 500);
        }
    }

    /**
     * Créer un utilisateur de test avec données complètes
     */
    public function createTestUser(Request $request)
    {
        try {
            $testUsers = [
                [
                    'name' => 'Alice Martin',
                    'email' => 'alice.martin@example.com',
                    'password' => bcrypt('password123'),
                    'phone' => '06.12.34.56.78',
                    'birth_date' => '1990-05-15',
                    'gender' => 'Femme',
                    'bio' => 'Passionnée de bien-être et de méditation. Recherche un équilibre entre vie professionnelle et personnelle.',
                    'preferences' => json_encode([
                        'themes' => ['nature', 'ocean'],
                        'notification_frequency' => 'daily',
                        'language' => 'fr',
                        'preferred_session_time' => 'morning',
                        'difficulty_level' => 'intermediate'
                    ]),
                    'health_goals' => json_encode([
                        'primary_goals' => ['reduce_stress', 'improve_sleep'],
                        'target_meditation_minutes' => 20,
                        'weekly_sessions' => 5,
                        'focus_areas' => ['anxiety_management', 'mindful_breathing'],
                        'start_date' => '2025-01-01',
                        'target_date' => '2025-06-01'
                    ]),
                    'email_verified_at' => now(),
                ],
                [
                    'name' => 'Thomas Dubois',
                    'email' => 'thomas.dubois@example.com',
                    'password' => bcrypt('password123'),
                    'phone' => '07.23.45.67.89',
                    'birth_date' => '1985-11-22',
                    'gender' => 'Homme',
                    'bio' => 'Cadre en entreprise cherchant à gérer le stress du quotidien par la méditation.',
                    'preferences' => json_encode([
                        'themes' => ['forest', 'rain'],
                        'notification_frequency' => 'weekly',
                        'language' => 'fr',
                        'preferred_session_time' => 'evening',
                        'difficulty_level' => 'beginner'
                    ]),
                    'health_goals' => json_encode([
                        'primary_goals' => ['work_life_balance', 'reduce_anxiety'],
                        'target_meditation_minutes' => 15,
                        'weekly_sessions' => 3,
                        'focus_areas' => ['stress_management', 'concentration'],
                        'start_date' => '2025-01-01',
                        'target_date' => '2025-12-31'
                    ]),
                    'email_verified_at' => now(),
                ]
            ];

            $createdUsers = [];
            foreach ($testUsers as $userData) {
                // Vérifier si l'utilisateur existe déjà
                if (!User::where('email', $userData['email'])->exists()) {
                    $user = User::create($userData);
                    $createdUsers[] = $user;
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($createdUsers) . ' utilisateurs de test créés',
                'users' => $createdUsers,
                'total_users' => User::count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la création des utilisateurs de test: ' . $e->getMessage()
            ], 500);
        }
    }
}
