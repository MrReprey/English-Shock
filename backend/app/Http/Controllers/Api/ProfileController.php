<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $player = $user->player;

        if (!$player) {
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],

                'player' => null,

                'statistics' => [
                    'total_games' => 0,
                    'best_scores' => [],
                ],
            ]);
        }

        $scores = $player
            ->scores()
            ->orderByDesc('correct_answers')
            ->orderBy('completion_time_ms')
            ->get();

        $bestScores = $scores
            ->groupBy(function ($score) {
                return $score->game_type
                    . '|'
                    . $score->category;
            })
            ->map(function ($categoryScores) {
                $bestScore = $categoryScores->first();

                return [
                    'game_type' =>
                        $bestScore->game_type,

                    'category' =>
                        $bestScore->category,

                    'correct_answers' =>
                        $bestScore->correct_answers,

                    'total_questions' =>
                        $bestScore->total_questions,

                    'completion_time_ms' =>
                        $bestScore->completion_time_ms,

                    'completion_time_seconds' =>
                        round(
                            $bestScore->completion_time_ms
                            / 1000,
                            2
                        ),
                ];
            })
            ->values();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],

            'player' => [
                'id' => $player->id,
                'name' => $player->name,

                'avatar_url' => $player->avatar
                    ? Storage::url($player->avatar)
                    : null,
            ],

            'statistics' => [
                'total_games' => $scores->count(),
                'best_scores' => $bestScores,
            ],
        ]);
    }
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:80',
            ],

            'email' => [
                'required',
                'email',
                'max:255',

                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'avatar' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $player = $user->player;

        if (!$player) {
            $player = $user->player()->create([
                'name' => $user->name,
                'avatar' => null,
            ]);
        }

        $avatarPath = $player->avatar;

        if ($request->hasFile('avatar')) {
            $newAvatarPath = $request
                ->file('avatar')
                ->store('avatars', 'public');

            if ($avatarPath) {
                Storage::disk('public')
                    ->delete($avatarPath);
            }

            $avatarPath = $newAvatarPath;
        }

        $player->update([
            'name' => $user->name,
            'avatar' => $avatarPath,
        ]);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],

            'player' => [
                'id' => $player->id,
                'name' => $player->name,

                'avatar_url' => $player->avatar
                    ? Storage::url($player->avatar)
                    : null,
            ],
        ]);
    }
}