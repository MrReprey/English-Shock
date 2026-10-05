<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\ScoreController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;

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
});

Route::get(
    '/leaderboard',
    [ScoreController::class, 'leaderboard']
);