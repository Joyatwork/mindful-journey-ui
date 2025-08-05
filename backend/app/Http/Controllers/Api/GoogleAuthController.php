<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Rediriger vers Google pour l'authentification
     */
    public function redirectToGoogle(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'url' => $url
        ]);
    }

    /**
     * Gérer le callback de Google
     */
    public function handleGoogleCallback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Chercher si l'utilisateur existe déjà avec cet email
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if ($user) {
                // Mettre à jour les informations Google si l'utilisateur existe
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'provider' => 'google',
                    'avatar_url' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            } else {
                // Créer un nouveau utilisateur
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'provider' => 'google',
                    'avatar_url' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(32)), // Mot de passe aléatoire
                ]);
            }

            // Créer un token d'accès
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Connexion Google réussie',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'google_id' => $user->google_id,
                    'provider' => $user->provider,
                    'avatar_url' => $user->avatar_url,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'birth_date' => $user->birth_date,
                    'created_at' => $user->created_at,
                ],
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la connexion Google',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connexion Google pour SPA (Single Page Application)
     */
    public function loginWithGoogle(Request $request): JsonResponse
    {
        try {
            // Log des données reçues pour debugging
            Log::info('Google OAuth Request Data:', $request->all());
            
            $request->validate([
                'access_token' => 'required|string',
                'id' => 'required|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'avatar' => 'nullable|string',
            ]);

            // Créer un objet utilisateur Google à partir des données reçues
            $googleData = (object) [
                'id' => $request->id,
                'name' => $request->name,
                'email' => $request->email,
                'avatar' => $request->avatar,
            ];
            
            // Chercher si l'utilisateur existe déjà avec cet email
            $user = User::where('email', $googleData->email)->first();
            
            if ($user) {
                // Mettre à jour les informations Google si l'utilisateur existe
                $user->update([
                    'google_id' => $googleData->id,
                    'provider' => 'google',
                    'avatar_url' => $googleData->avatar,
                    'email_verified_at' => now(),
                    'last_login_at' => now(),
                ]);
            } else {
                // Créer un nouveau utilisateur
                $user = User::create([
                    'name' => $googleData->name,
                    'email' => $googleData->email,
                    'google_id' => $googleData->id,
                    'provider' => 'google',
                    'avatar_url' => $googleData->avatar,
                    'email_verified_at' => now(),
                    'last_login_at' => now(),
                    'password' => Hash::make(Str::random(32)), // Mot de passe aléatoire
                ]);
            }

            // Supprimer tous les anciens tokens de cet utilisateur
            $user->tokens()->delete();

            // Créer un nouveau token d'accès
            $token = $user->createToken('google_auth_token', ['*'], now()->addDays(30))->plainTextToken;

            return response()->json([
                'message' => 'Authentification Google réussie',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'google_id' => $user->google_id,
                    'provider' => $user->provider,
                    'avatar_url' => $user->avatar_url,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'birth_date' => $user->birth_date,
                    'created_at' => $user->created_at,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'token' => $token
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Google Auth Validation Error:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Données invalides',
                'errors' => $e->errors(),
                'received_data' => $request->all() // Pour debugging
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur Google Auth: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Erreur lors de l\'authentification Google',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur interne est survenue'
            ], 500);
        }
    }
}
