<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    public $timestamps = false;

    public function tracklist(){
        return $this->hasMany('App\TrackList');
    }

    public function event(){
        return $this->hasOne('App\Event');
    }
}
