<?php

namespace App\Http\Controllers;

use App\Event;
use App\Http\Controllers\Traits\Validate;

class EventsController extends Controller
{
    use Traits\Validate;

    public function getIndex(){
        return view('dashboard.pages.schedule.index');
    }

    public function getEvents(){
        $events = Event::all();
        foreach ($events as $event){
            $event->repeat;
        }
        return response()->json($events);
    }

}
