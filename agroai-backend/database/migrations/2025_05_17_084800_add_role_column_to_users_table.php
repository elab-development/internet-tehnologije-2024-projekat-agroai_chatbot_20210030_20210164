<?php
// database/migrations/2025_05_17_000001_modify_role_on_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::table('users', function (Blueprint $table) {
            // now add it back with the new allowed values
            $table->enum('role', ['regular', 'administrator'])
                  ->default('regular')
                  ->after('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // drop the modified enum
            $table->dropColumn('role');
        });
    }
};
