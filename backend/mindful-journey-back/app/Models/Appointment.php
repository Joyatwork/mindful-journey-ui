<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        // mindful_journey schema fields
        'employee_id',
        'practitioner_id',
        'entreprise_id',
        'service_id',
        'created_by',
        'scheduled_at',
        'mode',
        'status',
        'price_cents',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function specialist(): BelongsTo
    {
        // Map to practitioners via Specialist model with FK practitioner_id
        return $this->belongsTo(Specialist::class, 'practitioner_id');
    }
}
