<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnualDiagnostic extends Model
{
    use HasFactory;

    protected $table = 'annual_diagnostics';

    protected $fillable = [
        'user_id',
        'gender',
        'age_group',
        'department',
        'stress_level',
        'energy_level',
        'work_pressure',
        'answers',
        'completed_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'completed_at' => 'datetime',
    ];
}
