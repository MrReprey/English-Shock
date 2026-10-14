<?php

use App\Models\RoomPlayer;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    'multiplayer.room.{code}',
    function (User $user, string $code) {
        $belongsToRoom = RoomPlayer::query()
            ->where('user_id', $user->id)
            ->where('status', '!=', 'left')
            ->whereHas(
                'room',
                function ($query) use ($code) {
                    $query->where(
                        'code',
                        strtoupper($code)
                    );
                }
            )
            ->exists();

        if (!$belongsToRoom) {
            return false;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }
);