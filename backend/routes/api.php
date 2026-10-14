<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\ScoreController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\MultiplayerRoomController;

Route::post(
    '/register',
    [AuthController::class, 'register']
);

Route::post(
    '/login',
    [AuthController::class, 'login']
);

Route::middleware('auth:sanctum')->group(function () {
    Route::get(
        '/user',
        [AuthController::class, 'user']
    );

    Route::get(
        '/profile',
        [ProfileController::class, 'show']
    );

    Route::post(
        '/profile',
        [ProfileController::class, 'update']
    );

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::post(
        '/players',
        [PlayerController::class, 'store']
    );

    Route::post(
        '/scores',
        [ScoreController::class, 'store']
    );

    Route::post(
        '/multiplayer/rooms',
        [MultiplayerRoomController::class, 'store']
    );

    Route::get(
        '/multiplayer/rooms/{code}',
        [MultiplayerRoomController::class, 'show']
    );

    Route::post(
        '/multiplayer/rooms/{code}/join',
        [MultiplayerRoomController::class, 'join']
    );

});

Route::get(
    '/leaderboard',
    [ScoreController::class, 'leaderboard']
);