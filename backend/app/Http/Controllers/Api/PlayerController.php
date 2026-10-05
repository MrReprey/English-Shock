<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlayerController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        $user = $request->user();

        $player = Player::firstOrNew([
            'user_id' => $user->id,
        ]);

        $isNewPlayer = !$player->exists;
        $avatarPath = $player->avatar;

        if ($request->hasFile('avatar')) {
            if ($avatarPath) {
                Storage::disk('public')->delete($avatarPath);
            }

            $avatarPath = $request
                ->file('avatar')
                ->store('avatars', 'public');
        }

        $player->fill([
            'name' => $user->name,
            'avatar' => $avatarPath,
        ]);

        $player->save();

        return response()->json([
            'message' => $isNewPlayer
                ? 'Jugador registrado correctamente'
                : 'Perfil del jugador actualizado',

            'player' => [
                'id' => $player->id,
                'name' => $player->name,

                'avatar_url' => $player->avatar
                    ? Storage::url($player->avatar)
                    : null,
            ],
        ], $isNewPlayer ? 201 : 200);
    }
}