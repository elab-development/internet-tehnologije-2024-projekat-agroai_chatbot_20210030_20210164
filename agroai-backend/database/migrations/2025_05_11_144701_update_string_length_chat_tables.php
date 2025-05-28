<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Temporarily disable FKs so the ALTER … CHANGE can run
        Schema::disableForeignKeyConstraints();

        // requires doctrine/dbal for change()
        Schema::table('chats', function (Blueprint $table) {
            $table->text('title', 10000)->nullable()->change();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->text('content', 10000)->change();
        });

        Schema::table('responses', function (Blueprint $table) {
            $table->text('content', 10000)->change();
        });

        // Re-enable FKs
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('responses', function (Blueprint $table) {
            $table->text('content', 500)->change();
        });
        Schema::table('messages', function (Blueprint $table) {
            $table->text('content', 500)->change();
        });
        Schema::table('chats', function (Blueprint $table) {
            $table->text('title', 500)->nullable()->change();
        });

        Schema::enableForeignKeyConstraints();
    }
};
