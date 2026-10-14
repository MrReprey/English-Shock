<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnglishWord extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'word',
    ];
}