<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomPlayer extends Model
{
    public const STATUS_WAITING = 'waiting';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_ELIMINATED = 'eliminated';
    public const STATUS_LEFT = 'left';

    protected $fillable = [
        'game_room_id',
        'user_id',
        'lives_remaining',
        'turn_order',
        'correct_words',
        'status',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'game_room_id' => 'integer',
            'user_id' => 'integer',
            'lives_remaining' => 'integer',
            'turn_order' => 'integer',
            'correct_words' => 'integer',
            'joined_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(
            GameRoom::class,
            'game_room_id'
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}