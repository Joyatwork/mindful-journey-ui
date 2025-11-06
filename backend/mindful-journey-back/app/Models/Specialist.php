<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Specialist extends Model
{
    use HasFactory;

    // Table dynamique: `practitioners` (par défaut) ou `praticiens` (schéma FR)
    protected $table = 'practitioners';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        try {
            // 1) Priorité à la variable d'environnement si définie
            $preferred = env('PRACTITIONERS_TABLE');
            if ($preferred && \Illuminate\Support\Facades\Schema::hasTable($preferred)) {
                $this->setTable($preferred);
                return;
            }

            // 2) Préférer la table FR `praticiens` si présente
            if (\Illuminate\Support\Facades\Schema::hasTable('praticiens')) {
                $this->setTable('praticiens');
                return;
            }

            // 3) Sinon, retomber sur `practitioners`
            if (\Illuminate\Support\Facades\Schema::hasTable('practitioners')) {
                $this->setTable('practitioners');
                return;
            }
        } catch (\Throwable $e) {
            // laisser la table par défaut si Schema indisponible
        }
    }

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
        // 1) specializations (json/array)
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
        // 2) fallback schéma FR: `speciality`
        if (empty($value) && array_key_exists('speciality', $this->attributes)) {
            return $this->attributes['speciality'];
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

    /**
     * Prix en cents (fallback depuis min_price si price_cents absent)
     */
    public function getPriceCentsAttribute($value)
    {
        if ($value !== null) return (int) $value;
        if (array_key_exists('min_price', $this->attributes) && $this->attributes['min_price'] !== null) {
            // min_price est un décimal 8,2 → convertir en cents
            return (int) round(((float) $this->attributes['min_price']) * 100);
        }
        return 0;
    }

    /**
     * Type de consultation normalisé pour le frontend (video|inPerson|both)
     */
    public function getConsultationTypeAttribute($value)
    {
        if (!empty($value)) return $value;
        $mode = $this->attributes['consultation_mode'] ?? null; // presentiel|teleconsultation|both
        return match ($mode) {
            'teleconsultation' => 'video',
            'presentiel' => 'inPerson',
            'both' => 'both',
            default => null,
        };
    }

    /**
     * Localisation fallback "ville, pays"
     */
    public function getLocationAttribute($value)
    {
        if (!empty($value)) return $value;
        $city = trim((string) ($this->attributes['city'] ?? ''));
        $country = trim((string) ($this->attributes['country'] ?? ''));
        $parts = array_filter([$city, $country]);
        return empty($parts) ? null : implode(', ', $parts);
    }

    /**
     * Expérience (années) fallback à 0 si absent
     */
    public function getExperienceYearsAttribute($value)
    {
        return (int) ($value ?? 0);
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
