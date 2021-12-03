<?php

namespace Database\Seeders;

use App\Models\Routes;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $user = [
            'name' => 'demo',
            'email' => 'demo@demo.ru',
            'password' => Hash::make('password'),
        ];
        if(!User::where('email', $user['email'])->exists()){
            DB::table('users')->insert($user);
        }


        $this->call([
            RoutesSeeder::class
        ]);


    }
}
