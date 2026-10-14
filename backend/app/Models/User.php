<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    public const AVATAR_KEYS = [
        'avatar_01',
        'avatar_02',
        'avatar_03',
        'avatar_04',
        'avatar_05',
        'avatar_06',
        'avatar_07',
        'avatar_08',
        'avatar_09',
        'avatar_10',
        'avatar_11',
        'avatar_12',
        'avatar_13',
        'avatar_14',
        'avatar_15',
        'avatar_16',
        'avatar_17',
        'avatar_18',
        'avatar_19',
        'avatar_20',
        'avatar_21',
        'avatar_22',
        'avatar_23',
        'avatar_24',
        'avatar_25',
        'avatar_26',
    ];
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_key',
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
        ];
    }

    public function player(): HasOne
    {
        return $this->hasOne(Player::class);
    }
}
