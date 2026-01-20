<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CampaignParticipant extends Model
{
    use HasFactory;

    protected $table = 'campaign_participants';
    
    public $timestamps = false;

    protected $fillable = [
        'campaign_id',
        'employee_id',
        'joined_at',
        'status',
        'progress'
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'progress' => 'integer',
        'campaign_id' => 'integer',
        'employee_id' => 'integer'
    ];

    /**
     * Relation avec la communication/campagne
     */
    public function campaign()
    {
        return $this->belongsTo(HrCommunication::class, 'campaign_id');
    }

    /**
     * Relation avec l'employé
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Override pour les clés composites
     */
    protected function setKeysForSaveQuery($query)
    {
        $query->where('campaign_id', '=', $this->getAttribute('campaign_id'))
              ->where('employee_id', '=', $this->getAttribute('employee_id'));
        return $query;
    }
}
