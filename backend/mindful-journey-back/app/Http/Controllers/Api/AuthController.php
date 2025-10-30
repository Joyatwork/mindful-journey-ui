<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\LoginOtp;
use App\Mail\TwoFactorCodeMail;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(Request $request): JsonResponse
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ];
        // Si la table entreprises existe, rendre le choix d'entreprise obligatoire
        if (Schema::hasTable('entreprises')) {
            $rules['entreprise_id'] = 'required|integer|exists:entreprises,id';
        }
        $request->validate($rules);

        $hashed = Hash::make($request->password);
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => $hashed,
        ];
        // Compatibilité schéma hérité: si password_hash existe et est NOT NULL, le remplir aussi
        try {
            if (Schema::hasColumn('users', 'password_hash')) {
                $data['password_hash'] = $hashed;
            }
            // Renseigner first_name / last_name si ces colonnes existent encore
            if (Schema::hasColumn('users', 'first_name')) {
                $parts = preg_split('/\s+/', trim($request->name));
                $data['first_name'] = $parts[0] ?? $request->name;
                if (Schema::hasColumn('users', 'last_name')) {
                    $data['last_name'] = isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : null;
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // Lier l'entreprise à l'utilisateur si la colonne existe
        $entrepriseId = null;
        try {
            if (Schema::hasTable('entreprises') && $request->filled('entreprise_id')) {
                $entrepriseId = (int) $request->entreprise_id;
                if (Schema::hasColumn('users', 'entreprise_id')) {
                    $data['entreprise_id'] = $entrepriseId;
                }
            }
        } catch (\Throwable $e) { /* ignore */
        }

        $user = User::create($data);

        // Créer automatiquement le profil employé lié à l'entreprise choisie
        try {
            if ($entrepriseId && Schema::hasTable('employees')) {
                $this->createEmployeeForUser($user->id, $entrepriseId);
            }
        } catch (\Throwable $e) {
            Log::warning('register: création employee échouée', ['user_id' => $user->id, 'entreprise_id' => $entrepriseId, 'error' => $e->getMessage()]);
        }

        // Créer un token Sanctum pour l'utilisateur
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Crée une entrée employees pour l'utilisateur avec l'entreprise donnée, en remplissant les champs requis.
     */
    private function createEmployeeForUser(int $userId, int $entrepriseId): void
    {
        if (!Schema::hasTable('employees')) return;

        // Ne pas dupliquer si déjà mappé
        $exists = DB::table('employees')->where('user_id', $userId)->exists();
        if ($exists) return;

        $empColumns = Schema::getColumnListing('employees');
        $data = ['user_id' => $userId];
        if (in_array('entreprise_id', $empColumns, true)) {
            $data['entreprise_id'] = $entrepriseId;
        }

        // Lire nullabilité pour remplir défauts sûrs
        $nullable = [];
        try {
            $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
            if ($dbName) {
                $rows = DB::select('SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [$dbName, 'employees']);
                foreach ($rows as $r) {
                    $nullable[$r->COLUMN_NAME] = [
                        'nullable' => ($r->IS_NULLABLE === 'YES'),
                        'type' => $r->DATA_TYPE,
                    ];
                }
            }
        } catch (\Throwable $e) { /* ignore */
        }

        foreach (['first_name', 'last_name', 'name'] as $col) {
            if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                $data[$col] = '';
            }
        }
        foreach (['salary', 'age'] as $col) {
            if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                $data[$col] = 0;
            }
        }

        // Champs RH usuels
        if (in_array('employee_number', $empColumns, true)) {
            $data['employee_number'] = 'E-' . $userId . '-' . substr((string) time(), -5);
        }
        if (in_array('department', $empColumns, true)) {
            $data['department'] = $data['department'] ?? '';
        }
        if (in_array('position_title', $empColumns, true)) {
            $data['position_title'] = $data['position_title'] ?? '';
        }
        if (in_array('employment_status', $empColumns, true)) {
            $data['employment_status'] = $data['employment_status'] ?? 'active';
        }
        if (in_array('current_risk_level', $empColumns, true)) {
            $data['current_risk_level'] = $data['current_risk_level'] ?? 'stable';
        }
        if (in_array('current_risk_score', $empColumns, true)) {
            $data['current_risk_score'] = $data['current_risk_score'] ?? 0;
        }
        if (in_array('date_hired', $empColumns, true)) {
            $data['date_hired'] = $data['date_hired'] ?? now()->toDateString();
        }
        if (in_array('last_activity_at', $empColumns, true)) {
            $data['last_activity_at'] = $data['last_activity_at'] ?? now();
        }

        // Tenter de satisfaire d'éventuelles FKs NOT NULL courantes (department_id)
        if (in_array('department_id', $empColumns, true) && (isset($nullable['department_id']) && !$nullable['department_id']['nullable'])) {
            $depId = null;
            foreach (['departments', 'departements', 'teams'] as $tbl) {
                if (Schema::hasTable($tbl)) {
                    $depId = DB::table($tbl)->value('id');
                    if ($depId) break;
                }
            }
            $data['department_id'] = $depId ?? 1; // dernier recours 1
        }
        // FKs possibles
        if (in_array('site_id', $empColumns, true)) {
            // Essayer de récupérer un site existant (table sites), sinon 1 en dernier recours si NOT NULL
            $siteId = null;
            if (Schema::hasTable('sites')) {
                $siteId = DB::table('sites')->value('id');
            }
            if ($siteId) {
                $data['site_id'] = $siteId;
            } elseif (isset($nullable['site_id']) && !$nullable['site_id']['nullable']) {
                $data['site_id'] = 1;
            }
        }
        if (in_array('manager_id', $empColumns, true)) {
            // Essayer un manager existant (employees.id), sinon null/1 selon nullabilité
            $mgr = null;
            if (Schema::hasTable('employees')) {
                $mgr = DB::table('employees')->value('id');
            }
            if ($mgr) {
                $data['manager_id'] = $mgr;
            } elseif (isset($nullable['manager_id']) && !$nullable['manager_id']['nullable']) {
                $data['manager_id'] = 1;
            }
        }

        if (in_array('created_at', $empColumns, true)) $data['created_at'] = now();
        if (in_array('updated_at', $empColumns, true)) $data['updated_at'] = now();

        DB::table('employees')->insert($data);
    }

    /**
     * Connexion utilisateur
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ["Les informations d'identification fournies sont incorrectes."],
            ]);
        }

        // Vérifier la préférence 2FA de l'utilisateur (stockée dans preferences)
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        $twoFactorEnabled = $preferences['two_factor_enabled'] ?? true; // par défaut: activé

        // Si 2FA désactivé pour cet utilisateur -> connexion directe sans OTP
        if ($twoFactorEnabled === false) {
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'message' => 'Connexion réussie (2FA désactivé pour cet utilisateur)',
                'user' => $user,
                'token' => $token,
                'two_factor' => false,
            ]);
        }

        // Vérifier que la table login_otps existe (migration appliquée)
        if (!Schema::hasTable('login_otps')) {
            Log::warning('2FA désactivé temporairement: table login_otps absente. Retour au login direct.');
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'message' => 'Connexion réussie (2FA non disponible)',
                'user' => $user,
                'token' => $token,
                'two_factor' => false
            ]);
        }

        // Supprimer anciens OTP expirés ou consommés
        LoginOtp::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('expires_at', '<', now())
                    ->orWhereNotNull('consumed_at');
            })->delete();

        $code = str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);

        $otp = LoginOtp::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new TwoFactorCodeMail($code, config('app.name', 'Mindful Journey')));
        } catch (\Throwable $e) {
            Log::error('Erreur envoi mail 2FA: ' . $e->getMessage());
            // En environnement local/test, ne bloque pas la connexion 2FA: retourne le code dans la réponse
            if (app()->environment('local', 'testing')) {
                Log::warning('2FA DEV MODE: envoi email échoué, on renvoie le code dans la réponse (ne pas activer en prod).', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'code' => $code,
                ]);
                return response()->json([
                    'message' => 'Code généré (mode dev local)',
                    'two_factor' => true,
                    'otp_id' => $otp->id,
                    'expires_in_seconds' => 600,
                    // Champ d’aide au développement: le code est renvoyé pour tests locaux
                    'dev_code' => $code,
                ]);
            }
            return response()->json([
                'message' => "Erreur lors de l'envoi du code, réessayez plus tard."
            ], 500);
        }

        $payload = [
            'message' => 'Code envoyé par email',
            'two_factor' => true,
            'otp_id' => $otp->id,
            'expires_in_seconds' => 600,
        ];
        // En dev local, aider le front en renvoyant aussi le code pour tests rapides
        if (app()->environment('local', 'testing')) {
            $payload['dev_code'] = $code;
        }
        return response()->json($payload);
    }

    /**
     * Vérifie le code OTP et retourne le token final si valide
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'otp_id' => 'required|integer',
            'code' => 'required|string|size:5'
        ]);

        $otp = LoginOtp::find($data['otp_id']);
        if (!$otp) {
            return response()->json(['message' => 'Code introuvable'], 404);
        }

        if ($otp->isConsumed()) {
            return response()->json(['message' => 'Code déjà utilisé'], 400);
        }
        if ($otp->isExpired()) {
            $otp->delete();
            return response()->json(['message' => 'Code expiré'], 400);
        }
        if ($otp->attempts >= 5) {
            $otp->delete();
            return response()->json(['message' => 'Trop de tentatives, recommencez la connexion'], 429);
        }

        if (!hash_equals($otp->code, $data['code'])) {
            $otp->increment('attempts');
            return response()->json([
                'message' => 'Code incorrect',
                'remaining_attempts' => 5 - $otp->attempts
            ], 400);
        }

        $otp->consumed_at = now();
        $otp->save();

        $user = $otp->user;
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion validée',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Déconnexion utilisateur
     */
    public function logout(Request $request): JsonResponse
    {
        // Supprimer le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Obtenir l'utilisateur connecté
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'location' => $preferences['location'] ?? null,
                'birth_date' => $user->birth_date,
                'job_position' => $preferences['job_position'] ?? null,
                'company' => $preferences['company'] ?? null,
                'bio' => $user->bio,
                'goals' => $preferences['goals'] ?? null,
                'two_factor_enabled' => $preferences['two_factor_enabled'] ?? true,
                'notifications_enabled' => $preferences['notifications_enabled'] ?? false,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public function updateProfile(Request $request): JsonResponse
    {
        Log::info('=== DÉBUT UPDATE PROFILE ===');
        Log::info('Données reçues:', $request->all());

        // Use validated data and capture it
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'birthDate' => 'nullable|date',
            'jobPosition' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'goals' => 'nullable|string|max:1000',
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            // Allow providing an external URL as an alternative to file upload
            'avatar_url' => 'nullable|string|url|max:2048'
        ]);

        $user = $request->user();
        Log::info('Utilisateur avant modification:', $user->toArray());

        // Handle avatar upload if present (FormData upload)
        if ($request->hasFile('avatar')) {
            try {
                // Delete old stored avatar if present to avoid orphan files
                if (!empty($user->avatar)) {
                    try { Storage::disk('public')->delete($user->avatar); } catch (\Throwable $e) { /* ignore */ }
                }

                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $avatarPath;
                // Prefer uploaded file over external URL by clearing explicit avatar_url
                $validated['avatar_url'] = null;
                Log::info('AuthController:updateProfile - stored avatar: ' . $avatarPath);
            } catch (\Throwable $e) {
                Log::error('AuthController:updateProfile - avatar storage failed: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Erreur lors de l\'upload de l\'avatar.'], 500);
            }
        }

        // If an explicit avatar_url is provided (and no file upload), keep it
        if (!$request->hasFile('avatar') && isset($validated['avatar_url']) && $validated['avatar_url'] === '') {
            // Normalize empty string to null to avoid storing empty URLs
            $validated['avatar_url'] = null;
        }

        // Normalize camelCase keys to snake_case used in DB / preferences
        if (isset($validated['birthDate'])) {
            $validated['birth_date'] = $validated['birthDate'];
            unset($validated['birthDate']);
        }
        if (isset($validated['jobPosition'])) {
            $validated['job_position'] = $validated['jobPosition'];
            unset($validated['jobPosition']);
        }

        // Merge preferences safely
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        foreach (['location', 'job_position', 'company', 'goals'] as $prefKey) {
            if (array_key_exists($prefKey, $validated)) {
                $preferences[$prefKey] = $validated[$prefKey];
                unset($validated[$prefKey]);
            }
        }

        // Filter validated payload to actual user table columns to avoid SQL errors
        try {
            $userColumns = Schema::getColumnListing('users');
            $allowed = array_intersect_key($validated, array_flip($userColumns));

            // Update allowed user fields
            if (!empty($allowed)) {
                $user->update($allowed);
            }

            // Persist preferences only if the column exists in the users table
            if (in_array('preferences', $userColumns)) {
                $user->preferences = $preferences;
                $user->save();
            } else {
                Log::warning('AuthController:updateProfile - preferences column missing, skipping write to users table', ['user_id' => $user->id]);
            }

            $userFresh = $user->fresh();
            Log::info('Utilisateur après save:', $userFresh->toArray());

            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => $userFresh
            ]);
        } catch (\Throwable $e) {
            Log::error('AuthController:updateProfile - exception during update: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'validated_keys' => array_keys($validated)
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Impossible de mettre à jour le profil. Voir les logs serveur pour plus de détails.'
            ], 500);
        }
    }

    /**
     * Active la 2FA pour l'utilisateur courant
     */
    public function enableTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        $preferences['two_factor_enabled'] = true;
        $user->preferences = $preferences;
        $user->save();

        return response()->json([
            'message' => 'Authentification à deux facteurs activée',
            'two_factor_enabled' => true,
        ]);
    }

    /**
     * Désactive la 2FA pour l'utilisateur courant
     */
    public function disableTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        $preferences['two_factor_enabled'] = false;
        $user->preferences = $preferences;
        $user->save();

        return response()->json([
            'message' => 'Authentification à deux facteurs désactivée',
            'two_factor_enabled' => false,
        ]);
    }

    /**
     * Active les notifications pour l'utilisateur courant
     */
    public function enableNotifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        $preferences['notifications_enabled'] = true;
        $user->preferences = $preferences;
        $user->save();

        return response()->json([
            'message' => 'Notifications activées',
            'notifications_enabled' => true,
        ]);
    }

    /**
     * Désactive les notifications pour l'utilisateur courant
     */
    public function disableNotifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = is_array($user->preferences) ? $user->preferences : (json_decode($user->preferences ?? '[]', true) ?: []);
        $preferences['notifications_enabled'] = false;
        $user->preferences = $preferences;
        $user->save();

        return response()->json([
            'message' => 'Notifications désactivées',
            'notifications_enabled' => false,
        ]);
    }
}
