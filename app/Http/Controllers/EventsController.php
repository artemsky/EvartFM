<?php

namespace App\Http\Controllers;

use App\Event;
use App\Http\Controllers\Traits\Validate;
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
        ])->get();
        foreach ($events as $event){
            $event->repeat;
        }
        return response()->json($events, 200);
    }

    public function getEvent($date){
        $events = Event::whereDate('date', '=', $date)->get();
        foreach ($events as $event){
            $event->repeat;
        }
        return response()->json($events, 200);
    }

}
