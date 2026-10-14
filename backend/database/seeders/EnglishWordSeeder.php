<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use SplFileObject;

class EnglishWordSeeder extends Seeder
{
    public function run(): void
    {
        $dictionaryPath = storage_path(
            'app/dictionaries/english_words.txt'
        );

        if (!is_file($dictionaryPath)) {
            throw new RuntimeException(
                'No se encontró el diccionario: '
                . $dictionaryPath
            );
        }

        $dictionary = new SplFileObject(
            $dictionaryPath,
            'r'
        );

        $batch = [];
        $insertedWords = 0;

        foreach ($dictionary as $line) {
            $word = strtolower(
                trim((string) $line)
            );

            if (
                $word === '' ||
                strlen($word) > 100 ||
                !preg_match('/^[a-z]+$/', $word)
            ) {
                continue;
            }

            $batch[] = [
                'word' => $word,
            ];

            if (count($batch) >= 1000) {
                $insertedWords += DB::table(
                    'english_words'
                )->insertOrIgnore($batch);

                $batch = [];
            }
        }

        if ($batch !== []) {
            $insertedWords += DB::table(
                'english_words'
            )->insertOrIgnore($batch);
        }

        $this->command?->info(
            "{$insertedWords} palabras nuevas importadas."
        );
    }
}