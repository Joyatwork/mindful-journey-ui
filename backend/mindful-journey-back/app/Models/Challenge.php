<?php
// app/Models/Challenge.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Challenge extends Model
{
    protected $fillable = ['title', 'description', 'type'];

    public function users(): BelongsToMany {
        return $this->belongsToMany(\App\Models\User::class, 'challenge_user')
            ->withPivot(['completed_at'])
            ->withTimestamps();
    }
}

