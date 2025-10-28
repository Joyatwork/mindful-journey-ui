<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class EntrepriseController extends Controller
{
    /**
     * Liste les entreprises (pour le formulaire d'inscription)
     */
    public function index(Request $request)
    {
        if (!Schema::hasTable('entreprises')) {
            return response()->json(['items' => []]);
        }

        $q = trim((string) $request->query('q', ''));
        $query = DB::table('entreprises')->select(['id', 'name']);
        if ($q !== '') {
            $query->where('name', 'like', '%' . $q . '%');
        }
        $items = $query->orderBy('name')->limit(200)->get();

        return response()->json(['items' => $items]);
    }

    /**
     * (DEV) Crée quelques entreprises exemples si la table existe et est vide
     */
    public function seed(Request $request)
    {
        if (!Schema::hasTable('entreprises')) {
            return response()->json(['success' => false, 'message' => "La table 'entreprises' est absente"], 400);
        }

        $count = DB::table('entreprises')->count();
        if ($count > 0) {
            return response()->json(['success' => true, 'message' => 'Déjà des entreprises présentes']);
        }

        $now = now();
        DB::table('entreprises')->insert([
            ['name' => 'Acme SA', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Globex SARL', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Initech SAS', 'created_at' => $now, 'updated_at' => $now],
        ]);

        return response()->json(['success' => true, 'message' => 'Entreprises de test créées']);
    }

    /**
     * (DEV) Crée des sites par défaut afin de satisfaire les FKs (ex: employees.site_id)
     * - Si sites.entreprise_id est NOT NULL: crée 1 site par entreprise existante
     * - Sinon: crée au moins un site générique "Site Principal"
     */
    public function seedSites(Request $request)
    {
        if (!Schema::hasTable('sites')) {
            return response()->json(['success' => false, 'message' => "La table 'sites' est absente"], 400);
        }

        $columns = Schema::getColumnListing('sites');
        $now = now();

        // Récupérer nullabilité des colonnes depuis INFORMATION_SCHEMA
        $nullable = [];
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            if ($dbName) {
                $rows = DB::select('SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [$dbName, 'sites']);
                foreach ($rows as $r) {
                    $nullable[$r->COLUMN_NAME] = ($r->IS_NULLABLE === 'YES');
                }
            }
        } catch (\Throwable $e) { /* ignore */
        }

        $requiresEntreprise = in_array('entreprise_id', $columns, true) && (isset($nullable['entreprise_id']) ? !$nullable['entreprise_id'] : false);

        $toInsert = [];
        if ($requiresEntreprise) {
            if (!Schema::hasTable('entreprises')) {
                return response()->json(['success' => false, 'message' => "'sites.entreprise_id' est NOT NULL mais la table 'entreprises' est absente"], 400);
            }
            $entrepriseIds = DB::table('entreprises')->pluck('id')->all();
            if (empty($entrepriseIds)) {
                return response()->json(['success' => false, 'message' => "Aucune entreprise trouvée. Veuillez d'abord créer/seed des entreprises."], 400);
            }
            foreach ($entrepriseIds as $eid) {
                $row = [];
                if (in_array('entreprise_id', $columns, true)) $row['entreprise_id'] = $eid;
                if (in_array('name', $columns, true)) $row['name'] = 'Site ' . $eid . ' - Siège';
                if (in_array('address', $columns, true)) $row['address'] = '';
                if (in_array('city', $columns, true)) $row['city'] = '';
                if (in_array('country', $columns, true)) $row['country'] = '';
                if (in_array('created_at', $columns, true)) $row['created_at'] = $now;
                if (in_array('updated_at', $columns, true)) $row['updated_at'] = $now;
                $toInsert[] = $row;
            }
        } else {
            // Créer au moins un site générique
            $row = [];
            if (in_array('name', $columns, true)) $row['name'] = 'Site Principal';
            if (in_array('address', $columns, true)) $row['address'] = '';
            if (in_array('city', $columns, true)) $row['city'] = '';
            if (in_array('country', $columns, true)) $row['country'] = '';
            if (in_array('created_at', $columns, true)) $row['created_at'] = $now;
            if (in_array('updated_at', $columns, true)) $row['updated_at'] = $now;
            $toInsert[] = $row;
        }

        // Ne pas dupliquer si des sites existent déjà
        $existing = DB::table('sites')->count();
        if ($existing > 0) {
            return response()->json(['success' => true, 'message' => 'Sites déjà présents', 'count' => $existing]);
        }

        DB::table('sites')->insert($toInsert);
        $count = DB::table('sites')->count();
        $sample = DB::table('sites')->limit(5)->get();
        return response()->json(['success' => true, 'inserted' => count($toInsert), 'count' => $count, 'sample' => $sample]);
    }

    /**
     * Liste les membres (users et employees) d'une entreprise donnée
     */
    public function members(Request $request, int $id)
    {
        if (!Schema::hasTable('entreprises')) {
            return response()->json(['success' => false, 'message' => "La table 'entreprises' est absente"], 400);
        }

        $entreprise = DB::table('entreprises')->where('id', $id)->first();
        if (!$entreprise) {
            return response()->json(['success' => false, 'message' => 'Entreprise introuvable'], 404);
        }

        $users = Schema::hasTable('users') && Schema::hasColumn('users', 'entreprise_id')
            ? DB::table('users')->where('entreprise_id', $id)->select('id', 'name', 'email', 'created_at')->get()
            : collect();
        $employees = Schema::hasTable('employees') && Schema::hasColumn('employees', 'entreprise_id')
            ? DB::table('employees')->where('entreprise_id', $id)->select('id', 'user_id', 'created_at')->get()
            : collect();

        return response()->json([
            'success' => true,
            'entreprise' => $entreprise,
            'users' => $users,
            'employees' => $employees,
            'counts' => [
                'users' => $users->count(),
                'employees' => $employees->count(),
            ]
        ]);
    }

    /**
     * (DEV) Liste rapide des sites (id, name) pour vérification
     */
    public function listSites(Request $request)
    {
        if (!Schema::hasTable('sites')) {
            return response()->json(['items' => []]);
        }
        $items = DB::table('sites')->select(['id', DB::raw(in_array('name', Schema::getColumnListing('sites'), true) ? 'name' : "'' as name")])->orderBy('id')->limit(200)->get();
        return response()->json(['items' => $items]);
    }

    /**
     * (DEV) Seed d'employés en masse pour les utilisateurs sans entrée employees
     * - Lie automatiquement entreprise_id depuis users.entreprise_id
     * - Associe un site_id existant (même entreprise si possible)
     * - Remplit les champs RH avec des valeurs par défaut
     */
    public function seedEmployees(Request $request)
    {
        if (!Schema::hasTable('employees')) {
            return response()->json(['success' => false, 'message' => "La table 'employees' est absente"], 400);
        }
        if (!Schema::hasTable('users')) {
            return response()->json(['success' => false, 'message' => "La table 'users' est absente"], 400);
        }

        $empCols = Schema::getColumnListing('employees');

        // Lire nullabilité pour éviter les violations NOT NULL
        $nullable = [];
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            if ($dbName) {
                $rows = DB::select('SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [$dbName, 'employees']);
                foreach ($rows as $r) {
                    $nullable[$r->COLUMN_NAME] = [
                        'nullable' => ($r->IS_NULLABLE === 'YES'),
                        'type' => $r->DATA_TYPE
                    ];
                }
            }
        } catch (\Throwable $e) { /* ignore */
        }

        // Vérifier si site_id est requis et s'il existe des sites
        $siteRequired = in_array('site_id', $empCols, true) && (isset($nullable['site_id']) && !$nullable['site_id']['nullable']);
        $sitesTableExists = Schema::hasTable('sites');
        if ($siteRequired && (!$sitesTableExists || DB::table('sites')->count() === 0)) {
            return response()->json([
                'success' => false,
                'message' => "Aucun site disponible alors que employees.site_id est NOT NULL. Veuillez seed les sites via /api/test/db/sites/seed."
            ], 400);
        }

        // Préparer une map entreprise_id -> site_id (premier site de l'entreprise)
        $siteByEntreprise = [];
        if ($sitesTableExists) {
            $siteCols = Schema::getColumnListing('sites');
            $sites = DB::table('sites')->select(['id', in_array('entreprise_id', $siteCols, true) ? 'entreprise_id' : DB::raw('NULL as entreprise_id')])->get();
            foreach ($sites as $s) {
                if (!isset($siteByEntreprise[$s->entreprise_id])) {
                    $siteByEntreprise[$s->entreprise_id] = $s->id;
                }
            }
            // Fallback générique
            $anySiteId = $sites->first()->id ?? null;
            $siteByEntreprise[0] = $anySiteId;
        }

        $existingUserIds = DB::table('employees')->pluck('user_id')->all();
        $usersQuery = DB::table('users')->select(['id']);
        if (Schema::hasColumn('users', 'entreprise_id')) {
            $usersQuery = DB::table('users')->select(['id', 'entreprise_id']);
        }
        if (!empty($existingUserIds)) {
            $usersQuery->whereNotIn('id', $existingUserIds);
        }
        $users = $usersQuery->limit(500)->get();

        if ($users->isEmpty()) {
            return response()->json(['success' => true, 'message' => 'Aucun nouvel utilisateur à mapper', 'inserted' => 0]);
        }

        $now = now();
        $inserted = 0;
        $skipped = 0;
        $errors = [];

        foreach ($users as $u) {
            try {
                $row = ['user_id' => $u->id];

                // entreprise_id
                if (in_array('entreprise_id', $empCols, true)) {
                    $entId = property_exists($u, 'entreprise_id') ? ($u->entreprise_id ?? null) : null;
                    if (!$entId && isset($nullable['entreprise_id']) && !$nullable['entreprise_id']['nullable']) {
                        // Entreprise requise mais introuvable
                        $skipped++;
                        $errors[] = ['user_id' => $u->id, 'reason' => 'Entreprise requise manquante'];
                        continue;
                    }
                    if ($entId) $row['entreprise_id'] = $entId;
                }

                // site_id
                if ($sitesTableExists && in_array('site_id', $empCols, true)) {
                    $entKey = (int)($row['entreprise_id'] ?? 0);
                    $siteId = $siteByEntreprise[$entKey] ?? $siteByEntreprise[0] ?? null;
                    if ($siteRequired && !$siteId) {
                        $skipped++;
                        $errors[] = ['user_id' => $u->id, 'reason' => 'Aucun site disponible'];
                        continue;
                    }
                    if ($siteId) $row['site_id'] = $siteId;
                }

                // Champs RH
                if (in_array('employee_number', $empCols, true)) $row['employee_number'] = 'E-' . $u->id . '-' . substr((string) time(), -5);
                if (in_array('department', $empCols, true)) $row['department'] = '';
                if (in_array('position_title', $empCols, true)) $row['position_title'] = '';
                if (in_array('employment_status', $empCols, true)) $row['employment_status'] = 'active';
                if (in_array('current_risk_level', $empCols, true)) $row['current_risk_level'] = 'stable';
                if (in_array('current_risk_score', $empCols, true)) $row['current_risk_score'] = 0;
                if (in_array('date_hired', $empCols, true)) $row['date_hired'] = $now->toDateString();
                if (in_array('last_activity_at', $empCols, true)) $row['last_activity_at'] = $now;

                // manager_id: ne renseigner que si un manager existe déjà; sinon, laisser null/omise
                if (in_array('manager_id', $empCols, true)) {
                    $manager = DB::table('employees')->value('id');
                    if ($manager) {
                        $row['manager_id'] = $manager;
                    } else if (isset($nullable['manager_id']) && !$nullable['manager_id']['nullable']) {
                        // Si NOT NULL et aucun manager disponible, on ne peut pas insérer proprement
                        $skipped++;
                        $errors[] = ['user_id' => $u->id, 'reason' => 'manager_id NOT NULL mais aucun manager existant'];
                        continue;
                    }
                }

                if (in_array('created_at', $empCols, true)) $row['created_at'] = $now;
                if (in_array('updated_at', $empCols, true)) $row['updated_at'] = $now;

                DB::table('employees')->insert($row);
                $inserted++;
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = ['user_id' => $u->id, 'error' => $e->getMessage()];
            }
        }

        $sample = DB::table('employees')->orderByDesc('id')->limit(5)->get();
        return response()->json([
            'success' => true,
            'inserted' => $inserted,
            'skipped' => $skipped,
            'sample' => $sample,
            'hint' => 'Si vous voyez des skips liés à site_id, appelez POST /api/test/db/sites/seed d\'abord.'
        ]);
    }
}
