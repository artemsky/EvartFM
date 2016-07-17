<?php

namespace App\Http\Controllers;

use App\News;
use Illuminate\Http\Request;
use Validator;
use DB;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function getAllNews($sort = 'desc', $order = 'id'){
        $news = DB::table('news')
            ->orderBy($order, $sort)
            ->paginate(10);
        return view('dashboard.pages.news.all', ['news' => $news]);
    }

    public function postUpdateNews(Request $request){
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:news,id',
            'title_short' => 'max:100',
            'title_long' => 'required|max:300',
            'article' => 'required|max:2500',
            'created_at' => 'date',
            'image_url' => 'image'
        ]);

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);


        $newsItem = News::find($request['id']);
        $newsItem->title_short = $request['title_short'];
        $newsItem->title_long = $request['title_long'];
        $newsItem->article = $request['article'];

        if(strlen ($request['created_at']) > 2){
            $newsItem->created_at = $request['created_at'];
        }

        if(array_key_exists('image_url', $request->all())){
            $filepath = 'news/'.$request['id']. '.' .$request->file('image_url')->getClientOriginalExtension();
            Storage::put(
                $filepath,
                file_get_contents($request->file('image_url')->getRealPath())
            );
            $newsItem->image_url = $filepath;
        }
        $newsItem->save();

        return response()->json([], 200);
    }

    public function postAddNews(Request $request){
        $validator = Validator::make($request->all(), [
            'title_short' => 'max:100',
            'title_long' => 'required|max:300',
            'article' => 'required|max:2500',
            'created_at' => 'date',
            'image_url' => 'required|image'
        ]);

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);


        $newsItem = new News();
        $newsItem->title_short = $request['title_short'];
        $newsItem->title_long = $request['title_long'];
        $newsItem->article = $request['article'];
        $newsItem->created_at = $request['created_at'];
        $newsItem->save();

        $id = $newsItem->id;
        $newsItem = News::find($id);

        $filepath = 'news/'.$id. '.' .$request->file('image_url')->getClientOriginalExtension();
        Storage::put(
            $filepath,
            file_get_contents($request->file('image_url')->getRealPath())
        );

        $newsItem->image_url = $filepath;

        $newsItem->save();

        return response()->json($newsItem, 200);
    }

//    public function rename(){
//        $items = DB::table('news')->get();
//        foreach ($items as $item){
//            $oldFilename = $item->image_url;
//            $arr = explode ('.', $oldFilename);
//            $extension = $arr[count($arr)-1];
//            $newFilename = $item->id .'.'. $extension;
//            Storage::copy($oldFilename, 'newnews/'. $newFilename);
//
//            DB::table('news')
//                ->where('id', $item->id)
//                ->update([
//                    'image_url' => 'news/'. $newFilename
//                ]);
//        }
//
//        return response()->json([ 'lenght' => $newFilename]);
//
//    }
}
