<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    protected $table = 'employees';
    protected $fillable = [
        'user_id',
        'entreprise_id',
        'site_id',
        'employee_number',
        'department',
        'position_title',
        'manager_id',
        'date_hired',
        'employment_status',
        'last_activity_at',
        'current_risk_level',
        'current_risk_score',
        'created_at',
        'updated_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }
}
