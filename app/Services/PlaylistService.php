<?php

namespace App\Services;

use App\Playlist;
use Carbon\Carbon;
use App\Event;
use Illuminate\Support\Facades\Storage;

class PlaylistService{
    function __construct(){
       $this->playlistPath = storage_path() . "broadcast/playlist.txt";
    }

    private $playlistPath;

    public function getPlaylistByNow(){
        $events = Event::all();
        $now = Carbon::now();
        $filtered = $events->filter(function($value) use ($now){
            $value->repeat;
            if($value->playlist > 0){
                if($value->repeat->everyWeek > 0){
                    if(array_values(collect($value->repeat)->slice(4)->toArray())[$now->dayOfWeek] > 0)
                        return true;
                    return false;
                }
                if($value->repeat->everyDay > 0){
                    return true;
                }
                if(Carbon::parse($value->date)->isToday()){
                    return true;
                }
            }
            return false;
        })->sortBy('date');

        $dates = [];
        foreach ($filtered as $event){
            $date = Carbon::parse($event->date);
            $dates[$event->id] = [
                'event' => ['h' => $date->hour, 'm' => $date->minute],
                'now' => ['h' => $now->hour, 'm' => $now->minute],
                'true' => $date->hour == $now->hour && $date->minute == $now->minute
            ];

            if($date->hour == $now->hour && $date->minute == $now->minute) {
                return $event->playlist;
            }
        }
        return -1;
    }

    public function generatePlaylistForNow(){
        $id = $this->getPlaylistByNow();
        $playlist = Playlist::find($id);
        if(!$playlist) return false;
        $filelist = $playlist->tracklist->only('track');
        Storage::put("app/22/1.txt", json_encode($filelist));
        return true;
    }
}
//class Playlist
//{
//    protected $list;
//    protected $current;
//    private $filepath = "broadcast/playlist.json";
//
//    public function get(){
//        $file = Storage::get($this->filepath);
//        $this->list = json_decode($file);
//        return $this->list;
//    }
//
//    public function set($newPlatlist){
//        return Storage::put(
//            $this->filepath,
//            json_encode($newPlatlist, true)
//        );
//    }
//
//    public function json(){
//        return json_encode($this->list);
//    }
//
//    public function toList(){
//        return implode('\n', $this->list);
//    }
//
//    public function select($playlistName){
//        foreach ($this->list as $playlist){
//            if(str_contains($playlist->name, $playlistName)){
//                $this->current = $playlist->files;
//                return $this;
//            }
//        }
//        $this->current = null;
//    }
//}