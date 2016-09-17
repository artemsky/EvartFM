<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Envoy;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

use App\Http\Requests;

class RadioController extends Controller
{
    use Traits\Validate;
    public function getIndex(){
        return view('dashboard.pages.radio.index');
    }

    public function getUpload(){
        return view('dashboard.pages.radio.upload');
    }

    public function postUpload(Request $request){
        $folder = "music";
        $filepath = $folder . '/' .
            str_slug(
                str_replace(
                    $request->file('file')->getClientOriginalExtension(),
                    '',
                    $request->file('file')->getClientOriginalName()
                )
            )
        . '.' . $request->file('file')->getClientOriginalExtension();

        $result = Storage::put(
            $filepath,
            file_get_contents($request->file('file')->getRealPath())
        );
        return response()->json($result);
    }

    public function postAction(Request $request){
        $this->isValid($request, [
            'action' => 'required|in:on,off,refresh'
        ]);

        $e = new Envoy();
        switch($request['action']){
            case 'on':
                $e->run('icecastStart')->wait(function() use ($e){
                    $e->run('streamStart');

                });
                return response()->json($this->serverStatus());
                break;
            case 'off':
                $e->run('streamStop')->wait(function() use ($e){
                    $e->run('icecastStop');
                });
                return response()->json($this->serverStatus());
                break;
            case 'refresh':
                $e->run('streamRefresh');
                return response()->json($this->serverStatus());
        }
    }

    public function serverStatus(){
        $SERVER = 'localhost:8000';
        $STATS_FILE = '/play.xspf';
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL,$SERVER.$STATS_FILE);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
        $output = curl_exec($ch);
        curl_close($ch);

        return $output ? true : false;
    }

}
