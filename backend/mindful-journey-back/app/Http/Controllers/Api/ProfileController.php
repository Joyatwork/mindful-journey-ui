<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Afficher le profil utilisateur
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        // Return fresh to include appended attributes (e.g. avatar_url)
        return response()->json([
            'success' => true,
            'data' => $user->fresh()
        ]);
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'bio' => 'nullable|string|max:1000',
            'preferences' => 'nullable|array',
            'health_goals' => 'nullable|array',
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120' // max 5MB
        ]);

        // Handle avatar upload if present
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public');
            // store relative path in DB
            $validated['avatar'] = $path;
        }

        // Mettre à jour réellement l'utilisateur
        $user->update($validated);

        // Debug logs to help trace avatar upload/storage and returned URL
        try {
            Log::info('ProfileController:update - hasFile avatar: ' . ($request->hasFile('avatar') ? 'yes' : 'no'));
            if (isset($path)) {
                Log::info('ProfileController:update - avatar path: ' . $path);
            }
            Log::info('ProfileController:update - user avatar (db): ' . ($user->avatar ?? 'NULL'));
            Log::info('ProfileController:update - user avatar_url (accessor): ' . ($user->avatar_url ?? 'NULL'));
        } catch (\Throwable $e) {
            // don't break normal flow for logging issues
            Log::warning('ProfileController:update - failed to log avatar info: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data' => $user->fresh()
        ]);
    }
}
