<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Message;
use App\Models\Chat;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        // for each chat, create 3–6 user messages
        Chat::all()->each(function (Chat $chat) {
            Message::factory()
                ->count(rand(3, 6))
                ->for($chat)      // sets message.chat_id
                ->create();
        });
    }
}
