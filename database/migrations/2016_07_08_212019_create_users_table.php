<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\User;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('login');
            $table->string('password');
            $table->enum('role', ['super', 'admin', 'writer', 'dj']);
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
            $table->rememberToken();
        });

        $user = new User();
        $user->login = 'admin';
        $user->password = bcrypt('evartadmin');
        $user->role = 'super';
        $user->save();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
    }
}
