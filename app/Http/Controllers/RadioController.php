<?php

namespace App\Http\Controllers;

use App\TrackList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Playlist;
use App\Services\MP3FileService;
use App\Services\RadioService;

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
        $filepath = config('radio.music.relative') . '/' .
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
            'Files' => Storage::files(config('radio.music.relative'))
        ]);
    }

    public function postDelete(Request $request){
        $files = array_map(function($value){
            return  config('radio.music.relative') . '/' . $value;
        }, $request->delete);

        if(Storage::delete($files)){
            return response()->json('Successfully deleted');
        }
        return response()->json('Error occurred', 406);
    }

    public function postAction(Request $request){
        $this->isValid($request, [
            'action' => 'required|in:on,off,refresh,next'
        ]);
        $rs = new RadioService();
        switch($request['action']){
            case 'on':
                $rs->turnOn();
                return response()->json($rs->getStatus());
            case 'off':
                $rs->turnOff();
                return response()->json($rs->getStatus());
            case 'refresh':
                $rs->refresh();
                return response()->json($rs->getStatus());
            case 'next':
                $rs->nextTrack();
                return response()->json($rs->getStatus());
        }
    }

    public function getPlaylist(){
        $playlists = Playlist::all();
        foreach ($playlists as $playlist){
            foreach ($playlist->tracklist as $track){
                $mp3file = new MP3FileService(config('radio.music.full') . '/' . $track['track']);
                $track['duration'] = MP3FileService::formatTime($mp3file->getDurationEstimate());
                $track['track'] = config('radio.music.relative') . '/' . $track['track'];
            }
        }

        return view("dashboard.pages.radio.playlist")
            ->with([
                'Playlists' => $playlists->toArray(),
                'Files' => collect(Storage::files(config('radio.music.relative')))->map(function($value){
                    $mp3file = new MP3FileService(storage_path('app') .'/'. $value);
                    return [
                        'file' => $value,
                        'duration' => MP3FileService::formatTime($mp3file->getDurationEstimate())
                    ];
                })
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
