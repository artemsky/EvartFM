<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Components\Slider;

use App\Http\Requests;
const DATA_ONLY = true;
class ContentController extends Controller
{
    public function getIndex(){
        $methods = get_class_methods(get_class());
        $methods = array_where($methods, function ($key, $value) {
            return starts_with($value, 'component');
        });
        $data = [];
        foreach($methods as $method){
            $data[substr($method, 9)] = $this->$method(DATA_ONLY);
        }
        return view('dashboard.pages.content.index')->with($data);
    }

    //Components
    public function getComponent($component){
        $componentName = 'component' . $component;
        return $this->$componentName();
    }
    private function componentSlider($dataOnly = false){
        $data = Slider::all()->sortBy('order');
        if($dataOnly)
            return $data;
        return view('public.components.Slider')->with(['slides' => $data]);
    }
}
