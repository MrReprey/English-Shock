<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_players', function (Blueprint $table) {
            $table->id();

            $table->foreignId('game_room_id')
                ->constrained('game_rooms')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('lives_remaining');

            $table->unsignedTinyInteger('turn_order')
                ->nullable();

            $table->unsignedInteger('correct_words')
                ->default(0);

            $table->enum('status', [
                'waiting',
                'active',
                'eliminated',
                'left',
            ])->default('waiting');

            $table->timestamp('joined_at')
                ->useCurrent();

            $table->timestamps();

            $table->unique([
                'game_room_id',
                'user_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_players');
    }
};