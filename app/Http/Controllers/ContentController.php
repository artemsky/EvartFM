<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Components\Slider;

use App\Http\Requests;

class ContentController extends Controller
{
    public function getIndex(){
        return view('dashboard.pages.content.index');
    }

    //Components
    public function getComponent($component){
        $componentName = 'component' . $component;
        return $this->$componentName();
    }
    private function componentSlider(){
        return view('public.components.Slider')->with([
            'slides' => Slider::all()->sortBy('order')
        ]);
    }
}
