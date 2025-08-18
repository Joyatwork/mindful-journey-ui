<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        // Créer un token Sanctum
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
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
