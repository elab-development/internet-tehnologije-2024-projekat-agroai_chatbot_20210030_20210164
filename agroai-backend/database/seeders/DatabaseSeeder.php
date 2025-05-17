<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // order matters because of foreign keys
        $this->call([
            UserSeeder::class,
            ChatSeeder::class,
            MessageSeeder::class,
            ResponseSeeder::class,
        ]);
    }
}
