<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'game_rooms',
            function (Blueprint $table) {
                $table
                    ->foreignId(
                        'current_room_player_id'
                    )
                    ->nullable()
                    ->constrained('room_players')
                    ->nullOnDelete();

                $table
                    ->string(
                        'current_fragment',
                        4
                    )
                    ->nullable();

                $table
                    ->unsignedTinyInteger(
                        'turn_duration_seconds'
                    )
                    ->nullable();

                $table
                    ->timestamp('turn_started_at')
                    ->nullable();

                $table
                    ->timestamp('turn_ends_at')
                    ->nullable();

                $table
                    ->unsignedInteger('round_number')
                    ->default(0);

                $table
                    ->json('used_words')
                    ->nullable();

                $table
                    ->string('last_valid_word', 80)
                    ->nullable();

                $table
                    ->foreignId('winner_user_id')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table
                    ->timestamp('started_at')
                    ->nullable();

                $table
                    ->timestamp('finished_at')
                    ->nullable();
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'game_rooms',
            function (Blueprint $table) {
                $table->dropForeign([
                    'current_room_player_id',
                ]);

                $table->dropForeign([
                    'winner_user_id',
                ]);

                $table->dropColumn([
                    'current_room_player_id',
                    'current_fragment',
                    'turn_duration_seconds',
                    'turn_started_at',
                    'turn_ends_at',
                    'round_number',
                    'used_words',
                    'last_valid_word',
                    'winner_user_id',
                    'started_at',
                    'finished_at',
                ]);
            }
        );
    }
};