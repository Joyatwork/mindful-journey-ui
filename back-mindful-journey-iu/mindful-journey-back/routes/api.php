<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    GoogleAuthController,
    AppointmentController,
    SpecialistController,
    HealthDataController,
    WellnessController,
    DiagnosticController,
    ProfileController,
    DatabaseController,
    MoodController,
    MeditationController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    Route::put('profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    
    // Routes Google OAuth
    Route::get('google', [GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
    Route::post('google/login', [GoogleAuthController::class, 'loginWithGoogle']);
});

// Test d'authentification simple
Route::post('test/login', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'Test login endpoint working',
        'data' => $request->all()
    ]);
});

// Routes pour visualiser la base de données
Route::prefix('test')->group(function () {
    Route::get('database-stats', [DatabaseController::class, 'getStats']);
    Route::post('create-test-users', [DatabaseController::class, 'createTestUser']);
});

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    
    // Profil utilisateur
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    
    // Rendez-vous
    Route::apiResource('appointments', AppointmentController::class);
    Route::put('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
    
    // Spécialistes de santé
    Route::get('specialists', [SpecialistController::class, 'index']);
    Route::get('specialists/{specialist}', [SpecialistController::class, 'show']);
    Route::get('specialists/search', [SpecialistController::class, 'search']);
    
    // Données de santé
    Route::prefix('health-data')->group(function () {
        Route::get('mood', [HealthDataController::class, 'getMoodData']);
        Route::post('mood', [HealthDataController::class, 'saveMoodData']);
        Route::get('progress', [HealthDataController::class, 'getProgressData']);
    });
    
    // Activités wellness
    Route::prefix('wellness')->group(function () {
        Route::get('activities', [WellnessController::class, 'getActivities']);
        Route::post('activities/log', [WellnessController::class, 'logActivity']);
        Route::get('progress', [WellnessController::class, 'getProgress']);
    });
    
    // Suivi de l'humeur quotidienne
    Route::prefix('mood')->group(function () {
        Route::get('/', [MoodController::class, 'index']);
        Route::post('/', [MoodController::class, 'store']);
        Route::get('/today', [MoodController::class, 'today']);
        Route::get('/stats', [MoodController::class, 'quickStats']);
        Route::get('/{id}', [MoodController::class, 'show']);
    });
    
    // Méditations guidées
    Route::prefix('meditation')->group(function () {
        Route::get('/', [MeditationController::class, 'index']);
        Route::post('/start-session', [MeditationController::class, 'startSession']);
        Route::post('/complete-session/{sessionId}', [MeditationController::class, 'completeSession']);
        Route::get('/history', [MeditationController::class, 'history']);
        Route::get('/stats', [MeditationController::class, 'stats']);
        Route::post('/toggle-favorite/{sessionId}', [MeditationController::class, 'toggleFavorite']);
    });
    
    // Diagnostic
    Route::get('diagnostic', [DiagnosticController::class, 'show']);
    Route::post('diagnostic', [DiagnosticController::class, 'store']);
});

// Routes publiques (sans authentification)
Route::get('specialists/public', [SpecialistController::class, 'publicIndex']);

// Route de test simple
Route::get('health', function () {
    return response()->json(['status' => 'API is working', 'timestamp' => now()]);
});

// Route de test pour les spécialistes
Route::get('test/specialists', function () {
    return response()->json([
        'data' => [
            [
                'id' => '1',
                'name' => 'Dr. Marie Dubois',
                'specialty' => 'Psychologue clinicienne',
                'rating' => 4.9,
                'experience' => '12 ans',
                'price' => '80€',
                'availability' => 'Disponible cette semaine',
                'consultationType' => 'both',
                'description' => 'Spécialisée dans la gestion du stress et de l\'anxiété',
                'location' => 'Paris 8ème'
            ],
            [
                'id' => '2',
                'name' => 'Dr. Pierre Martin',
                'specialty' => 'Médecin généraliste',
                'rating' => 4.7,
                'experience' => '15 ans',
                'price' => '50€',
                'availability' => 'Disponible demain',
                'consultationType' => 'both',
                'description' => 'Expert en médecine préventive et troubles du sommeil',
                'location' => 'Lyon 2ème'
            ]
        ]
    ]);
});

// Routes de test publiques pour le développement
Route::prefix('test')->group(function () {
    Route::get('appointments', function () {
        return response()->json([
            'data' => [
                [
                    'id' => '1',
                    'specialist_name' => 'Dr. Marie Dubois',
                    'date' => '2025-08-05',
                    'time' => '14:00',
                    'type' => 'consultation',
                    'status' => 'confirmed'
                ]
            ]
        ]);
    });
    
    Route::get('mood', function () {
        return response()->json([
            'data' => [
                [
                    'date' => '2025-08-01',
                    'mood' => 4,
                    'notes' => 'Journée productive'
                ]
            ]
        ]);
    });

    // Test de mise à jour de profil
    Route::put('profile/{userId}', function (Request $request, $userId) {
        $data = $request->all();
        return response()->json([
            'message' => 'Test de mise à jour reçu',
            'user_id' => $userId,
            'received_data' => $data,
            'timestamp' => now()
        ]);
    });
});
