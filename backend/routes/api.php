<?php

use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\ScoreController;
use Illuminate\Support\Facades\Route;

Route::post(
    '/players',
    [PlayerController::class, 'store']
);

Route::post(
    '/scores',
    [ScoreController::class, 'store']
);

Route::get(
    '/leaderboard',
    [ScoreController::class, 'leaderboard']
);