<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateComponentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('components', function (Blueprint $table) {
            $table->increments('id');
            $table->string('component');
            $table->boolean('active');
        });

        $Components = array_map(
            function($value) {
                return str_replace('.php', '', $value);
            },
            array_flatten(
                array_where(
                    scandir(app_path() . '/Components'),
                    function($key, $value){
                        return ends_with($value, '.php');
                    }
                )
            )
        );

        foreach($Components as $component){
            $c = new App\Components();
            $c->component = $component;
            $c->active = false;
            $c->save();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('components');
    }
}
