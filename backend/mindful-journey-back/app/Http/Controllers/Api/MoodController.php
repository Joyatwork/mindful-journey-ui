<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MoodEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class MoodController extends Controller
{
    /**
     * Récupérer les entrées d'humeur de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $period = $request->get('period', 'week'); // week, month, year
        
        $query = MoodEntry::where('user_id', $user->id);
        
        switch ($period) {
            case 'week':
                $query->thisWeek();
                break;
            case 'month':
                $query->thisMonth();
                break;
            case 'year':
                $query->whereYear('date', now()->year);
                break;
        }
        
        $entries = $query->orderBy('date', 'desc')->get();
        
        // Statistiques
        $stats = [
            'average_mood' => $entries->avg('mood_level'),
            'average_energy' => $entries->avg('energy_level'),
            'average_stress' => $entries->avg('stress_level'),
            'average_sleep' => $entries->avg('sleep_quality'),
            'total_entries' => $entries->count(),
            'best_day' => $entries->sortByDesc('mood_level')->first(),
            'worst_day' => $entries->sortBy('mood_level')->first(),
        ];
        
        return response()->json([
            'success' => true,
            'entries' => $entries,
            'stats' => $stats,
            'period' => $period
        ]);
    }

    /**
     * Enregistrer une nouvelle entrée d'humeur
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'date' => 'required|date',
            'mood_level' => 'required|integer|between:1,10',
            'mood_emoji' => 'nullable|string|max:10',
            'energy_level' => 'nullable|integer|between:1,10',
            'stress_level' => 'nullable|integer|between:1,10',
            'sleep_quality' => 'nullable|integer|between:1,10',
            'notes' => 'nullable|string|max:1000',
            'activities' => 'nullable|array',
            'activities.*' => 'string|max:100',
            'emotions' => 'nullable|array',
            'emotions.*' => 'string|max:50',
        ]);

        // Forcer le format de la date à YYYY-MM-DD
        if (isset($validated['date'])) {
            $validated['date'] = date('Y-m-d', strtotime($validated['date']));
        }

        try {
            // Fallback: s'assurer que activities et emotions sont bien des arrays
            if (isset($validated['activities']) && !is_array($validated['activities'])) {
                $validated['activities'] = (array) $validated['activities'];
            }
            if (isset($validated['emotions']) && !is_array($validated['emotions'])) {
                $validated['emotions'] = (array) $validated['emotions'];
            }

            // Vérifier si une entrée existe déjà pour cette date
            $existingEntry = MoodEntry::where('user_id', $user->id)
                ->whereDate('date', $validated['date'])
                ->first();

            if ($existingEntry) {
                $existingEntry->update($validated);
                $entry = $existingEntry;
                $message = 'Entrée d\'humeur mise à jour avec succès';
            } else {
                $entry = MoodEntry::create([
                    'user_id' => $user->id,
                    ...$validated
                ]);
                $message = 'Entrée d\'humeur enregistrée avec succès';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'entry' => $entry
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'enregistrement MoodEntry: ' . $e->getMessage(), [
                'exception' => $e,
                'validated' => $validated
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer une entrée spécifique
     */
    public function show($id)
    {
        $user = Auth::user();
        
        $entry = MoodEntry::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => 'Entrée non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'entry' => $entry
        ]);
    }

    /**
     * Récupérer l'entrée du jour
     */
    public function today()
    {
        $user = Auth::user();
        
        $entry = MoodEntry::where('user_id', $user->id)
            ->where('date', now()->toDateString())
            ->first();

        return response()->json([
            'success' => true,
            'entry' => $entry,
            'has_entry_today' => $entry !== null
        ]);
    }

    /**
     * Statistiques rapides pour le dashboard
     */
    public function quickStats()
    {
        $user = Auth::user();
        
        $weeklyAvg = MoodEntry::averageMoodForUser($user->id, 7);
        $monthlyAvg = MoodEntry::averageMoodForUser($user->id, 30);
        
        $streak = $this->calculateStreak($user->id);
        
        $recentEntries = MoodEntry::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'weekly_average' => round($weeklyAvg, 1),
                'monthly_average' => round($monthlyAvg, 1),
                'current_streak' => $streak,
                'total_entries' => MoodEntry::where('user_id', $user->id)->count(),
                'recent_trend' => $this->calculateTrend($recentEntries)
            ]
        ]);
    }

    /**
     * Calculer la série de jours consécutifs avec entrées
     */
    private function calculateStreak($userId)
    {
        $entries = MoodEntry::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->toArray();

        if (empty($entries)) {
            return 0;
        }

        $streak = 0;
        $currentDate = now()->toDateString();
        
        foreach ($entries as $entryDate) {
            if ($entryDate === $currentDate) {
                $streak++;
                $currentDate = now()->subDays($streak)->toDateString();
            } else {
                break;
            }
        }

        return $streak;
    }

    /**
     * Calculer la tendance (positive, négative, stable)
     */
    private function calculateTrend($entries)
    {
        if ($entries->count() < 2) {
            return 'insufficient_data';
        }

        $recent = $entries->take(3)->avg('mood_level');
        $older = $entries->skip(3)->take(4)->avg('mood_level');
        
        $difference = $recent - $older;
        
        if ($difference > 0.5) {
            return 'improving';
        } elseif ($difference < -0.5) {
            return 'declining';
        } else {
            return 'stable';
        }
    }
}
