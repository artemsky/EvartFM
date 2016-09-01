<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class ContentController extends Controller
{
    public function getIndex(){
        return view('dashboard.pages.content.index');
    }
}
