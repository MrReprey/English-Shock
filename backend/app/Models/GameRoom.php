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

    public const FRAGMENTS = [
        'AN',
        'AR',
        'AT',
        'EA',
        'ED',
        'EN',
        'ER',
        'IN',
        'ING',
        'IT',
        'LE',
        'LY',
        'ON',
        'OR',
        'OU',
        'RE',
        'ST',
        'TH',
    ];

    public static function randomFragment(): string
    {
        return self::FRAGMENTS[
            array_rand(self::FRAGMENTS)
        ];
    }

    public static function randomTurnDuration(): int
    {
        return random_int(5, 10);
    }


    protected $fillable = [
        'host_user_id',
        'code',
        'name',
        'status',
        'max_players',
        'initial_lives',
        'is_private',

        'current_room_player_id',
        'current_fragment',
        'turn_duration_seconds',
        'turn_started_at',
        'turn_ends_at',
        'round_number',
        'used_words',
        'last_valid_word',
        'winner_user_id',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'host_user_id' => 'integer',
            'max_players' => 'integer',
            'initial_lives' => 'integer',
            'is_private' => 'boolean',

            'current_room_player_id' =>
                'integer',

            'turn_duration_seconds' =>
                'integer',

            'round_number' => 'integer',
            'used_words' => 'array',

            'winner_user_id' => 'integer',

            'turn_started_at' => 'datetime',
            'turn_ends_at' => 'datetime',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
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

    public function currentPlayer(): BelongsTo
    {
        return $this->belongsTo(
            RoomPlayer::class,
            'current_room_player_id'
        );
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'winner_user_id'
        );
    }
}