<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
class Playlist
{
    protected $list;
    protected $current;

    public function get(){
        $file = Storage::get("broadcast/playlist.json");
        $this->list = json_decode($file);
        return $this;
    }

    public function getJSON(){
        return json_encode($this->playlist);
    }

    public function toList(){
        return implode('\n', $this->playlist);
    }

    public function select($playlistName){
        foreach ($this->list as $playlist){
            if(str_contains($playlist->name, $playlistName)){
                $this->current = $playlist->files;
                return $this;
            }
        }
        $this->current = null;
    }
}