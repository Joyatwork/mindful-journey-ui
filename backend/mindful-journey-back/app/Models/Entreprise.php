<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Entreprise extends Model
{
    protected $table = 'entreprises';
    protected $fillable = [
        'name',
        // autres champs potentiels de la table entreprises
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'entreprise_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'entreprise_id');
    }
}
