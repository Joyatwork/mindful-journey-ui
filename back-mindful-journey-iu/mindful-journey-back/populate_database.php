<?php

// Script pour remplir la base de données avec des données réalistes
require_once 'vendor/autoload.php';

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\MoodEntry;
use App\Models\MeditationSession;

echo "🌟 Remplissage de la base de données avec des données réalistes...\n\n";

try {
    // 1. CRÉER DES UTILISATEURS VARIÉS
    echo "👥 Création d'utilisateurs variés...\n";
    
    $users = [
        [
            'name' => 'Marie Dubois',
            'email' => 'marie.dubois@example.com',
            'password' => bcrypt('password123'),
            'phone' => '06.12.34.56.78',
            'birth_date' => '1988-03-15',
            'gender' => 'female',
            'bio' => 'Professeure de yoga passionnée par le bien-être et la méditation. Je pratique depuis 10 ans et j\'aide les autres à trouver leur équilibre.',
            'preferences' => json_encode([
                'themes' => ['nature', 'ocean', 'forest'],
                'notification_frequency' => 'daily',
                'language' => 'fr',
                'preferred_session_time' => 'morning',
                'difficulty_level' => 'advanced'
            ]),
            'health_goals' => json_encode([
                'primary_goals' => ['maintain_wellbeing', 'teach_others', 'deepen_practice'],
                'target_meditation_minutes' => 30,
                'weekly_sessions' => 7,
                'focus_areas' => ['mindfulness', 'breathing', 'gratitude'],
                'start_date' => '2025-01-01',
                'target_date' => '2025-12-31'
            ]),
            'email_verified_at' => now(),
        ],
        [
            'name' => 'Thomas Martin',
            'email' => 'thomas.martin@example.com',
            'password' => bcrypt('password123'),
            'phone' => '07.23.45.67.89',
            'birth_date' => '1985-11-22',
            'gender' => 'male',
            'bio' => 'Cadre dans une entreprise tech. J\'utilise la méditation pour gérer le stress du travail et améliorer ma concentration.',
            'preferences' => json_encode([
                'themes' => ['urban', 'rain', 'minimal'],
                'notification_frequency' => 'weekly',
                'language' => 'fr',
                'preferred_session_time' => 'evening',
                'difficulty_level' => 'intermediate'
            ]),
            'health_goals' => json_encode([
                'primary_goals' => ['reduce_stress', 'improve_focus', 'work_life_balance'],
                'target_meditation_minutes' => 15,
                'weekly_sessions' => 4,
                'focus_areas' => ['stress_management', 'concentration', 'sleep'],
                'start_date' => '2025-01-15',
                'target_date' => '2025-06-15'
            ]),
            'email_verified_at' => now(),
        ],
        [
            'name' => 'Emma Rousseau',
            'email' => 'emma.rousseau@example.com',
            'password' => bcrypt('password123'),
            'phone' => '06.34.56.78.90',
            'birth_date' => '1992-07-08',
            'gender' => 'female',
            'bio' => 'Étudiante en psychologie et future thérapeute. La mindfulness m\'aide dans mes études et ma future pratique professionnelle.',
            'preferences' => json_encode([
                'themes' => ['pastel', 'flowers', 'soft'],
                'notification_frequency' => 'daily',
                'language' => 'fr',
                'preferred_session_time' => 'afternoon',
                'difficulty_level' => 'beginner'
            ]),
            'health_goals' => json_encode([
                'primary_goals' => ['improve_sleep', 'manage_anxiety', 'academic_performance'],
                'target_meditation_minutes' => 10,
                'weekly_sessions' => 5,
                'focus_areas' => ['anxiety_management', 'sleep', 'concentration'],
                'start_date' => '2025-02-01',
                'target_date' => '2025-08-01'
            ]),
            'email_verified_at' => now(),
        ],
        [
            'name' => 'Pierre Lefebvre',
            'email' => 'pierre.lefebvre@example.com',
            'password' => bcrypt('password123'),
            'phone' => '07.45.67.89.01',
            'birth_date' => '1975-12-03',
            'gender' => 'male',
            'bio' => 'Retraité récent, je découvre la méditation pour cette nouvelle phase de ma vie. C\'est un voyage enrichissant.',
            'preferences' => json_encode([
                'themes' => ['traditional', 'temple', 'wisdom'],
                'notification_frequency' => 'daily',
                'language' => 'fr',
                'preferred_session_time' => 'morning',
                'difficulty_level' => 'beginner'
            ]),
            'health_goals' => json_encode([
                'primary_goals' => ['spiritual_growth', 'healthy_aging', 'peace_of_mind'],
                'target_meditation_minutes' => 20,
                'weekly_sessions' => 6,
                'focus_areas' => ['gratitude', 'acceptance', 'wisdom'],
                'start_date' => '2025-01-01',
                'target_date' => '2026-01-01'
            ]),
            'email_verified_at' => now(),
        ],
        [
            'name' => 'Sarah Johnson',
            'email' => 'sarah.johnson@example.com',
            'password' => bcrypt('password123'),
            'phone' => '06.56.78.90.12',
            'birth_date' => '1990-04-20',
            'gender' => 'female',
            'bio' => 'Maman de deux enfants, je cherche des moments de calme dans mon quotidien chargé. La méditation m\'aide à être plus présente.',
            'preferences' => json_encode([
                'themes' => ['family', 'home', 'peaceful'],
                'notification_frequency' => 'weekly',
                'language' => 'fr',
                'preferred_session_time' => 'night',
                'difficulty_level' => 'intermediate'
            ]),
            'health_goals' => json_encode([
                'primary_goals' => ['patience', 'present_moment', 'self_care'],
                'target_meditation_minutes' => 8,
                'weekly_sessions' => 3,
                'focus_areas' => ['patience', 'gratitude', 'stress_relief'],
                'start_date' => '2025-01-10',
                'target_date' => '2025-07-10'
            ]),
            'email_verified_at' => now(),
        ]
    ];

    $createdUsers = [];
    foreach ($users as $userData) {
        $existingUser = User::where('email', $userData['email'])->first();
        if (!$existingUser) {
            $user = User::create($userData);
            $createdUsers[] = $user;
            echo "✅ Utilisateur créé: {$user->name}\n";
        } else {
            $createdUsers[] = $existingUser;
            echo "⏭️  Utilisateur existant: {$existingUser->name}\n";
        }
    }

    // Ajouter Sophie Laurent si elle existe
    $sophie = User::where('name', 'Sophie Laurent')->first();
    if ($sophie) {
        $createdUsers[] = $sophie;
    }

    echo "\n📊 Création d'entrées d'humeur variées...\n";

    // 2. CRÉER DES ENTRÉES D'HUMEUR RÉALISTES
    $activities = ['Travail', 'Sport', 'Méditation', 'Lecture', 'Cuisine', 'Amis/Famille', 'Nature', 'Musique', 'Art/Créativité', 'Télé/Films', 'Repos', 'Ménage', 'Shopping', 'Voyage'];
    $emotions = ['Joie', 'Gratitude', 'Calme', 'Confiance', 'Anxiété', 'Stress', 'Colère', 'Tristesse', 'Peur', 'Excitation', 'Nostalgie', 'Espoir', 'Fierté', 'Sérénité'];

    $moodEmojis = [
        1 => '😢', 2 => '😞', 3 => '😕', 4 => '😐', 5 => '🙂',
        6 => '😊', 7 => '😄', 8 => '😁', 9 => '🤩', 10 => '🥳'
    ];

    $moodNotes = [
        'low' => [
            "Journée difficile, beaucoup de stress au travail.",
            "Pas bien dormi cette nuit, fatigue émotionnelle.",
            "Dispute avec un proche, ça m'affecte beaucoup.",
            "Surcharge de travail, je me sens dépassé(e).",
            "Temps gris qui affecte mon moral."
        ],
        'medium' => [
            "Journée normale, quelques hauts et bas.",
            "Productive mais fatiguante, mitigé.",
            "Équilibre entre bons et mauvais moments.",
            "Journée calme, rien d'exceptionnel.",
            "Stable, je gère le quotidien."
        ],
        'high' => [
            "Excellente journée ! Très positive et énergique.",
            "Tout va bien, je me sens vraiment épanoui(e).",
            "Journée productive avec de beaux moments de bonheur.",
            "Belle énergie, j'ai pris soin de moi aujourd'hui.",
            "Gratitude pour cette journée merveilleuse."
        ]
    ];

    foreach ($createdUsers as $user) {
        // Créer 21 jours d'historique pour chaque utilisateur
        for ($i = 20; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            
            // Vérifier si une entrée existe déjà
            $existingEntry = MoodEntry::where('user_id', $user->id)
                ->where('date', $date)
                ->first();
                
            if ($existingEntry) {
                continue;
            }

            // Créer un pattern réaliste basé sur le profil utilisateur
            $baseMood = 5;
            if (str_contains($user->bio, 'stress')) {
                $baseMood = rand(3, 7); // Plus de variabilité pour les stressés
            } elseif (str_contains($user->bio, 'yoga') || str_contains($user->bio, 'retraité')) {
                $baseMood = rand(6, 9); // Plus stable et positif
            } else {
                $baseMood = rand(4, 8); // Normal
            }

            // Ajouter de la variabilité weekend vs semaine
            $dayOfWeek = date('w', strtotime($date));
            if (in_array($dayOfWeek, [0, 6])) { // Weekend
                $baseMood += rand(0, 2);
            }

            $baseMood = max(1, min(10, $baseMood));

            // Sélectionner des activités et émotions cohérentes
            $userActivities = array_rand(array_flip($activities), rand(2, 5));
            if (!is_array($userActivities)) {
                $userActivities = [$userActivities];
            }
            
            $userEmotions = array_rand(array_flip($emotions), rand(1, 4));
            if (!is_array($userEmotions)) {
                $userEmotions = [$userEmotions];
            }

            // Sélectionner la note appropriée
            $noteCategory = 'medium';
            if ($baseMood <= 3) $noteCategory = 'low';
            elseif ($baseMood >= 7) $noteCategory = 'high';
            
            $note = $moodNotes[$noteCategory][array_rand($moodNotes[$noteCategory])];

            MoodEntry::create([
                'user_id' => $user->id,
                'date' => $date,
                'mood_level' => $baseMood,
                'mood_emoji' => $moodEmojis[$baseMood],
                'energy_level' => max(1, min(10, $baseMood + rand(-2, 2))),
                'stress_level' => max(1, min(10, 11 - $baseMood + rand(-2, 3))),
                'sleep_quality' => max(1, min(10, $baseMood + rand(-1, 2))),
                'notes' => $note,
                'activities' => array_intersect_key($activities, array_flip($userActivities)),
                'emotions' => array_intersect_key($emotions, array_flip($userEmotions))
            ]);
        }
        
        echo "✅ {$user->name}: 21 entrées d'humeur créées\n";
    }

    echo "\n🧘‍♀️ Création de sessions de méditation...\n";

    // 3. CRÉER DES SESSIONS DE MÉDITATION RÉALISTES
    $meditationTemplates = [
        [
            'title' => 'Respiration Consciente',
            'category' => 'breathing',
            'duration_minutes' => 5,
            'difficulty_level' => 1
        ],
        [
            'title' => 'Scan Corporel',
            'category' => 'mindfulness',
            'duration_minutes' => 15,
            'difficulty_level' => 2
        ],
        [
            'title' => 'Préparation au Sommeil',
            'category' => 'sleep',
            'duration_minutes' => 10,
            'difficulty_level' => 1
        ],
        [
            'title' => 'Libération du Stress',
            'category' => 'stress',
            'duration_minutes' => 12,
            'difficulty_level' => 2
        ],
        [
            'title' => 'Amélioration de la Concentration',
            'category' => 'focus',
            'duration_minutes' => 8,
            'difficulty_level' => 2
        ],
        [
            'title' => 'Pratique de Gratitude',
            'category' => 'gratitude',
            'duration_minutes' => 7,
            'difficulty_level' => 1
        ]
    ];

    foreach ($createdUsers as $user) {
        // Créer 15-30 sessions de méditation par utilisateur
        $sessionCount = rand(15, 30);
        
        for ($i = 0; $i < $sessionCount; $i++) {
            $template = $meditationTemplates[array_rand($meditationTemplates)];
            
            // Date aléatoire dans les 30 derniers jours
            $completedAt = now()->subDays(rand(1, 30))->subHours(rand(6, 22));
            
            // Ajuster selon les préférences utilisateur
            $preferences = json_decode($user->preferences, true);
            $difficulty = $preferences['difficulty_level'] ?? 'intermediate';
            
            // Filtrer par niveau de difficulté préféré
            if ($difficulty === 'beginner' && $template['difficulty_level'] > 1) {
                if (rand(1, 100) > 30) continue; // 30% de chance de faire un niveau plus élevé
            } elseif ($difficulty === 'advanced' && $template['difficulty_level'] < 2) {
                if (rand(1, 100) > 40) continue; // 40% de chance de faire un niveau plus bas
            }

            $sessionData = [
                'started_at' => $completedAt->subMinutes($template['duration_minutes'])->toISOString(),
                'completed_data' => [
                    'actual_duration_minutes' => $template['duration_minutes'] + rand(-2, 3),
                    'rating' => rand(3, 5),
                    'mood_before' => rand(4, 7),
                    'mood_after' => rand(6, 9),
                    'notes' => 'Session très apaisante, je me sens mieux.',
                    'completed_at_timestamp' => $completedAt->toISOString()
                ]
            ];

            MeditationSession::create([
                'user_id' => $user->id,
                'title' => $template['title'],
                'description' => "Session de méditation {$template['category']}",
                'duration_minutes' => $template['duration_minutes'],
                'category' => $template['category'],
                'difficulty_level' => $template['difficulty_level'],
                'instructions' => ['Asseyez-vous confortablement', 'Fermez les yeux', 'Concentrez-vous sur votre respiration'],
                'benefits' => ['Relaxation', 'Bien-être', 'Sérénité'],
                'is_favorite' => rand(1, 100) <= 20, // 20% de chance d'être favori
                'completed_at' => $completedAt,
                'session_data' => $sessionData
            ]);
        }
        
        echo "✅ {$user->name}: {$sessionCount} sessions de méditation créées\n";
    }

    echo "\n🎉 RÉCAPITULATIF FINAL\n";
    echo "==========================================\n";
    
    $totalUsers = User::count();
    $totalMoodEntries = MoodEntry::count();
    $totalMeditationSessions = MeditationSession::count();
    
    echo "👥 Utilisateurs total: {$totalUsers}\n";
    echo "📊 Entrées d'humeur: {$totalMoodEntries}\n";
    echo "🧘‍♀️ Sessions de méditation: {$totalMeditationSessions}\n\n";
    
    // Statistiques par utilisateur
    echo "📈 STATISTIQUES PAR UTILISATEUR:\n";
    echo "--------------------------------\n";
    
    foreach (User::all() as $user) {
        $moodCount = MoodEntry::where('user_id', $user->id)->count();
        $avgMood = MoodEntry::where('user_id', $user->id)->avg('mood_level');
        $meditationCount = MeditationSession::where('user_id', $user->id)->completed()->count();
        $totalMeditationTime = MeditationSession::where('user_id', $user->id)->completed()->sum('duration_minutes');
        
        echo "🔸 {$user->name}:\n";
        echo "   📊 {$moodCount} entrées d'humeur (avg: " . round($avgMood, 1) . "/10)\n";
        echo "   🧘‍♀️ {$meditationCount} sessions ({$totalMeditationTime} min total)\n\n";
    }
    
    echo "🌐 URLS POUR TESTER:\n";
    echo "===================\n";
    echo "🏠 Application: http://localhost:8080/\n";
    echo "📊 Humeur: http://localhost:8080/mood\n";
    echo "🧘‍♀️ Méditation: http://localhost:8080/meditation\n";
    echo "🗄️ Base de données: http://localhost:8080/database\n";
    echo "🔐 Authentification: http://localhost:8080/auth-test\n\n";
    
    echo "✨ Base de données remplie avec succès !\n";
    echo "Vous pouvez maintenant voir un rendu complet dans votre navigateur.\n\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
