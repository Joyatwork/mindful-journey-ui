<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MoodEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class MoodController extends Controller
{
    /**
     * Récupérer les entrées d'humeur de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $period = $request->get('period', 'week'); // week, month, year
        [$ownerCol, $ownerId] = $this->resolveOwner($user->id);

        $query = MoodEntry::where($ownerCol, $ownerId);

        switch ($period) {
            case 'week':
                $query->thisWeek();
                break;
            case 'month':
                $query->thisMonth();
                break;
            case 'year':
                $query->whereYear('date', now()->year);
                break;
        }

        $entries = $query->orderBy('date', 'desc')->get();

        // Statistiques
        $stats = [
            'average_mood' => $entries->avg('mood_level'),
            'average_energy' => $entries->avg('energy_level'),
            'average_stress' => $entries->avg('stress_level'),
            'average_sleep' => $entries->avg('sleep_quality'),
            'total_entries' => $entries->count(),
            'best_day' => $entries->sortByDesc('mood_level')->first(),
            'worst_day' => $entries->sortBy('mood_level')->first(),
        ];

        return response()->json([
            'success' => true,
            'entries' => $entries,
            'stats' => $stats,
            'period' => $period
        ]);
    }

    /**
     * Enregistrer une nouvelle entrée d'humeur
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        [$ownerCol, $ownerId] = $this->resolveOwner($user->id);

        $validated = $request->validate([
            'date' => 'required|date',
            'mood_level' => 'required|integer|between:1,10',
            'mood_emoji' => 'nullable|string|max:10',
            'energy_level' => 'nullable|integer|between:1,10',
            'stress_level' => 'nullable|integer|between:1,10',
            'sleep_quality' => 'nullable|integer|between:1,10',
            'notes' => 'nullable|string|max:1000',
            'details' => 'nullable|string|max:2000',
            'activities' => 'nullable|array',
            'activities.*' => 'string|max:100',
            'emotions' => 'nullable|array',
            'emotions.*' => 'string|max:50',
        ]);

        // Forcer le format de la date à YYYY-MM-DD
        if (isset($validated['date'])) {
            $validated['date'] = date('Y-m-d', strtotime($validated['date']));
        }
        // Si on doit utiliser employee_id mais qu'il n'y a pas de mapping, créer automatiquement un mapping minimal (surtout utile en local)
        if ($ownerCol === 'employee_id' && empty($ownerId)) {
            $newId = $this->ensureEmployeeMapping($user->id);
            if ($newId) {
                $ownerId = $newId;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Aucun profil employé lié à l'utilisateur."
                ], 422);
            }
        }

        // Adapter dynamiquement le payload aux colonnes réellement présentes
        $validated = $this->mapMoodPayload($validated, $ownerCol);

        try {
            // Fallback: s'assurer que activities et emotions sont bien des arrays
            if (isset($validated['activities']) && !is_array($validated['activities'])) {
                $validated['activities'] = (array) $validated['activities'];
            }
            if (isset($validated['emotions']) && !is_array($validated['emotions'])) {
                $validated['emotions'] = (array) $validated['emotions'];
            }

            // Retirer 'details' si colonne manquante
            if (!Schema::hasColumn('mood_entries', 'details')) {
                unset($validated['details']);
            }

            // Vérifier si une entrée existe déjà pour cette date
            $existingEntry = MoodEntry::where($ownerCol, $ownerId)
                ->whereDate('date', $validated['date'])
                ->first();

            if ($existingEntry) {
                $existingEntry->update($validated);
                $entry = $existingEntry;
                $message = 'Entrée d\'humeur mise à jour avec succès';
            } else {
                $payload = [$ownerCol => $ownerId, ...$validated];
                $entry = MoodEntry::create($payload);
                $message = 'Entrée d\'humeur enregistrée avec succès';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'entry' => $entry
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'enregistrement MoodEntry: ' . $e->getMessage(), [
                'exception' => $e,
                'validated' => $validated
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer une entrée spécifique
     */
    public function show($id)
    {
        $user = Auth::user();
        [$ownerCol, $ownerId] = $this->resolveOwner($user->id);

        $entry = MoodEntry::where($ownerCol, $ownerId)
            ->where('id', $id)
            ->first();

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => 'Entrée non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'entry' => $entry
        ]);
    }

    /**
     * Récupérer l'entrée du jour
     */
    public function today()
    {
        $user = Auth::user();
        [$ownerCol, $ownerId] = $this->resolveOwner($user->id);

        $entry = MoodEntry::where($ownerCol, $ownerId)
            ->where('date', now()->toDateString())
            ->first();

        return response()->json([
            'success' => true,
            'entry' => $entry,
            'has_entry_today' => $entry !== null
        ]);
    }

    /**
     * Statistiques rapides pour le dashboard
     */
    public function quickStats()
    {
        $user = Auth::user();
        [$ownerCol, $ownerId] = $this->resolveOwner($user->id);

        $moodCol = Schema::hasColumn('mood_entries', 'mood_level')
            ? 'mood_level'
            : (Schema::hasColumn('mood_entries', 'mood') ? 'mood' : null);

        $weeklyAvg = $moodCol
            ? MoodEntry::where($ownerCol, $ownerId)
            ->where('date', '>=', now()->subDays(7))
            ->avg($moodCol)
            : 0;
        $monthlyAvg = $moodCol
            ? MoodEntry::where($ownerCol, $ownerId)
            ->where('date', '>=', now()->subDays(30))
            ->avg($moodCol)
            : 0;

        $streak = $this->calculateStreak($ownerCol, $ownerId);

        $recentEntries = MoodEntry::where($ownerCol, $ownerId)
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'weekly_average' => round($weeklyAvg, 1),
                'monthly_average' => round($monthlyAvg, 1),
                'current_streak' => $streak,
                'total_entries' => MoodEntry::where($ownerCol, $ownerId)->count(),
                'recent_trend' => $this->calculateTrend($recentEntries)
            ]
        ]);
    }

    /**
     * Calculer la série de jours consécutifs avec entrées
     */
    private function calculateStreak(string $ownerCol, int $ownerId)
    {
        $entries = MoodEntry::where($ownerCol, $ownerId)
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->toArray();

        if (empty($entries)) {
            return 0;
        }

        $streak = 0;
        $currentDate = now()->toDateString();

        foreach ($entries as $entryDate) {
            if ($entryDate === $currentDate) {
                $streak++;
                $currentDate = now()->subDays($streak)->toDateString();
            } else {
                break;
            }
        }

        return $streak;
    }

    /**
     * Calculer la tendance (positive, négative, stable)
     */
    private function calculateTrend($entries)
    {
        if ($entries->count() < 2) {
            return 'insufficient_data';
        }

        $recent = $entries->take(3)->avg('mood_level');
        $older = $entries->skip(3)->take(4)->avg('mood_level');

        $difference = $recent - $older;

        if ($difference > 0.5) {
            return 'improving';
        } elseif ($difference < -0.5) {
            return 'declining';
        } else {
            return 'stable';
        }
    }

    /**
     * Remappe et nettoie dynamiquement les champs en fonction des colonnes existantes.
     */
    private function mapMoodPayload(array $validated, string $ownerCol): array
    {
        $columns = Schema::getColumnListing('mood_entries');

        // Remapping de noms potentiels si les colonnes standards n'existent pas
        $map = [
            'mood_level' => in_array('mood_level', $columns, true) ? 'mood_level' : (in_array('mood', $columns, true) ? 'mood' : null),
            'energy_level' => in_array('energy_level', $columns, true) ? 'energy_level' : (in_array('energy', $columns, true) ? 'energy' : null),
            'stress_level' => in_array('stress_level', $columns, true) ? 'stress_level' : (in_array('stress', $columns, true) ? 'stress' : null),
            'sleep_quality' => in_array('sleep_quality', $columns, true) ? 'sleep_quality' : (in_array('sleep', $columns, true) ? 'sleep' : null),
            'mood_emoji' => in_array('mood_emoji', $columns, true) ? 'mood_emoji' : (in_array('emoji', $columns, true) ? 'emoji' : null),
            'notes' => in_array('notes', $columns, true) ? 'notes' : (in_array('comment', $columns, true) ? 'comment' : null),
            'details' => in_array('details', $columns, true) ? 'details' : null,
            'activities' => in_array('activities', $columns, true) ? 'activities' : null,
            'emotions' => in_array('emotions', $columns, true) ? 'emotions' : null,
            'date' => in_array('date', $columns, true) ? 'date' : null,
        ];

        $result = [];
        foreach ($validated as $key => $value) {
            $target = $map[$key] ?? null;
            if ($target) {
                $result[$target] = $value;
            }
        }

        // Assurer la présence de la date si colonne disponible
        if (!isset($result['date']) && in_array('date', $columns, true) && isset($validated['date'])) {
            $result['date'] = $validated['date'];
        }

        // Nettoyage type: convertir tableaux en JSON si la colonne est de type text/varchar (au cas où)
        foreach (['activities', 'emotions'] as $jsonish) {
            if (isset($result[$jsonish]) && is_array($result[$jsonish])) {
                // Laisser en array: Eloquent cast gèrera si la colonne est JSON; sinon fallback string JSON
                if (!Schema::hasColumn('mood_entries', $jsonish)) {
                    unset($result[$jsonish]);
                }
            }
        }

        // Retirer 'details' si colonne manquante
        if (!Schema::hasColumn('mood_entries', 'details')) {
            unset($result['details']);
        }

        return $result;
    }

    /**
     * Crée un mapping minimal dans employees pour l'utilisateur si absent.
     * Retourne l'ID employé créé/trouvé, ou null en cas d'échec.
     */
    private function ensureEmployeeMapping(int $userId): ?int
    {
        if (!Schema::hasTable('employees')) {
            return null;
        }
        $existing = DB::table('employees')->where('user_id', $userId)->value('id');
        if ($existing) return (int)$existing;

        // Préparer insert minimal
        $data = ['user_id' => $userId];
        $empColumns = Schema::getColumnListing('employees');

        // Récupérer nullability pour employees depuis INFORMATION_SCHEMA
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
        } catch (\Throwable $e) {
            $dbName = null;
        }
        $nullable = [];
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

        // Champs texte potentiels requis
        foreach (['first_name', 'last_name', 'name'] as $col) {
            if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                $data[$col] = '';
            }
        }

        // Champs numériques potentiels
        foreach (['salary', 'age'] as $col) {
            if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                $data[$col] = 0;
            }
        }

        // Si users a une entreprise_id, l'utiliser en priorité
        if (in_array('entreprise_id', $empColumns, true) && Schema::hasColumn('users', 'entreprise_id')) {
            try {
                $userEntrepriseId = DB::table('users')->where('id', $userId)->value('entreprise_id');
                if ($userEntrepriseId) {
                    $data['entreprise_id'] = $userEntrepriseId;
                }
            } catch (\Throwable $e) { /* ignore */
            }
        }

        // FKs: entreprise_id / department_id si non nullables, tenter de récupérer une valeur existante
        $fkSources = [
            'entreprise_id' => ['entreprises', 'enterprise', 'companies', 'organizations', 'organisations', 'businesses'],
            'department_id' => ['departments', 'departements', 'teams'],
        ];
        foreach ($fkSources as $fkCol => $candidates) {
            if (in_array($fkCol, $empColumns, true)) {
                $value = $data[$fkCol] ?? null;
                foreach ($candidates as $table) {
                    if (!$value && Schema::hasTable($table)) {
                        $value = DB::table($table)->value('id');
                        if ($value) break;
                    }
                }
                if ($value) {
                    $data[$fkCol] = $value;
                } else {
                    // si nullable on laisse null, sinon mettre 1 en dernier recours
                    if (isset($nullable[$fkCol]) && !$nullable[$fkCol]['nullable']) {
                        $data[$fkCol] = 1; // best-effort, peut échouer si pas d’ID 1
                    }
                }
            }
        }

        if (in_array('created_at', $empColumns, true)) $data['created_at'] = now();
        if (in_array('updated_at', $empColumns, true)) $data['updated_at'] = now();
        try {
            $id = DB::table('employees')->insertGetId($data);
            return (int)$id;
        } catch (\Throwable $e) {
            // Journaliser pour debug
            Log::warning('Échec ensureEmployeeMapping', ['user_id' => $userId, 'error' => $e->getMessage(), 'payload' => $data]);
            return null;
        }
    }

    /**
     * Resolve the ownership column and id to use on mood_entries.
     * Prefer user_id if present; fallback to employee_id by mapping from employees table.
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
        // Default to user_id to keep behavior; queries will just return empty if column mismatch persists
        return ['user_id', $currentUserId];
    }
}
