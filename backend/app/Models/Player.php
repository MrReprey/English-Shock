<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    protected $fillable = [
        'name',
        'avatar',
    ];

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }
}