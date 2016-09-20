<?php

namespace App\Services;

use App\Playlist;
use Carbon\Carbon;
use App\Event;
use Illuminate\Support\Facades\Storage;

class PlaylistService{

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
        Storage::put(config('radio.music.relative') . '/check.txt', Carbon::now()->toDateTimeString());
        $id = $this->getPlaylistByNow();
        $playlist = Playlist::find($id);
        if(!$playlist) return false;
        $list = $playlist->tracklist->map(function ($item, $key) {
            return config('radio.music.full') . '/' . $item['track'];
        });
        Storage::put(config('radio.playlist.relative'), implode("\n", $list->toArray()));
        return true;
    }
}