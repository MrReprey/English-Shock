<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_rooms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('host_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('code', 6)
                ->unique();

            $table->string('name', 50);

            $table->enum('status', [
                'waiting',
                'playing',
                'finished',
            ])->default('waiting');

            $table->unsignedTinyInteger('max_players')
                ->default(6);

            $table->unsignedTinyInteger('initial_lives')
                ->default(3);

            $table->boolean('is_private')
                ->default(true);

            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_rooms');
    }
};