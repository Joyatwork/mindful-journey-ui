<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoodEntry extends Model
{
    protected $fillable = [
        'user_id',
        'employee_id',
        'mood_level',
        'mood',
        'mood_emoji',
        'energy_level',
        'energy',
        'stress_level',
        'stress',
        'sleep_quality',
        'sleep',
        'emoji',
        'comment',
        'notes',
        'details',
        'date',
        'activities',
        'emotions'
    ];

    protected $casts = [
        'date' => 'date',
        'activities' => 'array',
        'emotions' => 'array',
        'mood_level' => 'integer',
        'mood' => 'integer',
        'energy_level' => 'integer',
        'energy' => 'integer',
        'stress_level' => 'integer',
        'stress' => 'integer',
        'sleep_quality' => 'integer',
        'sleep' => 'integer'
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope pour récupérer les entrées de la semaine courante
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope pour récupérer les entrées du mois courant
     */
    public function scopeThisMonth($query)
    {
        return $query->whereBetween('date', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ]);
    }

    /**
     * Calculer la moyenne de l'humeur sur une période
     */
    public static function averageMoodForUser($userId, $days = 7)
    {
        return static::where('user_id', $userId)
            ->where('date', '>=', now()->subDays($days))
            ->avg('mood_level');
    }
}
