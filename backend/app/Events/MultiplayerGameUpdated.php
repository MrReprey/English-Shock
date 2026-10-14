<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MultiplayerGameUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public string $roomCode,
        public string $action
    ) {
        $this->roomCode = strtoupper(
            $this->roomCode
        );
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel(
                "multiplayer.room.{$this->roomCode}"
            ),
        ];
    }

    public function broadcastAs(): string
    {
        return 'multiplayer.game.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'room_code' => $this->roomCode,
            'action' => $this->action,
            'sent_at' => now()->toIso8601String(),
        ];
    }
}