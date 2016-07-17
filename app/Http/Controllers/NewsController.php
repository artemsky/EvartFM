<?php

namespace App\Http\Controllers;

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
}
