<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TrackList extends Model
{
    protected $table = 'track_lists';
    public $timestamps = false;

    public function playlist(){
        return $this->belongsTo('App\Playlist');
    }
}
