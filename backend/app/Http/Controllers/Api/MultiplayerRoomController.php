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
use App\Events\MultiplayerGameUpdated;
use App\Models\EnglishWord;

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
            'host:id,name,avatar_key',
            'players.user:id,name,avatar_key',
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
                'host:id,name,avatar_key',
                'players.user:id,name,avatar_key',
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
            'host:id,name,avatar_key',
            'players.user:id,name,avatar_key',
        ]);

        return response()->json([
            'message' =>
                'Te uniste correctamente a la sala.',

            'room' => $room,
        ]);
    }

    public function start(
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
                    (int) $room->host_user_id !==
                    (int) $user->id
                ) {
                    abort(
                        403,
                        'Solo el creador puede iniciar la partida.'
                    );
                }

                if (
                    $room->status !==
                    GameRoom::STATUS_WAITING
                ) {
                    throw ValidationException::withMessages([
                        'room' => [
                            'La partida ya fue iniciada.',
                        ],
                    ]);
                }

                $players = $room
                    ->players()
                    ->where(
                        'status',
                        '!=',
                        RoomPlayer::STATUS_LEFT
                    )
                    ->orderBy('turn_order')
                    ->lockForUpdate()
                    ->get();

                if ($players->count() < 2) {
                    throw ValidationException::withMessages([
                        'players' => [
                            'Se necesitan al menos dos jugadores.',
                        ],
                    ]);
                }

                foreach ($players as $player) {
                    $player->update([
                        'lives_remaining' =>
                            $room->initial_lives,

                        'correct_words' => 0,

                        'status' =>
                            RoomPlayer::STATUS_ACTIVE,
                    ]);
                }

                

                $firstPlayer = $players->random();

                $fragment =
                    GameRoom::randomFragment();

                $duration =
                    GameRoom::randomTurnDuration();

                $duration = random_int(5, 10);
                $startedAt = now();

                $room->update([
                    'status' =>
                        GameRoom::STATUS_PLAYING,

                    'current_room_player_id' =>
                        $firstPlayer->id,

                    'current_fragment' =>
                        $fragment,

                    'turn_duration_seconds' =>
                        $duration,

                    'turn_started_at' =>
                        $startedAt,

                    'turn_ends_at' =>
                        $startedAt
                            ->copy()
                            ->addSeconds($duration),

                    'round_number' => 1,
                    'used_words' => [],
                    'last_valid_word' => null,
                    'winner_user_id' => null,
                    'started_at' => $startedAt,
                    'finished_at' => null,
                ]);

                return $room->fresh([
                    'host:id,name,avatar_key',
                    'players.user:id,name,avatar_key',
                    'currentPlayer.user:id,name,avatar_key',
                ]);
            }
        );

        broadcast(
            new MultiplayerGameUpdated(
                $room->code,
                'game_started'
            )
        );

        return response()->json([
            'message' =>
                'La partida comenzó correctamente.',

            'room' => $room,
        ]);
    }

    public function submitWord(
        Request $request,
        string $code
    ): JsonResponse {
        $validated = $request->validate([
            'word' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[A-Za-z]+$/',
            ],
        ]);

        /** @var User $user */
        $user = $request->user();

        $word = strtolower(
            trim($validated['word'])
        );

        $room = DB::transaction(
            function () use (
                $code,
                $user,
                $word
            ) {
                $room = GameRoom::query()
                    ->where(
                        'code',
                        strtoupper($code)
                    )
                    ->lockForUpdate()
                    ->first();

                if (!$room) {
                    throw ValidationException::withMessages([
                        'room' => [
                            'La sala no existe.',
                        ],
                    ]);
                }

                if (
                    $room->status !==
                    GameRoom::STATUS_PLAYING
                ) {
                    throw ValidationException::withMessages([
                        'room' => [
                            'La partida no está activa.',
                        ],
                    ]);
                }

                $currentPlayer = $room
                    ->players()
                    ->whereKey(
                        $room->current_room_player_id
                    )
                    ->lockForUpdate()
                    ->first();

                if (
                    !$currentPlayer ||
                    (int) $currentPlayer->user_id !==
                        (int) $user->id
                ) {
                    throw ValidationException::withMessages([
                        'word' => [
                            'No es tu turno.',
                        ],
                    ]);
                }

                if (
                    !$room->turn_ends_at ||
                    now()->greaterThanOrEqualTo(
                        $room->turn_ends_at
                    )
                ) {
                    throw ValidationException::withMessages([
                        'word' => [
                            'El tiempo del turno terminó.',
                        ],
                    ]);
                }

                $fragment = strtolower(
                    (string) $room->current_fragment
                );

                if (
                    !str_contains(
                        $word,
                        $fragment
                    )
                ) {
                    throw ValidationException::withMessages([
                        'word' => [
                            "La palabra debe contener {$room->current_fragment}.",
                        ],
                    ]);
                }

                if (
                    !EnglishWord::query()
                        ->where('word', $word)
                        ->exists()
                ) {
                    throw ValidationException::withMessages([
                        'word' => [
                            'La palabra no existe en el diccionario.',
                        ],
                    ]);
                }

                $usedWords =
                    $room->used_words ?? [];

                if (
                    in_array(
                        $word,
                        $usedWords,
                        true
                    )
                ) {
                    throw ValidationException::withMessages([
                        'word' => [
                            'Esa palabra ya fue utilizada.',
                        ],
                    ]);
                }

                $players = $room
                    ->players()
                    ->where(
                        'status',
                        RoomPlayer::STATUS_ACTIVE
                    )
                    ->where(
                        'lives_remaining',
                        '>',
                        0
                    )
                    ->orderBy('turn_order')
                    ->lockForUpdate()
                    ->get();

                $currentPosition = $players
                    ->search(
                        fn (RoomPlayer $player) =>
                            (int) $player->id ===
                            (int) $currentPlayer->id
                    );

                if ($currentPosition === false) {
                    throw ValidationException::withMessages([
                        'room' => [
                            'No se pudo determinar el siguiente turno.',
                        ],
                    ]);
                }

                $nextPosition =
                    ($currentPosition + 1) %
                    $players->count();

                $nextPlayer = $players->get(
                    $nextPosition
                );

                $usedWords[] = $word;

                $turnStartedAt = now();
                $duration =
                    GameRoom::randomTurnDuration();

                $room->update([
                    'current_room_player_id' =>
                        $nextPlayer->id,

                    'current_fragment' =>
                        GameRoom::randomFragment(),

                    'turn_duration_seconds' =>
                        $duration,

                    'turn_started_at' =>
                        $turnStartedAt,

                    'turn_ends_at' =>
                        $turnStartedAt
                            ->copy()
                            ->addSeconds($duration),

                    'round_number' =>
                        $room->round_number + 1,

                    'used_words' => $usedWords,
                    'last_valid_word' => $word,
                ]);

                return $room->fresh([
                    'host:id,name,avatar_key',
                    'players.user:id,name,avatar_key',
                    'currentPlayer.user:id,name,avatar_key',
                ]);
            }
        );

        broadcast(
            new MultiplayerGameUpdated(
                $room->code,
                'word_accepted'
            )
        );

        return response()->json([
            'message' => 'Palabra correcta.',
            'accepted_word' => $word,
            'room' => $room,
        ]);
    }

    public function timeout(
        Request $request,
        string $code
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $result = DB::transaction(
            function () use ($code, $user) {
                $room = GameRoom::query()
                    ->where('code', strtoupper($code))
                    ->lockForUpdate()
                    ->first();

                if (!$room) {
                    throw ValidationException::withMessages([
                        'code' => ['La sala no existe.'],
                    ]);
                }

                $isParticipant = $room
                    ->players()
                    ->where('user_id', $user->id)
                    ->where(
                        'status',
                        '!=',
                        RoomPlayer::STATUS_LEFT
                    )
                    ->exists();

                if (!$isParticipant) {
                    abort(403, 'No perteneces a esta sala.');
                }

                /*
                * Evita descontar vidas si la partida terminó,
                * el tiempo todavía no terminó o ya fue procesado.
                */
                if (
                    $room->status !==
                        GameRoom::STATUS_PLAYING ||
                    !$room->turn_ends_at ||
                    now()->lt($room->turn_ends_at)
                ) {
                    return [
                        'room' => $room,
                        'processed' => false,
                        'action' => null,
                    ];
                }

                $currentPlayer = RoomPlayer::query()
                    ->where(
                        'id',
                        $room->current_room_player_id
                    )
                    ->where(
                        'game_room_id',
                        $room->id
                    )
                    ->lockForUpdate()
                    ->first();

                if (!$currentPlayer) {
                    abort(
                        409,
                        'No se encontró al jugador del turno.'
                    );
                }

                $remainingLives = max(
                    0,
                    $currentPlayer->lives_remaining - 1
                );

                $currentPlayer->update([
                    'lives_remaining' => $remainingLives,

                    'status' => $remainingLives === 0
                        ? RoomPlayer::STATUS_ELIMINATED
                        : RoomPlayer::STATUS_ACTIVE,
                ]);

                $activePlayers = RoomPlayer::query()
                    ->where('game_room_id', $room->id)
                    ->where(
                        'status',
                        RoomPlayer::STATUS_ACTIVE
                    )
                    ->where('lives_remaining', '>', 0)
                    ->orderBy('turn_order')
                    ->lockForUpdate()
                    ->get();

                /*
                * Si solamente queda un jugador,
                * termina la partida.
                */
                if ($activePlayers->count() <= 1) {
                    $winner = $activePlayers->first();

                    $room->update([
                        'status' =>
                            GameRoom::STATUS_FINISHED,

                        'winner_user_id' =>
                            $winner?->user_id,

                        'current_room_player_id' =>
                            null,

                        'current_fragment' => null,
                        'turn_started_at' => null,
                        'turn_ends_at' => null,
                        'finished_at' => now(),
                    ]);

                    return [
                        'room' => $room,
                        'processed' => true,
                        'action' => 'game_finished',
                    ];
                }

                /*
                * Busca al siguiente jugador activo según
                * el orden de los turnos.
                */
                $nextPlayer = $activePlayers->first(
                    function (RoomPlayer $player) use (
                        $currentPlayer
                    ) {
                        return $player->turn_order >
                            $currentPlayer->turn_order;
                    }
                );

                if (!$nextPlayer) {
                    $nextPlayer = $activePlayers->first();
                }

                $turnDuration =
                    GameRoom::randomTurnDuration();

                $room->update([
                    'current_room_player_id' =>
                        $nextPlayer->id,

                    'current_fragment' =>
                        GameRoom::randomFragment(),

                    'turn_duration_seconds' =>
                        $turnDuration,

                    'turn_started_at' => now(),

                    'turn_ends_at' =>
                        now()->addSeconds($turnDuration),

                    'round_number' =>
                        $room->round_number + 1,
                ]);

                return [
                    'room' => $room,
                    'processed' => true,
                    'action' => 'turn_timed_out',
                ];
            }
        );

        $room = $result['room']->fresh([
            'host:id,name,avatar_key',
            'players.user:id,name,avatar_key',
            'currentPlayer.user:id,name,avatar_key',
        ]);

        if ($result['processed']) {
            broadcast(
                new \App\Events\MultiplayerGameUpdated(
                    $room->code,
                    $result['action']
                )
            );
        }

        return response()->json([
            'message' => $result['processed']
                ? 'El jugador perdió una vida.'
                : 'El turno ya fue procesado.',

            'processed' => $result['processed'],
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