<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'       => 'Admin User',
            'email'      => 'admin@agroai.com',
            'password'   => Hash::make('adminagroai'),
            'image_url'  => 'https://media.istockphoto.com/id/1265176370/photo/portrait-of-a-confident-young-businessman.jpg?s=612x612&w=0&k=20&c=Hr5Rn3WlBied-o4Qu2LiRc6wP_eHI8UMG9rl1v-_a9s=',
            'role'       => 'administrator',
        ]);
        // create 5 users
        User::factory()->count(5)->create();
    }
}
