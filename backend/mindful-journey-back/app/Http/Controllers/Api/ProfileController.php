<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

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

        // Filter validated payload to actual user table columns to avoid SQL errors
        try {
            $userColumns = Schema::getColumnListing('users');
            $allowed = array_intersect_key($validated, array_flip($userColumns));

            // Only update allowed fields (columns that exist)
            $user->update($allowed);

            // Debug logs to help trace avatar upload/storage and returned URL
            Log::info('ProfileController:update - hasFile avatar: ' . ($request->hasFile('avatar') ? 'yes' : 'no'));
            if (isset($path)) {
                Log::info('ProfileController:update - avatar path: ' . $path);
            }
            // Refresh the user from DB to log the actual stored values
            $userFresh = $user->fresh();
            Log::info('ProfileController:update - user avatar (db): ' . ($user->avatar ?? 'NULL'));
            Log::info('ProfileController:update - user avatar_url (accessor): ' . ($user->avatar_url ?? 'NULL'));

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $userFresh
            ]);
        } catch (\Throwable $e) {
            // Log and return a helpful error so the front-end can surface it
            Log::error('ProfileController:update - exception during update: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'validated_keys' => array_keys($validated)
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Impossible de mettre à jour le profil. Voir les logs serveur pour plus de détails.'
            ], 500);
        }
    }
}
