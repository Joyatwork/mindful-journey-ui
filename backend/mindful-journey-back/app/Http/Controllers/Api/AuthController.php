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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

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
            Log::error('Erreur envoi mail 2FA: '.$e->getMessage());
            return response()->json([
                'message' => "Erreur lors de l'envoi du code, réessayez plus tard."], 500);
        }

        return response()->json([
            'message' => 'Code envoyé par email',
            'two_factor' => true,
            'otp_id' => $otp->id,
            'expires_in_seconds' => 600,
        ]);
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
        $preferences = $user->preferences ? json_decode($user->preferences, true) : [];
        
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
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'birthDate' => 'nullable|date',
            'jobPosition' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'goals' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        Log::info('Utilisateur avant modification:', $user->toArray());
        
        // Mettre à jour les champs de base
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->bio = $request->bio;
        $user->birth_date = $request->birthDate;
        
        // Récupérer les préférences existantes ou créer un nouveau tableau
        $preferences = $user->preferences ? json_decode($user->preferences, true) : [];
        
        // Ajouter les nouvelles données dans les préférences
        $preferences['location'] = $request->location;
        $preferences['job_position'] = $request->jobPosition;
        $preferences['company'] = $request->company;
        $preferences['goals'] = $request->goals;
        
        // Sauvegarder les préférences en JSON
        $user->preferences = json_encode($preferences);
        
        Log::info('Utilisateur après modification (avant save):', $user->toArray());
        
        $saved = $user->save();
        Log::info('Résultat save():', $saved ? 'SUCCESS' : 'FAILED');
        
        Log::info('Utilisateur après save:', $user->fresh()->toArray());

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
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
                'created_at' => $user->created_at,
            ]
        ]);
    }
}
