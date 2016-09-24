<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
class ContentController extends Controller
{
    public function getIndex(){
        return view('dashboard.pages.content.index');
    }

    public function getComponent($component){
        $componentName = 'App\\Components\\' . $component;
        $data = $componentName::all();

        $schema = new $componentName();

        $data = [
            'data' => array_values(array_sort($data->toArray(), function ($value) {
                return $value['order'];
            })),
            'schema' => $schema->getTableColumns()
        ];

        return $data;
    }
    public function getComponentsData(){
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
        $data = [];
        foreach($Components as $component){
            $data[$component] = $this->getComponent($component);
        }
        return response()->json($data);
    }

    public function postUpdateComponentsData(Request $request){
        $result = [];
        if($request->forSave){
            foreach ($request->forSave as $componentName => $data) {
                if(!array_has($data, 'componentData'))
                    continue;
                $result[$componentName] = $this->postComponent($componentName, $data['componentData']);
            }
        }
        if($request->forDelete){
            foreach ($request->forDelete as $componentName => $data) {
                $this->postDeleteComponent($componentName, $data);
            }
        }
        return response()->json($result);

    }

    private function postComponent($component, $data){
        if(!count($data))
            return false;
        $result = [];
        foreach ($data as $item) {
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

                    $objectInstance->image = asset('app/' . $path);
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
        return $result;
    }

    private function postDeleteComponent($component, $data){
        $componentName = 'App\\Components\\' . $component;
        $image = [];
        foreach ($data as $id) {
            $image[] = substr($componentName::find($id)->image, 4);
        }
        if($componentName::destroy($data))
            Storage::delete($image);

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
