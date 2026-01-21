<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommunicationRead extends Model
{
    use HasFactory;

    protected $table = 'communication_reads';

    protected $fillable = [
        'communication_id',
        'user_id',
        'user_name',
        'user_email',
        'read_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'communication_id' => 'integer',
        'user_id' => 'integer'
    ];

    /**
     * Relation avec la communication
     */
    public function communication()
    {
        return $this->belongsTo(HrCommunication::class, 'communication_id');
    }

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
