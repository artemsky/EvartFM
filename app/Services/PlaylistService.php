<?php

namespace App\Services;

use App\Playlist;
use Carbon\Carbon;
use App\Event;
use Illuminate\Support\Facades\Storage;

class PlaylistService{

    private function getPlaylistsForToday(){
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

        return $filtered;
    }

    public function getPlaylistsByToday(){
        $filtered = $this->getPlaylistsForToday();
        $now = Carbon::now();

        $sorted = $filtered->map(function ($item) use ($now){
            $date = Carbon::parse($item->date);
            $date->day = $now->day;
            $item->date = $date->format('Y-m-d H:i:s');
            return $item;
        })->sortBy('date');


        $dates = ['all' => [], 'current' => 0];
        foreach (array_values($sorted->toArray()) as $key=>$event){
            $date = Carbon::parse($event['date']);
            $tmp = [];
            $tmp['title'] = $event['title'];
            $tmp['description'] = $event['description'];
            $tmp['time'] = $date->format("H:i");
            $tmp['status'] = 0;

            if($date->gte($now)) {
                $tmp['status'] = 1;
            }
            else if($date->lte($now)){
                $tmp['status'] = -1;
                $dates['current'] = $key;
            }

            $dates['all'][] = $tmp;
        }
        return $dates;
    }

    public function getPlaylistByNow(){
        $filtered = $this->getPlaylistsForToday();

        $now = Carbon::now();

        foreach ($filtered as $event){
            $date = Carbon::parse($event->date);
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
        $list = $playlist->tracklist->map(function ($item, $key) {
            return config('radio.music.full') . '/' . $item['track'];
        });
        Storage::put(config('radio.playlist.relative'), implode("\n", $list->toArray()));
        return true;
    }
}