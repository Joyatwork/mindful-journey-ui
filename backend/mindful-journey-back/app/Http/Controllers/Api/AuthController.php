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
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

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

        $user = User::create($data);

        // Créer un token Sanctum pour l'utilisateur
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $token,
        ], 201);
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
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120'
        ]);

        $user = $request->user();
        Log::info('Utilisateur avant modification:', $user->toArray());

        // Handle avatar upload if present (FormData upload)
        if ($request->hasFile('avatar')) {
            try {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $avatarPath;
                Log::info('AuthController:updateProfile - stored avatar: ' . $avatarPath);
            } catch (\Throwable $e) {
                Log::error('AuthController:updateProfile - avatar storage failed: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Erreur lors de l\'upload de l\'avatar.'], 500);
            }
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
