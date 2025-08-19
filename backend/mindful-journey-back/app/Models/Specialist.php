<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specialist extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'specialty',
        'rating',
        'experience_years',
        'price_cents',
        'availability',
        'consultation_type',
        'description',
        'location',
        'image_url',
        'education',
        'languages',
        'review_count',
    ];

    protected $casts = [
        'rating' => 'float',
        'experience_years' => 'integer',
        'price_cents' => 'integer',
        'education' => 'array',
        'languages' => 'array',
        'review_count' => 'integer',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
