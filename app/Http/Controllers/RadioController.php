<?php

namespace App\Http\Controllers;

use App\TrackList;
use Illuminate\Http\Request;
use App\Services\Envoy;
use Illuminate\Support\Facades\Storage;
use App\Playlist;
use App\Http\Requests;

class RadioController extends Controller
{
    private $musicDir = 'music';
    use Traits\Validate;
    public function getIndex(){
        return view('dashboard.pages.radio.index');
    }

    public function getUpload(){
        return view('dashboard.pages.radio.upload');
    }

    public function postUpload(Request $request){
        $folder = "music";
        $filepath = $this->musicDir . '/' .
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

    public function getDelete(){
        return view('dashboard.pages.radio.delete')->with([
            'Files' => Storage::files($this->musicDir)
        ]);
    }

    public function postDelete(Request $request){
        $files = array_map(function($value){
            return  $this->musicDir . '/' . $value;
        }, $request->delete);

        if(Storage::delete($files)){
            return response()->json('Successfully deleted');
        }
        return response()->json('Error occurred', 406);
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

    public function getPlaylist(){
        $playlists = Playlist::all();
        foreach ($playlists as $playlist)
            $playlist->tracklist;

        return view("dashboard.pages.radio.playlist")
            ->with([
                'Playlists' => $playlists->toArray(),
                'Files' => Storage::files($this->musicDir)
            ]);
    }

    public function postPlaylist(Request $request){
        $proccessedIDs = [];
        $proccessedIDs['playlistIds'] = [];
        $proccessedIDs['trackIds'] = [];
        if($request['forSave']){
            foreach ($request['forSave'] as $list){
                $playlist = Playlist::find($list['id']);
                if(!$playlist) {
                    $playlist = new Playlist();
                    $playlist->name = $list['name'];
                    $playlist->save();
                    $tmpInfo = [];
                    $tmpInfo['old'] = $list['id'];
                    $tmpInfo['new'] = $playlist->id;
                    $proccessedIDs['playlistIds'][] = $tmpInfo;
                }
                $tracklist = $playlist->tracklist->toArray();
                foreach ($list['tracklist'] as $newTrack){
                    $inArray = false;
                    if($tracklist)
                        foreach ($tracklist as $oldTrack){
                            if(in_array($newTrack['id'], $oldTrack)) {
                                $inArray = true;
                            }
                        }
                    if($inArray)
                        continue;
                    $track = new TrackList();
                    $track->track = $newTrack['name'];
                    $playlist->tracklist()->save($track);

                    $tmpInfo = [];
                    $tmpInfo['old'] = $newTrack['id'];
                    $tmpInfo['new'] = $track->id;
                    $proccessedIDs['trackIds'][] = $tmpInfo;
                }
            }
        }


        TrackList::Destroy($request["forDelete"]);

        return response()->json([
            'message' => "Successfully saved",
            'ids' => $proccessedIDs
        ]);
    }

    public function deletePlaylist(Request $request){
        Playlist::destroy($request['id']);
        return response()->json([
            'message' => 'Successfully deleted'
        ]);
    }

}
