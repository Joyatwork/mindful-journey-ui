<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
}
