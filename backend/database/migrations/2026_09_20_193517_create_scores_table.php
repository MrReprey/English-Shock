<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scores', function (Blueprint $table) {
            $table->id();

            $table->foreignId('player_id')
                ->constrained('players')
                ->cascadeOnDelete();

            $table->string('game_type', 50);

            $table->string('category', 80);

            $table->unsignedTinyInteger(
                'correct_answers'
            );

            $table->unsignedTinyInteger(
                'total_questions'
            )->default(10);

            $table->unsignedInteger(
                'completion_time_ms'
            );

            $table->timestamps();

            $table->index(
                [
                    'game_type',
                    'category',
                    'correct_answers',
                    'completion_time_ms',
                ],
                'scores_leaderboard_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};