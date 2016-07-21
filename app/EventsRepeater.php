<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EventsRepeater extends Model
{
    protected $table = 'events_repeat';

    public function event(){
        return $this->belongsTo('App\Event');
    }
}
