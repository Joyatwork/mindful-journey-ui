<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use App\Models\Role;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected static function booted(): void
    {
        static::created(function (self $user): void {
            $user->syncEmployeeProfile();
        });

        static::updated(function (self $user): void {
            if ($user->wasChanged(['role', 'role_id', 'entreprise_id'])) {
                $user->syncEmployeeProfile();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
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
        'totp_secret',
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
        // Prefer explicit avatar_url column if set (external URL or precomputed)
        try {
            $explicit = $this->getOriginal('avatar_url');
        } catch (\Throwable $e) {
            $explicit = null;
        }

        if (!empty($explicit) && is_string($explicit)) {
            return $explicit;
        }

        // Check if avatar is already a full URL (Cloudinary or other external)
        if (!empty($this->avatar)) {
            $avatar = $this->avatar;
            
            // If it's already a full URL, return as-is
            if (str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://')) {
                return $avatar;
            }
            
            // Fallback to local stored avatar path -> public URL through storage symlink
            return asset('storage/' . ltrim($avatar, '/'));
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
     * Lien vers le rôle principal de l'utilisateur.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Lien vers le profil employé (employees)
     */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class, 'user_id');
    }

    /**
     * Returns the normalized role name from the new role relation or legacy scalar column.
     */
    public function getNormalizedRoleName(): ?string
    {
        // Prefer the related Role model when available.
        if ($this->relationLoaded('role') || $this->role_id !== null) {
            $relatedRole = $this->getRelation('role');
            if ($relatedRole instanceof Role) {
                return $relatedRole->name;
            }
        }

        // Fall back to the legacy scalar role column, if present.
        $legacyRole = $this->getAttribute('role');
        return is_string($legacyRole) ? $legacyRole : null;
    }

    /**
     * Returns true when the user matches any of the provided role names.
     * Accepts a single role string or an array of role strings.
     */
    public function hasAnyRole(array|string $roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        $currentRole = $this->getNormalizedRoleName();
        return $currentRole !== null && in_array($currentRole, $roles, true);
    }

    public function syncEmployeeProfile(?int $entrepriseId = null): void
    {
        try {
            if (!Schema::hasTable('employees')) {
                return;
            }

            if (DB::table('employees')->where('user_id', $this->id)->exists()) {
                return;
            }

            $roleName = $this->getNormalizedRoleName();
            if ($roleName !== 'employee') {
                return;
            }

            $resolvedEntrepriseId = $entrepriseId ?? $this->entreprise_id ?? null;
            $empColumns = Schema::getColumnListing('employees');
            $data = ['user_id' => $this->id];

            if ($resolvedEntrepriseId !== null && in_array('entreprise_id', $empColumns, true)) {
                $data['entreprise_id'] = (int) $resolvedEntrepriseId;
            }

            $nullable = [];
            try {
                $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
                if ($dbName) {
                    $rows = DB::select('SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [$dbName, 'employees']);
                    foreach ($rows as $row) {
                        $nullable[$row->COLUMN_NAME] = [
                            'nullable' => ($row->IS_NULLABLE === 'YES'),
                            'type' => $row->DATA_TYPE,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                // ignore
            }

            foreach (['first_name', 'last_name', 'name'] as $col) {
                if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                    $data[$col] = '';
                }
            }
            foreach (['salary', 'age'] as $col) {
                if (in_array($col, $empColumns, true) && (isset($nullable[$col]) && !$nullable[$col]['nullable'])) {
                    $data[$col] = 0;
                }
            }

            if (in_array('employee_number', $empColumns, true)) {
                $data['employee_number'] = 'E-' . $this->id . '-' . substr((string) time(), -5);
            }
            if (in_array('department', $empColumns, true)) {
                $data['department'] = $data['department'] ?? '';
            }
            if (in_array('position_title', $empColumns, true)) {
                $data['position_title'] = $data['position_title'] ?? '';
            }
            if (in_array('employment_status', $empColumns, true)) {
                $data['employment_status'] = $data['employment_status'] ?? 'active';
            }
            if (in_array('current_risk_level', $empColumns, true)) {
                $data['current_risk_level'] = $data['current_risk_level'] ?? 'stable';
            }
            if (in_array('current_risk_score', $empColumns, true)) {
                $data['current_risk_score'] = $data['current_risk_score'] ?? 0;
            }
            if (in_array('date_hired', $empColumns, true)) {
                $data['date_hired'] = $data['date_hired'] ?? now()->toDateString();
            }
            if (in_array('last_activity_at', $empColumns, true)) {
                $data['last_activity_at'] = $data['last_activity_at'] ?? now();
            }

            if (in_array('department_id', $empColumns, true) && (isset($nullable['department_id']) && !$nullable['department_id']['nullable'])) {
                $depId = null;
                foreach (['departments', 'departements', 'teams'] as $tbl) {
                    if (Schema::hasTable($tbl)) {
                        $depId = DB::table($tbl)->value('id');
                        if ($depId) break;
                    }
                }
                $data['department_id'] = $depId ?? 1;
            }

            if (in_array('site_id', $empColumns, true)) {
                $siteId = null;
                if (Schema::hasTable('sites')) {
                    $siteId = DB::table('sites')->value('id');
                }
                if ($siteId) {
                    $data['site_id'] = $siteId;
                } elseif (isset($nullable['site_id']) && !$nullable['site_id']['nullable']) {
                    $data['site_id'] = 1;
                }
            }

            if (in_array('manager_id', $empColumns, true)) {
                $mgr = null;
                if (Schema::hasTable('employees')) {
                    $mgr = DB::table('employees')->value('id');
                }
                if ($mgr) {
                    $data['manager_id'] = $mgr;
                } elseif (isset($nullable['manager_id']) && !$nullable['manager_id']['nullable']) {
                    $data['manager_id'] = 1;
                }
            }

            if (in_array('created_at', $empColumns, true)) $data['created_at'] = now();
            if (in_array('updated_at', $empColumns, true)) $data['updated_at'] = now();

            DB::table('employees')->insert($data);
        } catch (\Throwable $e) {
            Log::warning('User::syncEmployeeProfile failed', [
                'user_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
