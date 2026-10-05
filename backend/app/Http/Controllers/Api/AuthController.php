<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(
        Request $request
    ): JsonResponse {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' =>
                Hash::make($data['password']),
        ]);

        $token = $user
            ->createToken('english-shock-token')
            ->plainTextToken;

        return response()->json([
            'message' =>
                'Usuario registrado correctamente.',

            'user' => $this->userData($user),
            'token' => $token,
        ], 201);
    }

    public function login(
        Request $request
    ): JsonResponse {
        $data = $request->validate([
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);

        $user = User::where(
            'email',
            $data['email']
        )->first();

        if (
            !$user ||
            !Hash::check(
                $data['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'El correo o la contraseña son incorrectos.',
                ],
            ]);
        }

        $token = $user
            ->createToken('english-shock-token')
            ->plainTextToken;

        return response()->json([
            'message' =>
                'Inicio de sesión correcto.',

            'user' => $this->userData($user),
            'token' => $token,
        ]);
    }

    public function user(
        Request $request
    ): JsonResponse {
        return response()->json([
            'user' =>
                $this->userData(
                    $request->user()
                ),
        ]);
    }

    public function logout(
        Request $request
    ): JsonResponse {
        $request->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' =>
                'Sesión cerrada correctamente.',
        ]);
    }

    private function userData(
        User $user
    ): array {
        $user->loadMissing('player');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,

            'avatar_url' =>
                $user->player?->avatar
                    ? Storage::url(
                        $user->player->avatar
                    )
                    : null,
        ];
    }
}