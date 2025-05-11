<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // each user cannot have two chats with the same title
        Schema::table('chats', function (Blueprint $table) {
            $table->unique(['user_id', 'title']);
        });

        // each message has exactly one response
        Schema::table('responses', function (Blueprint $table) {
            $table->unique('message_id');
        });
    }

    public function down(): void
    {
        Schema::table('responses', function (Blueprint $table) {
            $table->dropUnique(['message_id']);
        });
        Schema::table('chats', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'title']);
        });
    }
};
