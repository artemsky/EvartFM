<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Validate;
use Illuminate\Http\Request;

use App\Http\Requests;

class EventsController extends Controller
{
    use Traits\Validate;

    public function getIndex(){
        return view('dashboard.pages.schedule.index');
    }
}
