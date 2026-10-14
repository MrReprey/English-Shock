<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameRoom;
use App\Models\RoomPlayer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MultiplayerRoomController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
            ],

            'max_players' => [
                'required',
                'integer',
                'min:2',
                'max:10',
            ],

            'initial_lives' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],

            'is_private' => [
                'required',
                'boolean',
            ],
        ]);

        /** @var User $user */
        $user = $request->user();

        $room = DB::transaction(
            function () use ($validated, $user) {
                $room = GameRoom::create([
                    'host_user_id' => $user->id,
                    'code' => $this->generateUniqueCode(),
                    'name' => $validated['name'],
                    'status' => GameRoom::STATUS_WAITING,
                    'max_players' =>
                        $validated['max_players'],
                    'initial_lives' =>
                        $validated['initial_lives'],
                    'is_private' =>
                        $validated['is_private'],
                ]);

                $room->players()->create([
                    'user_id' => $user->id,
                    'lives_remaining' =>
                        $room->initial_lives,
                    'turn_order' => 1,
                    'correct_words' => 0,
                    'status' =>
                        RoomPlayer::STATUS_WAITING,
                    'joined_at' => now(),
                ]);

                return $room;
            }
        );

        $room->load([
            'host:id,name',
            'players.user:id,name',
        ]);

        return response()->json([
            'message' =>
                'Sala creada correctamente.',

            'room' => [
                'id' => $room->id,
                'code' => $room->code,
                'name' => $room->name,
                'status' => $room->status,
                'max_players' =>
                    $room->max_players,
                'initial_lives' =>
                    $room->initial_lives,
                'is_private' =>
                    $room->is_private,

                'host' => $room->host,

                'players' => $room->players->map(
                    function (RoomPlayer $player) {
                        return [
                            'id' => $player->id,
                            'user' => $player->user,
                            'lives_remaining' =>
                                $player->lives_remaining,
                            'turn_order' =>
                                $player->turn_order,
                            'correct_words' =>
                                $player->correct_words,
                            'status' =>
                                $player->status,
                        ];
                    }
                ),
            ],
        ], 201);
    }

    public function show(
        Request $request,
        string $code
    ): JsonResponse {
        $room = GameRoom::query()
            ->where('code', strtoupper($code))
            ->with([
                'host:id,name',
                'players.user:id,name',
            ])
            ->first();

        if (!$room) {
            return response()->json([
                'message' => 'La sala no existe.',
            ], 404);
        }

        $isParticipant = $room->players
            ->contains(
                'user_id',
                $request->user()->id
            );

        if (!$isParticipant) {
            return response()->json([
                'message' =>
                    'No perteneces a esta sala.',
            ], 403);
        }

        return response()->json([
            'room' => $room,
        ]);
    }

    public function join(
        Request $request,
        string $code
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $room = DB::transaction(
            function () use ($code, $user) {
                $room = GameRoom::query()
                    ->where(
                        'code',
                        strtoupper($code)
                    )
                    ->lockForUpdate()
                    ->first();

                if (!$room) {
                    throw ValidationException::withMessages([
                        'code' => [
                            'La sala no existe.',
                        ],
                    ]);
                }

                if (
                    $room->status !==
                    GameRoom::STATUS_WAITING
                ) {
                    throw ValidationException::withMessages([
                        'code' => [
                            'La partida ya comenzó o terminó.',
                        ],
                    ]);
                }

                $existingPlayer = $room
                    ->players()
                    ->where('user_id', $user->id)
                    ->first();

                if (
                    $existingPlayer &&
                    $existingPlayer->status !==
                        RoomPlayer::STATUS_LEFT
                ) {
                    return $room;
                }

                $currentPlayers = $room
                    ->players()
                    ->where(
                        'status',
                        '!=',
                        RoomPlayer::STATUS_LEFT
                    )
                    ->count();

                if (
                    $currentPlayers >=
                    $room->max_players
                ) {
                    throw ValidationException::withMessages([
                        'code' => [
                            'La sala está llena.',
                        ],
                    ]);
                }

                $nextTurnOrder =
                    ((int) $room
                        ->players()
                        ->max('turn_order')) + 1;

                if ($existingPlayer) {
                    $existingPlayer->update([
                        'lives_remaining' =>
                            $room->initial_lives,
                        'turn_order' =>
                            $nextTurnOrder,
                        'correct_words' => 0,
                        'status' =>
                            RoomPlayer::STATUS_WAITING,
                        'joined_at' => now(),
                    ]);
                } else {
                    $room->players()->create([
                        'user_id' => $user->id,
                        'lives_remaining' =>
                            $room->initial_lives,
                        'turn_order' =>
                            $nextTurnOrder,
                        'correct_words' => 0,
                        'status' =>
                            RoomPlayer::STATUS_WAITING,
                        'joined_at' => now(),
                    ]);
                }

                return $room;
            }
        );

        $room->load([
            'host:id,name',
            'players.user:id,name',
        ]);

        return response()->json([
            'message' =>
                'Te uniste correctamente a la sala.',

            'room' => $room,
        ]);
    }

    private function generateUniqueCode(): string
    {
        $characters =
            'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        do {
            $code = '';

            for ($position = 0; $position < 6; $position++) {
                $randomPosition = random_int(
                    0,
                    strlen($characters) - 1
                );

                $code .=
                    $characters[$randomPosition];
            }
        } while (
            GameRoom::where('code', $code)->exists()
        );

        return $code;
    }
}