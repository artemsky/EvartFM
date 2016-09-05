<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Components\Slider;
use App\Components\Events;
use App\Components\Video;
use App\Components\Blockquote;
use Illuminate\Support\Facades\Storage;
class ContentController extends Controller
{
    public function getIndex(){
        $data = [];
        foreach($this->allComponentsNames() as $component){
            $data[$component] = $this->getComponent($component, true);
        }
        return view('dashboard.pages.content.index')->with($data);
    }

    //Components
    public function getComponent($component, $dataOnly = false){
        $componentName = 'App\\Components\\' . $component;
        $data = $componentName::all()->sortBy('order');
        if($dataOnly)
            return $data ?? null;
        return view('public.components.' . $component)->with([$component => $data]);
    }
    private function allComponentsNames(){
        $Components = array_map(
            function($value) {
                return str_replace('.php', '', $value);
            },
            array_flatten(
                array_where(
                    scandir(app_path() . '/Components'),
                    function($key, $value){
                        return ends_with($value, '.php');
                    }
                )
            )
        );
        return $Components;
    }
    public function postComponent($component, Request $request){
        if(!$request->all())
            return response()->json([
            'msg' => 'No items to add'
        ], 200);
        $result = [];
        foreach ($request['data'] as $item) {
            $tempInfo = [];
            $request_id = intval(array_pull($item, 'id'));
            $object = 'App\\Components\\' . $component;
            if(!$objectInstance = $object::find($request_id)){
                $tempInfo['request_id'] = $request_id;
                $objectInstance = new $object();
            }

            if(array_has($item, 'image')){
                $image= array_pull($item, 'image');
                if(asset($objectInstance->image) != $image){
                    $imageObject = $this->fromBase64toImage($image);
                    if(!$objectInstance->id) $objectInstance->save();
                    $path = 'public/'. $component . '/' . $objectInstance->id. '.' . $imageObject['extension'];
                    Storage::put($path, $imageObject['file']);

                    $objectInstance->image = 'app/' . $path;
                }
            }
            foreach ($item as $property=>$value) {
                $objectInstance->$property = $value;
            }
            $objectInstance->save();
            if($request_id != $objectInstance->id){
                $tempInfo['response_id'] = $objectInstance->id;
                $result[] = $tempInfo;
            }


        }
        return response()->json([
            'msg' => 'success',
            'treatedObjects' => $result
        ], 200);
    }

    public function postDeleteComponent($component, Request $request){
        $componentName = 'App\\Components\\' . $component;
        $image = [];
        foreach ($request['id'] as $id) {
            $image[] = substr($componentName::find($id)->image, 4);
        }
        if($componentName::destroy($request['id']))
                Storage::delete($image);

        return response()->json([
            'msg' => 'success'
        ], 200);
    }

    private function fromBase64toImage($base64){
        $pos  = strpos($base64, ';');
        $type = explode(':', substr($base64, 0, $pos))[1];
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png'
        ];

        return [
            'file' => base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64)),
            'extension' => $extensions[$type]
        ];
    }

}
