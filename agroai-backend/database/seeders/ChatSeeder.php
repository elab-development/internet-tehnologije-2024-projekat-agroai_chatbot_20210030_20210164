<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Chat;
use App\Models\User;

class ChatSeeder extends Seeder
{
    public function run(): void
    {
        // for each existing user, spin up 1–3 chats
        User::all()->each(function (User $user) {
            Chat::factory()
                ->count(rand(1, 3))
                ->for($user)       // sets chat.user_id
                ->create();
        });
    }
}
