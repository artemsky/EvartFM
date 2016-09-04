<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Components\Slider;
use App\Components\Blockquote;
use App\Components\Events;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests;
const DATA_ONLY = true;
class ContentController extends Controller
{
    public function getIndex(){
        $methods = get_class_methods(get_class());
        $methods = array_where($methods, function ($key, $value) {
            return starts_with($value, 'getComponent') && !str_is('getComponent', $value);
        });
        $data = [];
        foreach($methods as $method){
            $data[substr($method, 12)] = $this->$method(DATA_ONLY);
        }
        return view('dashboard.pages.content.index')->with($data);
    }

    //Components
    public function getComponent($component){
        $componentName = 'getComponent' . $component;
        return $this->$componentName();
    }
    public function postComponent($component, Request $request){
        $componentName = 'postComponent' . $component;
        return $this->$componentName($request);
    }

    public function postDeleteComponent($component, Request $request){
        $componentName = 'App\\Components\\' . $component;
        $image = [];
        foreach ($request['id'] as $id) {
            $image[] = substr($componentName::find($id)->image, 4);
        }
        if($componentName::destroy($request['id']))
                Storage::delete($image);

        return response()->json($image);
    }

    private function getComponentSlider($dataOnly = false){
        $data = Slider::all()->sortBy('order');
        if($dataOnly)
            return $data ?? null;
        return view('public.components.Slider')->with(['slides' => $data]);
    }
    private function postComponentSlider(Request $request){
        if(!$request->all()) return response()->json(['msg' => 'nothing to add'], 200);
        foreach ($request['data'] as $item) {
            $slide = $slide = Slider::find($item["id"]) ?? new Slider();
            $slide->order = $item["order"];
            $slide->title = $item["title"];
            $slide->description = $item["description"];
            if(asset($slide->image) != $item["image"]){
                $pos  = strpos($item["image"], ';');
                $type = explode(':', substr($item["image"], 0, $pos))[1];
                $extensions = array(
                    'image/jpeg' => 'jpg',
                    'image/png' => 'png'
                );

                $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $item["image"]));
                if(!$slide->id) $slide->save();
                $filepath = 'public/Slider/'. $slide->id. '.' . $extensions[$type];
                Storage::put($filepath, $data);

                $slide->image = 'app/' . $filepath;
            }
            $slide->save();
        }
        return response()->json(['msg' => 'success'], 200);
    }

    private function getComponentBlockquote($dataOnly = false){
        $data = Blockquote::all()->sortBy('order');
        if($dataOnly)
            return $data ?? null;
        return view('public.components.Blockquote')->with(['Blockquote' => $data]);
    }

    private function postComponentBlockquote(Request $request){
        if(!$request->all()) return response()->json(['msg' => 'nothing to add'], 200);
        foreach ($request['data'] as $item) {
            $slide = $slide = Blockquote::find($item["id"]) ?? new Blockquote();
            $slide->order = $item["order"];
            $slide->name = $item["name"];
            $slide->text = $item["text"];
            $slide->description = $item["description"];
            $slide->stars = $item["stars"];
            if(asset($slide->image) != $item["image"]){
                $pos  = strpos($item["image"], ';');
                $type = explode(':', substr($item["image"], 0, $pos))[1];
                $extensions = array(
                    'image/jpeg' => 'jpg',
                    'image/png' => 'png'
                );

                $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $item["image"]));
                if(!$slide->id) $slide->save();
                $filepath = 'public/Blockquote/'. $slide->id. '.' . $extensions[$type];
                Storage::put($filepath, $data);

                $slide->image = 'app/' . $filepath;
            }
            $slide->save();
        }
        return response()->json(['msg' => 'success'], 200);
    }

    private function getComponentEvents($dataOnly = false){
        $data = Events::all()->sortBy('order');
        if($dataOnly)
            return $data ?? null;
        return view('public.components.Slider')->with(['slides' => $data]);
    }
    private function postComponentEvents(Request $request){
        if(!$request->all()) return response()->json(['msg' => 'nothing to add'], 200);
        foreach ($request['data'] as $item) {
            $slide = $slide = Slider::find($item["id"]) ?? new Events();
            $slide->order = $item["order"];
            $slide->title = $item["title"];
            $slide->description = $item["description"];
            $slide->date = $item["date"];
            if(asset($slide->image) != $item["image"]){
                $pos  = strpos($item["image"], ';');
                $type = explode(':', substr($item["image"], 0, $pos))[1];
                $extensions = array(
                    'image/jpeg' => 'jpg',
                    'image/png' => 'png'
                );

                $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $item["image"]));
                if(!$slide->id) $slide->save();
                $filepath = 'public/Events/'. $slide->id. '.' . $extensions[$type];
                Storage::put($filepath, $data);

                $slide->image = 'app/' . $filepath;
            }
            $slide->save();
        }
        return response()->json(['msg' => 'success'], 200);
    }
}
