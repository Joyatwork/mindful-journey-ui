<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Cloudinary\Cloudinary;

class ProfileController extends Controller
{
    /**
     * Get configured Cloudinary instance
     */
    private function getCloudinary(): Cloudinary
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key' => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true
            ]
        ]);
    }

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
        // Debug file upload issues
        Log::info('ProfileController:update - START', [
            'hasFile' => $request->hasFile('avatar'),
            'allFiles' => array_keys($request->allFiles()),
            'contentType' => $request->header('Content-Type'),
            'method' => $request->method(),
            '_method' => $request->input('_method'),
            'cloudinary_cloud' => env('CLOUDINARY_CLOUD_NAME') ? 'set' : 'NOT SET',
            'cloudinary_key' => env('CLOUDINARY_API_KEY') ? 'set' : 'NOT SET',
            'cloudinary_secret' => env('CLOUDINARY_API_SECRET') ? 'set' : 'NOT SET',
        ]);
        
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        Log::info('ProfileController:update - user authenticated', ['userId' => $user->id]);

        // Check if avatar file is present but invalid
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            Log::info('ProfileController:update - avatar file info', [
                'isValid' => $file->isValid(),
                'error' => $file->getError(),
                'errorMessage' => $file->getErrorMessage(),
                'size' => $file->getSize(),
                'mimeType' => $file->getMimeType(),
                'clientOriginalName' => $file->getClientOriginalName(),
            ]);
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
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:5120' // max 5MB - removed 'file' validation
        ], [
            'avatar.image' => 'The avatar must be an image.',
            'avatar.mimes' => 'The avatar must be a file of type: jpg, jpeg, png, gif, webp.',
            'avatar.max' => 'The avatar may not be greater than 5MB.',
        ]);

        // Handle avatar upload to Cloudinary if present
        if ($request->hasFile('avatar')) {
            try {
                $file = $request->file('avatar');
                $cloudinary = $this->getCloudinary();
                
                // Delete old avatar from Cloudinary if exists
                if (!empty($user->avatar) && str_contains($user->avatar, 'cloudinary.com')) {
                    try {
                        // Extract public_id from URL
                        preg_match('/mindful-journey\/avatars\/([^\.\/]+)/', $user->avatar, $matches);
                        if (!empty($matches[1])) {
                            $cloudinary->uploadApi()->destroy('mindful-journey/avatars/' . $matches[1]);
                            Log::info('ProfileController:update - deleted old Cloudinary avatar');
                        }
                    } catch (\Throwable $e) {
                        Log::warning('ProfileController:update - failed to delete old avatar: ' . $e->getMessage());
                    }
                }
                
                // Upload to Cloudinary using SDK directly
                $uploadResult = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'mindful-journey/avatars',
                    'public_id' => 'user_' . $user->id . '_' . time(),
                    'transformation' => [
                        'width' => 400,
                        'height' => 400,
                        'crop' => 'fill',
                        'gravity' => 'face',
                        'quality' => 'auto',
                        'fetch_format' => 'auto'
                    ]
                ]);
                
                $cloudinaryUrl = $uploadResult['secure_url'] ?? null;
                
                if (!$cloudinaryUrl) {
                    Log::error('ProfileController:update - Cloudinary upload returned no URL');
                    return response()->json([
                        'success' => false,
                        'message' => 'Erreur lors du stockage de l\'avatar sur Cloudinary.'
                    ], 500);
                }
                
                // Store the full Cloudinary URL directly
                $validated['avatar'] = $cloudinaryUrl;
                Log::info('ProfileController:update - avatar uploaded to Cloudinary: ' . $cloudinaryUrl);
                
            } catch (\Throwable $e) {
                Log::error('ProfileController:update - Cloudinary upload exception: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'upload de l\'avatar: ' . $e->getMessage()
                ], 500);
            }
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
