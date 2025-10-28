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
    MeditationController,
    RecommendationController,
    ChallengeController,
    ChallengeActionController
};
    use App\Http\Controllers\Api\EntrepriseController;
use App\Models\LoginOtp; // utilisé par la route debug locale
use App\Models\User as DebugUser; // alias pour éviter conflits éventuels

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

// ---------------------------------------------------------------------
// Routes publiques (déclarées AVANT les routes dynamiques similaires)
// ---------------------------------------------------------------------

// Important : définir avant "specialists/{specialist}" pour éviter la capture
Route::get('specialists/public', [SpecialistController::class, 'publicIndex']);

// Liste des entreprises pour le formulaire d'inscription
Route::get('entreprises', [EntrepriseController::class, 'index']);
// Détail des membres d'une entreprise
Route::get('entreprises/{id}/members', [EntrepriseController::class, 'members']);

// Route de test simple
Route::get('health', function () {
    return response()->json(['status' => 'API is working', 'timestamp' => now()]);
});

// Test d'authentification simple (public)
Route::post('test/login', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'Test login endpoint working',
        'data' => $request->all()
    ]);
});

// Routes publiques de test (dev)
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
            'message'   => 'Test de mise à jour reçu',
            'user_id'   => $userId,
            'received_data' => $data,
            'timestamp' => now()
        ]);
    });

    // Introspection DB (schémas / tables / colonnes)
    Route::prefix('db')->group(function () {
        Route::get('schemas', [DatabaseController::class, 'listSchemas']);
        Route::get('tables', [DatabaseController::class, 'listTables']);
        Route::get('columns', [DatabaseController::class, 'listColumns']);
        // Seed de quelques entreprises (dev)
        Route::post('entreprises/seed', [EntrepriseController::class, 'seed']);
        // Seed de quelques sites (dev) pour satisfaire les FKs (employees.site_id)
        Route::post('sites/seed', [EntrepriseController::class, 'seedSites']);
        // Liste des sites (dev)
        Route::get('sites', [EntrepriseController::class, 'listSites']);
        // Seed des employés (dev)
        Route::post('employees/seed', [EntrepriseController::class, 'seedEmployees']);
    });
});

// ---------------------------------------------------------------------
// Auth (publiques + protégées)
// ---------------------------------------------------------------------

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    Route::put('profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::post('enable-2fa', [AuthController::class, 'enableTwoFactor'])->middleware('auth:sanctum');
    Route::post('disable-2fa', [AuthController::class, 'disableTwoFactor'])->middleware('auth:sanctum');
    Route::post('enable-notifications', [AuthController::class, 'enableNotifications'])->middleware('auth:sanctum');
    Route::post('disable-notifications', [AuthController::class, 'disableNotifications'])->middleware('auth:sanctum');

    // Routes Google OAuth
    Route::get('google', [GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
    Route::post('google/login', [GoogleAuthController::class, 'loginWithGoogle']);
});

// DEBUG LOCAL UNIQUEMENT: récupérer le dernier OTP d'un email (ne pas déployer en prod)
if (app()->environment('local')) {
    Route::get('auth/debug/latest-otp', function (Request $request) {
        $email = $request->query('email');
        if (!$email) {
            return response()->json(['message' => 'Paramètre email requis'], 400);
        }
        $user = DebugUser::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }
        $otp = LoginOtp::where('user_id', $user->id)->latest()->first();
        if (!$otp) {
            return response()->json(['message' => 'Aucun OTP trouvé'], 404);
        }
        return response()->json([
            'otp_id' => $otp->id,
            'code' => $otp->code,
            'expires_at' => $otp->expires_at,
            'consumed_at' => $otp->consumed_at,
        ]);
    });
}

// Mot de passe oublié / réinitialisation (API JSON)
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;

Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
Route::post('reset-password', [NewPasswordController::class, 'store']);

// Routes pour visualiser la base de données (publiques de test)
Route::prefix('test')->group(function () {
    Route::get('database-stats', [DatabaseController::class, 'getStats']);
    Route::post('create-test-users', [DatabaseController::class, 'createTestUser']);
});

// ---------------------------------------------------------------------
// Routes protégées par authentification (Sanctum)
// ---------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Profil utilisateur
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    // Rendez-vous
    Route::apiResource('appointments', AppointmentController::class);
    Route::put('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

    // Spécialistes de santé
    // IMPORTANT : mettre "search" AVANT "{specialist}" pour éviter la capture par la route dynamique
    Route::get('specialists', [SpecialistController::class, 'index']);
    Route::get('specialists/search', [SpecialistController::class, 'search']);
    Route::get('specialists/{specialist}', [SpecialistController::class, 'show']);

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

    // Diagnostic de bien-être (rapide / quick)
    Route::get('diagnostic', [DiagnosticController::class, 'show']);
    Route::post('diagnostic', [DiagnosticController::class, 'store']);
    // Auto-diagnostic annuel dédié
    Route::get('diagnostic/annual', [\App\Http\Controllers\Api\AnnualDiagnosticController::class, 'show']);
    Route::post('diagnostic/annual', [\App\Http\Controllers\Api\AnnualDiagnosticController::class, 'store']);
    Route::get('diagnostic/annual/history', [\App\Http\Controllers\Api\AnnualDiagnosticController::class, 'index']);

    // Système de recommandations intelligent
    Route::prefix('recommendations')->group(function () {
        Route::get('personalized', [RecommendationController::class, 'getPersonalizedSuggestions']);
        Route::get('history-based', [RecommendationController::class, 'getHistoryBasedSuggestions']);
    });

    // --- Défis (Challenges) ---
    Route::get('challenges', [ChallengeController::class, 'index']);
    Route::post('challenges/{challenge}/start', [ChallengeActionController::class, 'start']);
    Route::post('challenges/{challenge}/finish', [ChallengeActionController::class, 'finish']);

    // Dev helper: créer le mapping employé pour l'utilisateur courant (local uniquement recommandé)
    Route::post('test/employees/map-current', [DatabaseController::class, 'mapCurrentUserToEmployee']);
});
