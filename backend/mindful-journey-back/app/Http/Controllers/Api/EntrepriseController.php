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

        // Rendre la sélection robuste selon les colonnes disponibles
        $cols = Schema::getColumnListing('entreprises');
        $candidates = ['name', 'nom', 'raison_sociale', 'company_name', 'title'];
        $selected = null;
        foreach ($candidates as $c) {
            if (in_array($c, $cols, true)) { $selected = $c; break; }
        }

        $query = DB::table('entreprises')->select(['id']);
        if ($selected) {
            // Alias uniforme "name"
            $query->addSelect(DB::raw($selected . ' as name'));
            if ($q !== '') {
                $query->where($selected, 'like', '%' . $q . '%');
            }
            $query->orderBy($selected);
        } else {
            // Aucun champ nom trouvé: exposer un libellé générique
            $query->addSelect(DB::raw("CONCAT('Entreprise ', id) as name"));
            if ($q !== '') {
                // Pas de colonne textuelle fiable: filtrer par id si q est numérique
                if (ctype_digit($q)) {
                    $query->where('id', (int)$q);
                }
            }
            $query->orderBy('id');
        }

        $items = $query->limit(200)->get();

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

    /**
     * (DEV) Seed de praticiens (practitioners) à partir des users existants.
     * - Crée des entrées dans practitioners pour des users n'ayant pas encore de practitioner
     * - Renseigne entreprise_id, specialty, license_number, bio
     */
    public function seedPractitioners(Request $request)
    {
        if (!Schema::hasTable('practitioners')) {
            return response()->json(['success' => false, 'message' => "La table 'practitioners' est absente"], 400);
        }
        if (!Schema::hasTable('users')) {
            return response()->json(['success' => false, 'message' => "La table 'users' est absente"], 400);
        }

        $pCols = Schema::getColumnListing('practitioners');

        // Lire nullabilité des colonnes pour éviter les violations NOT NULL
        $nullable = [];
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            if ($dbName) {
                $rows = DB::select('SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [$dbName, 'practitioners']);
                foreach ($rows as $r) {
                    $nullable[$r->COLUMN_NAME] = ($r->IS_NULLABLE === 'YES');
                }
            }
        } catch (\Throwable $e) { /* ignore */
        }

        // Préparer des spécialités plausibles
        $specialties = [
            'Psychologue',
            'Nutritionniste',
            'Coach bien-être',
            'Sophrologue',
            'Kinésithérapeute',
            'Méditation',
            'Somnologue',
            'Ergothérapeute',
            'Diététicien',
            'Hypnothérapeute'
        ];

        // Récupérer les users qui n'ont pas encore de practitioner
        $existingUserIds = DB::table('practitioners')->pluck('user_id')->filter()->all();
        $usersQuery = DB::table('users')->select(['id']);
        $hasUserEntreprise = Schema::hasColumn('users', 'entreprise_id');
        if ($hasUserEntreprise) {
            $usersQuery = DB::table('users')->select(['id', 'entreprise_id']);
        }
        if (!empty($existingUserIds)) {
            $usersQuery->whereNotIn('id', $existingUserIds);
        }

        // Limiter pour éviter l'insertion massive involontaire
        $users = $usersQuery->limit((int) $request->query('limit', 20))->get();
        if ($users->isEmpty()) {
            return response()->json(['success' => true, 'message' => 'Aucun nouvel utilisateur éligible', 'inserted' => 0]);
        }

        // Entreprises disponibles (si la colonne entreprise_id est requise)
        $entrepriseRequired = in_array('entreprise_id', $pCols, true) && (isset($nullable['entreprise_id']) ? !$nullable['entreprise_id'] : false);
        $anyEntrepriseId = null;
        if (Schema::hasTable('entreprises')) {
            $anyEntrepriseId = DB::table('entreprises')->value('id');
        }
        if ($entrepriseRequired && !$anyEntrepriseId && !$hasUserEntreprise) {
            return response()->json(['success' => false, 'message' => "Aucune entreprise disponible alors que practitioners.entreprise_id est NOT NULL"], 400);
        }

        $now = now();
        $inserted = 0;
        $skipped = 0;
        $errors = [];

        foreach ($users as $u) {
            try {
                $row = [
                    'user_id' => $u->id,
                ];

                // entreprise_id: préférer users.entreprise_id si présent, sinon une entreprise quelconque
                if (in_array('entreprise_id', $pCols, true)) {
                    $entId = $hasUserEntreprise ? ($u->entreprise_id ?? null) : null;
                    if (!$entId) $entId = $anyEntrepriseId;
                    if (!$entId && $entrepriseRequired) {
                        $skipped++;
                        $errors[] = ['user_id' => $u->id, 'reason' => 'Aucune entreprise disponible'];
                        continue;
                    }
                    if ($entId) $row['entreprise_id'] = $entId;
                }

                if (in_array('specialty', $pCols, true)) {
                    $row['specialty'] = $specialties[array_rand($specialties)];
                }
                if (in_array('license_number', $pCols, true)) {
                    $row['license_number'] = 'LIC-' . $u->id . '-' . substr((string) time(), -5);
                }
                if (in_array('bio', $pCols, true)) {
                    $row['bio'] = 'Praticien expérimenté dédié au bien-être au travail et à la santé mentale.';
                }
                if (in_array('created_at', $pCols, true)) $row['created_at'] = $now;
                if (in_array('updated_at', $pCols, true)) $row['updated_at'] = $now;

                DB::table('practitioners')->insert($row);
                $inserted++;
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = ['user_id' => $u->id, 'error' => $e->getMessage()];
            }
        }

        $sample = DB::table('practitioners')->orderByDesc('id')->limit(5)->get();
        return response()->json([
            'success' => true,
            'inserted' => $inserted,
            'skipped' => $skipped,
            'sample' => $sample,
            'hint' => 'Vous pouvez contrôler le volume via le paramètre ?limit=NN'
        ]);
    }

    /**
     * (DEV) Seed de services de base pour les schémas possibles.
     * - services: name, description, price_cents, duration_minutes
     * - appointment_services: label, code, default_duration_min, default_price_cents, entreprise_id
     */
    public function seedServices(Request $request)
    {
        $now = now();
        $base = [
            [
                'name' => 'Consultation Psychologue',
                'description' => 'Séance de 45 min avec un psychologue certifié.',
                'price_cents' => 6000,
                'duration_minutes' => 45,
                'code' => 'PSY45',
                'label' => 'Consultation Psychologue',
                'default_duration_min' => 45,
                'default_price_cents' => 6000,
            ],
            [
                'name' => 'Coaching Bien-être',
                'description' => 'Accompagnement bien-être personnalisé (30 min).',
                'price_cents' => 4000,
                'duration_minutes' => 30,
                'code' => 'COACH30',
                'label' => 'Coaching Bien-être',
                'default_duration_min' => 30,
                'default_price_cents' => 4000,
            ],
            [
                'name' => 'Bilan Nutritionnel',
                'description' => 'Évaluation initiale et conseils nutrition (60 min).',
                'price_cents' => 8000,
                'duration_minutes' => 60,
                'code' => 'NUTRI60',
                'label' => 'Bilan Nutritionnel',
                'default_duration_min' => 60,
                'default_price_cents' => 8000,
            ],
        ];

        $result = ['success' => true];

        // Seed table `services` si présente
        if (Schema::hasTable('services')) {
            $cols = Schema::getColumnListing('services');
            $existing = DB::table('services')->count();
            if ($existing === 0) {
                $toInsert = [];
                foreach ($base as $row) {
                    $payload = [];
                    if (in_array('name', $cols, true)) $payload['name'] = $row['name'];
                    if (in_array('description', $cols, true)) $payload['description'] = $row['description'];
                    if (in_array('price_cents', $cols, true)) $payload['price_cents'] = $row['price_cents'];
                    if (in_array('duration_minutes', $cols, true)) $payload['duration_minutes'] = $row['duration_minutes'];
                    if (in_array('created_at', $cols, true)) $payload['created_at'] = $now;
                    if (in_array('updated_at', $cols, true)) $payload['updated_at'] = $now;
                    $toInsert[] = $payload;
                }
                if (!empty($toInsert)) DB::table('services')->insert($toInsert);
            }
            $result['services_count'] = DB::table('services')->count();
        } else {
            $result['services'] = 'absent';
        }

        // Seed table `appointment_services` si présente
        if (Schema::hasTable('appointment_services')) {
            $cols = Schema::getColumnListing('appointment_services');
            $existing = DB::table('appointment_services')->count();
            if ($existing === 0) {
                // Entreprise requise
                $entrepriseId = null;
                if (Schema::hasTable('entreprises')) {
                    $entrepriseId = DB::table('entreprises')->value('id');
                }
                if (in_array('entreprise_id', $cols, true) && !$entrepriseId) {
                    return response()->json(['success' => false, 'message' => "Aucune entreprise disponible pour peupler 'appointment_services'"], 400);
                }

                $toInsert = [];
                foreach ($base as $row) {
                    $payload = [];
                    if (in_array('entreprise_id', $cols, true)) $payload['entreprise_id'] = $entrepriseId;
                    if (in_array('code', $cols, true)) $payload['code'] = $row['code'];
                    if (in_array('label', $cols, true)) $payload['label'] = $row['label'];
                    if (in_array('default_duration_min', $cols, true)) $payload['default_duration_min'] = $row['default_duration_min'];
                    if (in_array('default_price_cents', $cols, true)) $payload['default_price_cents'] = $row['default_price_cents'];
                    if (in_array('created_at', $cols, true)) $payload['created_at'] = $now;
                    if (in_array('updated_at', $cols, true)) $payload['updated_at'] = $now;
                    $toInsert[] = $payload;
                }
                if (!empty($toInsert)) DB::table('appointment_services')->insert($toInsert);
            }
            $result['appointment_services_count'] = DB::table('appointment_services')->count();
        } else {
            $result['appointment_services'] = 'absent';
        }

        return response()->json($result);
    }

    /**
     * (DEV) Seed des liaisons praticien→service si les tables existent.
     * Supporte les conventions `practitioner_services` (practitioner_id, service_id)
     * ou `specialist_services` (specialist_id, service_id) suivant les schémas.
     */
    public function seedPractitionerServices(Request $request)
    {
        $linkTable = null;
        $practFk = null;
        if (Schema::hasTable('practitioner_services')) {
            $linkTable = 'practitioner_services';
            $practFk = 'practitioner_id';
        } elseif (Schema::hasTable('specialist_services')) {
            $linkTable = 'specialist_services';
            $practFk = 'specialist_id';
        } else {
            return response()->json(['success' => false, 'message' => "Table de liaison praticien↔service absente (practitioner_services/specialist_services)"], 400);
        }

        if (!Schema::hasTable('practitioners')) {
            return response()->json(['success' => false, 'message' => "La table 'practitioners' est absente"], 400);
        }
        if (!Schema::hasTable('services')) {
            return response()->json(['success' => false, 'message' => "La table 'services' est absente"], 400);
        }

        $serviceId = DB::table('services')->value('id');
        if (!$serviceId) {
            return response()->json(['success' => false, 'message' => 'Aucun service disponible; appelez d’abord /api/test/db/services/seed'], 400);
        }

        $practIds = DB::table('practitioners')->pluck('id')->all();
        if (empty($practIds)) {
            return response()->json(['success' => false, 'message' => 'Aucun praticien trouvé'], 400);
        }

        $existing = DB::table($linkTable)->pluck($practFk)->all();
        $toInsert = [];
        $now = now();
        $linkCols = Schema::getColumnListing($linkTable);
        foreach ($practIds as $pid) {
            if (in_array($pid, $existing, true)) continue; // ne pas dupliquer
            $row = [
                $practFk => $pid,
                'service_id' => $serviceId,
            ];
            if (in_array('created_at', $linkCols, true)) $row['created_at'] = $now;
            if (in_array('updated_at', $linkCols, true)) $row['updated_at'] = $now;
            $toInsert[] = $row;
        }

        if (!empty($toInsert)) DB::table($linkTable)->insert($toInsert);

        $count = DB::table($linkTable)->count();
        $sample = DB::table($linkTable)->orderByDesc($practFk)->limit(5)->get();
        return response()->json([
            'success' => true,
            'inserted' => count($toInsert),
            'link_table' => $linkTable,
            'count' => $count,
            'sample' => $sample,
        ]);
    }
}
