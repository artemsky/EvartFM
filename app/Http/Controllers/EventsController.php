<?php

namespace App\Http\Controllers;

use App\Event;
use App\EventsRepeater;
use App\Http\Controllers\Traits\Validate;
use App\Playlist;
use Illuminate\Http\Request;
use Carbon\Carbon;


class EventsController extends Controller
{
    use Traits\Validate;

    public function getIndex(){
        return view('dashboard.pages.schedule.index');
    }

    public function getEvents(){
        $events = Event::whereBetween('date', [
            Carbon::now()->addMonth(-1)->toDateString(),
            Carbon::now()->addMonth(1)->toDateString()
        ])->orderBy('date', 'desc')->get();
        foreach ($events as $event){
            $event->repeat;
        }

        $playlists = Playlist::all();
        return response()->json([
            "events" => $events,
            "playlists" => $playlists
        ], 200);
    }

    public function postUpdate(Request $request){

        $events = $request['events'];

        foreach ($events as $event) {
            $id = $event['id'];
            $e = Event::find($id);
            if(!$e) {
                $this->createNewItem($event);
                continue;
            }
            $e->playlist = intval($event['playlist']) > 0 ? $event['playlist'] : null;
            $e->date = $event['date'];
            $e->title = $event['title'];
            $e->description = $event['description'];
            unset($event['repeat']['event_id']);
            foreach ($event['repeat'] as $key=>$repeat) {
                $e->repeat->$key = $repeat;
            }
            $e->repeat->save();
            $e->save();

        }

        return response()->json($events);
    }

    private function createNewItem($event){
        $e = new Event();
        $e->date = $event['date'];
        $e->title = $event['title'];
        $e->description = $event['description'];
        $e->playlist = intval($event['playlist']) > 0 ? $event['playlist'] : 0;
        $e->save();
        $e->repeat = new EventsRepeater();
        $event['repeat']['event_id'] = $e->id;
        foreach ($event['repeat'] as $key=>$repeat) {
            $e->repeat->$key = $repeat;
        }
        $e->repeat->save();
    }

    public function getDelete($id){
        $isDeleted = Event::destroy($id);
        return response($isDeleted);
    }

    public function getEvent($date){
        $events = Event::whereDate('date', '=', $date)->get();
        foreach ($events as $event){
            $event->repeat;
        }
        return response()->json($events, 200);
    }

}
