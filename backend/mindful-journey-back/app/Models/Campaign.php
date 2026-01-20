<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Campaign extends Model
{
    use HasFactory;

    protected $table = 'campaigns';

    protected $fillable = [
        'entreprise_id',
        'title',
        'description',
        'theme',
        'start_date',
        'end_date',
        'status',
        'created_by_user_id',
        'visibility'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
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
     * Relation avec l'utilisateur créateur
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Relation avec les participants
     */
    public function participants()
    {
        return $this->hasMany(CampaignParticipant::class, 'campaign_id');
    }

    /**
     * Scope pour les campagnes actives
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'en_cours');
    }

    /**
     * Scope pour les campagnes d'une entreprise
     */
    public function scopeForEntreprise($query, $entrepriseId)
    {
        return $query->where('entreprise_id', $entrepriseId);
    }
}
