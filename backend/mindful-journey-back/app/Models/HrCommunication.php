<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HrCommunication extends Model
{
    use HasFactory;

    protected $table = 'hr_communications';

    protected $fillable = [
        'entreprise_id',
        'title',
        'content',
        'image_url',
        'type',
        'objective',
        'status',
        'published_at',
        'start_date',
        'end_date',
        'progress',
        'notifications_sent',
        'notifications_sent_at',
        'cta_label',
        'cta_target',
        'cta_clicks',
        'view_count',
        'interested_count',
        'reminder_count'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'notifications_sent_at' => 'datetime',
        'notifications_sent' => 'boolean',
        'progress' => 'integer',
        'cta_clicks' => 'integer',
        'view_count' => 'integer',
        'interested_count' => 'integer',
        'reminder_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relation avec l'entreprise
     */
    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    /**
     * Scope pour les communications actives
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now())
                    ->where(function ($q2) {
                        $q2->whereNull('end_date')
                            ->orWhere('end_date', '>=', now());
                    });
            });
    }

    /**
     * Scope pour les communications par type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope pour les communications par objectif
     */
    public function scopeByObjective($query, string $objective)
    {
        return $query->where('objective', $objective);
    }
}
