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

class GoogleAuthController extends Controller
{
    /**
     * Rediriger vers Google pour l'authentification
     */
    public function redirectToGoogle(): JsonResponse
    {
        try {
            $clientId = config('services.google.client_id');
            $redirectUri = config('services.google.redirect');
            
            $url = 'https://accounts.google.com/o/oauth2/auth?' . http_build_query([
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'scope' => 'openid profile email',
                'response_type' => 'code',
                'access_type' => 'online',
                'prompt' => 'select_account',
            ]);

            return response()->json([
                'url' => $url
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la génération de l\'URL Google: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la génération de l\'URL Google',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gérer le callback de Google
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $code = $request->get('code');
            $error = $request->get('error');

            if ($error) {
                Log::error('Erreur OAuth Google: ' . $error);
                $frontendUrl = config('app.frontend_url', 'http://localhost:8080') . '/auth/google/callback?error=' . urlencode('Erreur lors de l\'authentification Google');
                return redirect($frontendUrl);
            }

            if (!$code) {
                Log::error('Code OAuth manquant');
                $frontendUrl = config('app.frontend_url', 'http://localhost:8080') . '/auth/google/callback?error=' . urlencode('Code d\'autorisation manquant');
                return redirect($frontendUrl);
            }

            // Échanger le code contre un token d'accès
            $tokenResponse = $this->exchangeCodeForToken($code);
            
            if (!$tokenResponse || !isset($tokenResponse['access_token'])) {
                throw new \Exception('Impossible d\'obtenir le token d\'accès');
            }

            // Obtenir les informations utilisateur de Google
            $googleUser = $this->getUserFromGoogle($tokenResponse['access_token']);
            
            if (!$googleUser) {
                throw new \Exception('Impossible d\'obtenir les informations utilisateur');
            }

            // Chercher si l'utilisateur existe déjà avec cet email
            $user = User::where('email', $googleUser['email'])->first();
            
            if ($user) {
                // Mettre à jour les informations Google si l'utilisateur existe
                $user->update([
                    'google_id' => $googleUser['id'],
                    'provider' => 'google',
                    'avatar_url' => $googleUser['picture'] ?? null,
                    'email_verified_at' => now(),
                ]);
            } else {
                // Créer un nouveau utilisateur
                $user = User::create([
                    'name' => $googleUser['name'],
                    'email' => $googleUser['email'],
                    'google_id' => $googleUser['id'],
                    'provider' => 'google',
                    'avatar_url' => $googleUser['picture'] ?? null,
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(32)), // Mot de passe aléatoire
                ]);
            }

            // Créer un token d'accès
            $token = $user->createToken('auth_token')->plainTextToken;

            // Rediriger vers le frontend React avec le token
            $frontendUrl = config('app.frontend_url', 'http://localhost:8080') . '/auth/google/callback?token=' . urlencode($token);
            return redirect($frontendUrl);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la connexion Google: ' . $e->getMessage());
            // Rediriger vers le frontend avec l'erreur
            $frontendUrl = config('app.frontend_url', 'http://localhost:8080') . '/auth/google/callback?error=' . urlencode('Erreur lors de la connexion Google');
            return redirect($frontendUrl);
        }
    }

    /**
     * Échanger le code d'autorisation contre un token d'accès
     */
    private function exchangeCodeForToken($code)
    {
        $tokenUrl = 'https://oauth2.googleapis.com/token';
        
        $data = [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
            'code' => $code,
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $tokenUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            Log::error('Erreur lors de l\'échange du code: HTTP ' . $httpCode . ' - ' . $response);
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Obtenir les informations utilisateur depuis Google
     */
    private function getUserFromGoogle($accessToken)
    {
        $userUrl = 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' . $accessToken;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $userUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            Log::error('Erreur lors de la récupération des données utilisateur: HTTP ' . $httpCode . ' - ' . $response);
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Connexion Google pour SPA (Single Page Application)
     */
    public function loginWithGoogle(Request $request): JsonResponse
    {
        try {
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
            return response()->json([
                'message' => 'Données invalides',
                'errors' => $e->errors()
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
