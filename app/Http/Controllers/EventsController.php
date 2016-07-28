<?php

namespace App\Http\Controllers;

use App\Event;
use App\Http\Controllers\Traits\Validate;
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
        return response()->json($events, 200);
    }

    public function postUpdate(Request $request){

        $this->isValid($request, [
            'data' => 'json'
        ]);

        $events = $request['events'];

        foreach ($events as $event) {
            $e = Event::find($event['id']);
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

    public function getEvent($date){
        $events = Event::whereDate('date', '=', $date)->get();
        foreach ($events as $event){
            $event->repeat;
        }
        return response()->json($events, 200);
    }

}
