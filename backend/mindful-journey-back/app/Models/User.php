<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'provider',
        'avatar_url',
        'birth_date',
        'gender',
        'phone',
        'bio',
        'avatar',
        'preferences',
        'health_goals',
        'status',
        'entreprise_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attributes to append to the model's array / JSON form.
     * This ensures accessors like avatar_url are present in API responses.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'preferences' => 'array',
            'health_goals' => 'array',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Relation avec les défis.
     *
     * Un utilisateur peut participer à plusieurs défis.
     * La table pivot est "challenge_user".
     */
    public function challenges(): BelongsToMany
    {
        return $this->belongsToMany(Challenge::class, 'challenge_user')
            ->withPivot(['completed_at'])
            ->withTimestamps();
    }

    /**
     * Accessor to get public URL for avatar if stored.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        return null;
    }

    /**
     * Override default password reset notification to point to SPA frontend.
     */
    public function sendPasswordResetNotification($token): void
    {
        $frontendBase = rtrim(env('FRONTEND_URL', 'http://localhost:8080'), '/');
        $resetUrl = $frontendBase . '/reset-password?token=' . $token . '&email=' . urlencode($this->email);
        $this->notify(new \App\Notifications\CustomResetPasswordNotification($resetUrl));
    }

    /**
     * Lien vers l'entreprise (entreprises)
     */
    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }

    /**
     * Lien vers le profil employé (employees)
     */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class, 'user_id');
    }
}
