<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Response;
use App\Models\Message;

class ResponseSeeder extends Seeder
{
    public function run(): void
    {
        // for each user message, generate exactly one bot response
        Message::all()->each(function ($message) {
            Response::factory()
                ->for($message)   // sets response.message_id
                ->create();
        });
    }
}
