<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsRepeatersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events_repeat', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('event_id');
            $table->boolean('everyDay')->default(false);
            $table->boolean('everyWeek')->default(false);
            $table->boolean('sun')->default(false);
            $table->boolean('mon')->default(false);
            $table->boolean('tue')->default(false);
            $table->boolean('wed')->default(false);
            $table->boolean('thu')->default(false);
            $table->boolean('fri')->default(false);
            $table->boolean('sat')->default(false);
        });

        Schema::table('events_repeat', function(Blueprint $table){
            $table->foreign('event_id')
                ->references('id')->on('events')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('events_repeat');
    }
}
