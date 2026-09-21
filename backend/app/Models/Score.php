<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Score extends Model
{
    protected $fillable = [
        'player_id',
        'game_type',
        'category',
        'correct_answers',
        'total_questions',
        'completion_time_ms',
    ];

    protected function casts(): array
    {
        return [
            'player_id' => 'integer',
            'correct_answers' => 'integer',
            'total_questions' => 'integer',
            'completion_time_ms' => 'integer',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}