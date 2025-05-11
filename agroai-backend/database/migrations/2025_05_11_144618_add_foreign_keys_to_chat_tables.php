<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->foreign('user_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreign('chat_id')
                  ->references('id')->on('chats')
                  ->onDelete('cascade');
        });

        Schema::table('responses', function (Blueprint $table) {
            $table->foreign('message_id')
                  ->references('id')->on('messages')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('responses', function (Blueprint $table) {
            $table->dropForeign(['message_id']);
        });
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['chat_id']);
        });
        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
