<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameRoom extends Model
{
    public const STATUS_WAITING = 'waiting';
    public const STATUS_PLAYING = 'playing';
    public const STATUS_FINISHED = 'finished';

    protected $fillable = [
        'host_user_id',
        'code',
        'name',
        'status',
        'max_players',
        'initial_lives',
        'is_private',
    ];

    protected function casts(): array
    {
        return [
            'host_user_id' => 'integer',
            'max_players' => 'integer',
            'initial_lives' => 'integer',
            'is_private' => 'boolean',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'host_user_id'
        );
    }

    public function players(): HasMany
    {
        return $this->hasMany(
            RoomPlayer::class
        );
    }
}