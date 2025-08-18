<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserChallenge extends Model
{
    use HasFactory;

    protected $table = 'user_challenges';

    protected $fillable = [
        'user_id',
        'challenge_id',
        'completed_at',
    ];

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
