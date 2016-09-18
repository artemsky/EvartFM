<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
class Playlist
{
    protected $list;
    protected $current;
    private $filepath = "broadcast/playlist.json";

    public function get(){
        $file = Storage::get($this->filepath);
        $this->list = json_decode($file);
        return $this->list;
    }

    public function set($newPlatlist){
        return Storage::put(
            $this->filepath,
            json_encode($newPlatlist, true)
        );
    }

    public function json(){
        return json_encode($this->list);
    }

    public function toList(){
        return implode('\n', $this->list);
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