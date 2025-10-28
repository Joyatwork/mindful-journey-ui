<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
                'id',
                'name',
                'email',
                'phone',
                'bio',
                'birth_date',
                'gender',
                'preferences',
                'health_goals',
                'email_verified_at',
                'created_at',
                'updated_at'
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
     * Liste les schémas (bases) disponibles sur le serveur MySQL
     */
    public function listSchemas()
    {
        try {
            $schemas = DB::select("SELECT SCHEMA_NAME AS schema_name FROM INFORMATION_SCHEMA.SCHEMATA ORDER BY SCHEMA_NAME");
            return response()->json(array_map(function ($row) {
                return $row->schema_name;
            }, $schemas));
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des schémas',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Liste les tables d'un schéma donné (par défaut le schéma courant)
     */
    public function listTables(Request $request)
    {
        try {
            $schema = $request->query('schema');
            if (!$schema) {
                $schema = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            }
            if (!$schema) {
                return response()->json(['error' => 'Impossible de déterminer le schéma courant'], 400);
            }

            $tables = DB::select(
                'SELECT TABLE_NAME AS table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
                [$schema]
            );
            return response()->json(array_map(function ($row) {
                return $row->table_name;
            }, $tables));
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des tables',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Liste les colonnes pour un schéma, optionnellement filtré par table
     */
    public function listColumns(Request $request)
    {
        try {
            $schema = $request->query('schema');
            $table = $request->query('table');
            if (!$schema) {
                $schema = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            }
            if (!$schema) {
                return response()->json(['error' => 'Impossible de déterminer le schéma courant'], 400);
            }

            $params = [$schema];
            $sql = "SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name, DATA_TYPE AS data_type, COLUMN_TYPE AS column_type, IS_NULLABLE AS is_nullable, COLUMN_DEFAULT AS column_default, ORDINAL_POSITION AS ordinal_position FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?";
            if ($table) {
                $sql .= " AND TABLE_NAME = ?";
                $params[] = $table;
            }
            $sql .= " ORDER BY TABLE_NAME, ORDINAL_POSITION";

            $rows = DB::select($sql, $params);
            // Regrouper par table
            $result = [];
            foreach ($rows as $row) {
                $t = $row->table_name;
                if (!isset($result[$t])) {
                    $result[$t] = [];
                }
                $result[$t][] = [
                    'name' => $row->column_name,
                    'data_type' => $row->data_type,
                    'column_type' => $row->column_type,
                    'is_nullable' => $row->is_nullable === 'YES',
                    'default' => $row->column_default,
                    'position' => (int) $row->ordinal_position,
                ];
            }

            return response()->json([
                'schema' => $schema,
                'table' => $table,
                'columns' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des colonnes',
                'message' => $e->getMessage(),
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

    /**
     * Dev helper: mappe l'utilisateur courant vers la table employees en créant une ligne si absent.
     * Protégé en pratique par auth:sanctum via les routes.
     */
    public function mapCurrentUserToEmployee(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        if (!Schema::hasTable('employees')) {
            return response()->json(['success' => false, 'message' => "La table 'employees' est absente"], 400);
        }

        $existingId = DB::table('employees')->where('user_id', $user->id)->value('id');
        if ($existingId) {
            return response()->json(['success' => true, 'message' => 'Déjà mappé', 'employee_id' => $existingId]);
        }

        // Préparer les données minimales + champs requis déduits de INFORMATION_SCHEMA
        $data = ['user_id' => $user->id];
        $empColumns = Schema::getColumnListing('employees');
        $nullable = [];
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            if ($dbName) {
                $rows = DB::select(
                    'SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
                    [$dbName, 'employees']
                );
                foreach ($rows as $r) {
                    $nullable[$r->COLUMN_NAME] = [
                        'nullable' => ($r->IS_NULLABLE === 'YES'),
                        'type' => $r->DATA_TYPE,
                    ];
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // Texte requis
        foreach (['first_name', 'last_name', 'name'] as $col) {
            if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                $data[$col] = '';
            }
        }
        // Numériques requis
        foreach (['salary', 'age'] as $col) {
            if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                $data[$col] = 0;
            }
        }
        // FKs: entreprise_id / department_id
        $fkSources = [
            'entreprise_id' => ['entreprises', 'enterprise', 'companies', 'organizations', 'organisations', 'businesses'],
            'department_id' => ['departments', 'departements', 'teams'],
        ];
        foreach ($fkSources as $fkCol => $candidates) {
            if (in_array($fkCol, $empColumns, true)) {
                $value = null;
                foreach ($candidates as $table) {
                    if (Schema::hasTable($table)) {
                        $value = DB::table($table)->value('id');
                        if ($value) break;
                    }
                }
                if ($value) {
                    $data[$fkCol] = $value;
                } else if (isset($nullable[$fkCol]) && !$nullable[$fkCol]['nullable']) {
                    $data[$fkCol] = 1; // dernier recours
                }
            }
        }
        if (in_array('created_at', $empColumns, true)) $data['created_at'] = now();
        if (in_array('updated_at', $empColumns, true)) $data['updated_at'] = now();

        try {
            $newId = DB::table('employees')->insertGetId($data);
            return response()->json(['success' => true, 'message' => 'Mapping créé', 'employee_id' => $newId]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Échec création mapping: ' . $e->getMessage()], 500);
        }
    }
}
