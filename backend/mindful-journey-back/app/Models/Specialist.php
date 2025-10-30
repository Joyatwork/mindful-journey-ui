<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Specialist extends Model
{
    use HasFactory;

    // This model should read/write the real table named `practitioners`.
    protected $table = 'practitioners';

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
        // practitioners table stores specializations/certifications as json
        'specializations' => 'array',
        'certifications' => 'array',
        'review_count' => 'integer',
    ];

    /**
     * If the practitioners table uses first_name and last_name, expose a virtual
     * `name` attribute expected by the rest of the app.
     */
    public function getNameAttribute($value)
    {
        $first = $this->attributes['first_name'] ?? null;
        $last = $this->attributes['last_name'] ?? null;

        if ($first || $last) {
            return trim(($first ?? '') . ' ' . ($last ?? ''));
        }
        // Fallback: if linked to users table, return the user's name
        if (empty($value) && !empty($this->attributes['user_id'])) {
            try {
                return optional($this->user)->name ?? $value;
            } catch (\Throwable $e) {
                // ignore relation issues
            }
        }
        return $value;
    }

    /**
     * Map `specializations` (array) to a single `specialty` string when requested.
     */
    public function getSpecialtyAttribute($value)
    {
        $specs = $this->attributes['specializations'] ?? null;
        if ($specs) {
            // stored as JSON or array; try decode if string
            if (is_string($specs)) {
                $decoded = json_decode($specs, true);
                if (is_array($decoded) && count($decoded)) {
                    return is_array($decoded[0]) ? json_encode($decoded[0]) : $decoded[0];
                }
            } elseif (is_array($specs) && count($specs)) {
                return is_array($specs[0]) ? json_encode($specs[0]) : $specs[0];
            }
        }

        return $value;
    }

    /**
     * Provide description fallback from practitioners.bio
     */
    public function getDescriptionAttribute($value)
    {
        return $this->attributes['bio'] ?? $value;
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Link to the owning user (if practitioners.user_id exists)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
