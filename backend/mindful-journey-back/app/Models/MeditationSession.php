<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeditationSession extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'duration_minutes',
        'category',
        'difficulty_level',
        'audio_url',
        'image_url',
        'instructions',
        'benefits',
        'is_favorite',
        'completed_at',
        'session_data'
    ];

    protected $casts = [
        'instructions' => 'array',
        'benefits' => 'array',
        'session_data' => 'array',
        'is_favorite' => 'boolean',
        'completed_at' => 'datetime',
        'duration_minutes' => 'integer',
        'difficulty_level' => 'integer'
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope pour les sessions terminées
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    /**
     * Scope pour les sessions favorites
     */
    public function scopeFavorites($query)
    {
        return $query->where('is_favorite', true);
    }

    /**
     * Scope par catégorie
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope par niveau de difficulté
     */
    public function scopeByDifficulty($query, $level)
    {
        return $query->where('difficulty_level', $level);
    }

    /**
     * Calculer le temps total de méditation pour un utilisateur
     */
    public static function getTotalMeditationTime($userId)
    {
        return static::where('user_id', $userId)
            ->completed()
            ->sum('duration_minutes');
    }

    /**
     * Obtenir le nombre de sessions terminées
     */
    public static function getCompletedSessionsCount($userId)
    {
        return static::where('user_id', $userId)
            ->completed()
            ->count();
    }

    /**
     * Obtenir la série de méditation actuelle
     */
    public static function getCurrentStreak($userId)
    {
        $sessions = static::where('user_id', $userId)
            ->completed()
            ->orderBy('completed_at', 'desc')
            ->get();

        if ($sessions->isEmpty()) {
            return 0;
        }

        $streak = 0;
        $currentDate = now()->startOfDay();
        
        foreach ($sessions as $session) {
            $sessionDate = $session->completed_at->startOfDay();
            
            if ($sessionDate->eq($currentDate) || $sessionDate->eq($currentDate->subDay())) {
                $streak++;
                $currentDate = $sessionDate->subDay();
            } else {
                break;
            }
        }

        return $streak;
    }
}
