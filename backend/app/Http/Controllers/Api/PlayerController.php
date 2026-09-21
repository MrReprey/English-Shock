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
            'name' => [
                'required',
                'string',
                'max:80',
            ],

            'avatar' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        $avatarPath = null;

        if ($request->hasFile('avatar')) {
            $avatarPath = $request
                ->file('avatar')
                ->store('avatars', 'public');
        }

        $player = Player::create([
            'name' => $validated['name'],
            'avatar' => $avatarPath,
        ]);

        return response()->json([
            'message' => 'Jugador registrado correctamente',

            'player' => [
                'id' => $player->id,
                'name' => $player->name,

                'avatar_url' => $player->avatar
                    ? Storage::url($player->avatar)
                    : null,
            ],
        ], 201);
    }
}