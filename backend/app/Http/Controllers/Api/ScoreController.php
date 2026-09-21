<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ScoreController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'player_id' => [
                'required',
                'integer',
                'exists:players,id',
            ],

            'game_type' => [
                'required',
                'string',
                'max:50',
            ],

            'category' => [
                'required',
                'string',
                'max:80',
            ],

            'correct_answers' => [
                'required',
                'integer',
                'min:0',
                'lte:total_questions',
            ],

            'total_questions' => [
                'required',
                'integer',
                'min:1',
                'max:100',
            ],

            'completion_time_ms' => [
                'required',
                'integer',
                'min:1',
                'max:3600000',
            ],
        ]);

        $score = Score::create($validated);

        return response()->json([
            'message' => 'Resultado guardado correctamente',
            'score' => $score,
        ], 201);
    }

    public function leaderboard(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'type' => [
                'nullable',
                'string',
                'max:50',
            ],

            'category' => [
                'nullable',
                'string',
                'max:80',
            ],
        ]);

        $scores = Score::query()
            ->with('player:id,name,avatar')

            ->when(
                isset($validated['type']),
                function ($query) use ($validated) {
                    $query->where(
                        'game_type',
                        $validated['type']
                    );
                }
            )

            ->when(
                isset($validated['category']),
                function ($query) use ($validated) {
                    $query->where(
                        'category',
                        $validated['category']
                    );
                }
            )

            ->orderByDesc('correct_answers')
            ->orderBy('completion_time_ms')
            ->get()

            /*
             * Si un jugador tiene varias partidas,
             * conservamos solamente su mejor resultado.
             */

            ->unique('player_id')
            ->take(50)
            ->values();

        $leaderboard = $scores->map(
            function ($score, $index) {
                return [
                    'position' => $index + 1,

                    'player' => [
                        'id' => $score->player->id,
                        'name' => $score->player->name,

                        'avatar_url' =>
                            $score->player->avatar
                                ? Storage::url(
                                    $score->player->avatar
                                )
                                : null,
                    ],

                    'game_type' => $score->game_type,
                    'category' => $score->category,

                    'correct_answers' =>
                        $score->correct_answers,

                    'total_questions' =>
                        $score->total_questions,

                    'completion_time_ms' =>
                        $score->completion_time_ms,

                    'completion_time_seconds' =>
                        round(
                            $score->completion_time_ms
                            / 1000,
                            2
                        ),
                ];
            }
        );

        return response()->json([
            'leaderboard' => $leaderboard,
        ]);
    }
}