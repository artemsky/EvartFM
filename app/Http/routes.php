<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
use App\Http\Controllers\ContentController;
use App\Http\Controllers\NewsController;

Route::group(['middleware' => ['web', 'locale']], function () {


    Route::group(['prefix' => '/'], function () {
        Route::get('/', function(ContentController $content){
//            return response()->json([
//                'Slider' => $content->getComponent('Slider'),
//                'Events' => $content->getComponent('Events')
//            ]);
            return view('public.index')->with([
                'Slider' => $content->getComponent('Slider'),
                'Events' => $content->getComponent('Events'),
                'Blockquote' => $content->getComponent('Blockquote'),
                'Video' => $content->getComponent('Video')
            ]);
        })->name("base");

        Route::get('/news', function(NewsController $content){

            return view('public.news')->with([
                'News' => $content->getAllNews('desc', 'id', true)
            ]);
        })->name("news");
    });


    Route::get('/login', [
        'as' => 'login',
        'uses' => 'UserController@getLoginPage',
        'middleware' => 'guest'
    ]);

    Route::get('/logout', [
        'as' => 'logout',
        'uses' => 'UserController@getLogout'
    ]);

    Route::post('/login', [
        'as' => 'signIn',
        'uses' => 'UserController@postSignIn',
        'middleware' => 'throttle:3,1'
    ]);


    Route::group(['prefix' => 'dashboard', 'middleware' => 'auth'], function () {
        Route::get('/', [
            'as' => 'home',
            'uses' => 'UserController@getDashboardPage'
        ]);

        Route::get('/lang/{locale}', function ($locale) {
            if (in_array($locale, \Config::get('app.locales'))) {   # Проверяем, что у пользователя выбран доступный язык
                Session::put('locale', $locale);                    # И устанавливаем его в сессии под именем locale
            }
            return redirect()->back();                              # Редиректим его <s>взад</s> на ту же страницу

        });

        Route::group(['prefix' => 'user', 'middleware' => ['auth', 'role:super']], function () {

            Route::get('/', [
                'as' => 'user',
                'uses' => 'UserController@getAllUsers',
            ]);

            Route::post('/edit', [
                'as' => 'useredit',
                'uses' => 'UserController@postEditUser',
            ]);

            Route::post('/update', [
                'as' => 'userupdate',
                'uses' => 'UserController@postUpdateUser',
            ]);

            Route::post('/delete', [
                'as' => 'userdelete',
                'uses' => 'UserController@postDeleteUser',
            ]);

            Route::get('/add', [
                'as' => 'adduser',
                'uses' => 'UserController@getAddUsers'
            ]);

            Route::post('/register', [
                'as' => 'register',
                'uses' => 'UserController@postRegister'
            ]);
        });

        Route::group(['prefix' => 'news', 'middleware' => ['auth', 'role:super,writer,admin']], function () {
            Route::get('/{sort?}/{order?}', [
                'as' => 'allnews',
                'uses' => 'NewsController@getAllNews',
            ])->where(['sort' => 'asc|desc', 'order' => 'id|created_at|updated_at|title_long|title_short']);

            Route::post('/update', [
                'as' => 'newsUpdate',
                'uses' => 'NewsController@postUpdateNews'
            ]);

            Route::post('/add', [
                'as' => 'newsAdd',
                'uses' => 'NewsController@postAddNews'
            ]);

            Route::delete('/delete', [
                'as' => 'newsDelete',
                'uses' => 'NewsController@deleteNews'
            ]);


//        Route::get('/rename', [
//            'uses' => 'NewsController@rename'
//        ]);

        });

        Route::group(['prefix' => 'schedule', 'middleware' => ['auth', 'role:super,admin,dj']], function () {

            Route::get('/', [
                'as' => 'schedule.index',
                'uses' => 'EventsController@getIndex',
            ]);
            Route::group(['prefix' => '/events'], function () {
                Route::get('/', [
                    'as' => 'schedule.events.all',
                    'uses' => 'EventsController@getEvents',
                ]);
                Route::post('/update', [
                    'as' => 'schedule.events.update',
                    'uses' => 'EventsController@postUpdate',
                ]);
                Route::get('/delete/{id}', [
                    'as' => 'schedule.events.delete',
                    'uses' => 'EventsController@getDelete',
                ])->where(['id' => '[0-9]+']);

                Route::get('/{date}', [
                    'as' => 'schedule.events.date',
                    'uses' => 'EventsController@getEvent',
                ])->where(['date' => '\d{4}-\d{2}-\d{2}']);
            });

        });

        Route::group(['prefix' => 'broadcast', 'middleware' => ['auth', 'role:super,admin,dj']], function () {

            Route::get('/', [
                'as' => 'radio.index',
                'uses' => 'RadioController@getIndex'
            ]);

            Route::post('/switch', [
                'uses' => 'RadioController@postAction'
            ]);

            Route::get('/upload', [
                'as' => 'radio.upload',
                'uses' => 'RadioController@getUpload'
            ]);

            Route::post('/upload', [
                'as' => 'radio.upload.file',
                'uses' => 'RadioController@postUpload'
            ]);

            Route::get('/delete', [
                'as' => 'radio.delete',
                'uses' => 'RadioController@getDelete'
            ]);

            Route::post('/delete', [
                'as' => 'radio.delete.files',
                'uses' => 'RadioController@postDelete'
            ]);

            Route::get('/playlist', [
                'as' => 'radio.playlist.get',
                'uses' => 'RadioController@getPlaylist'
            ]);
            Route::post('/playlist', [
                'as' => 'radio.playlist.save',
                'uses' => 'RadioController@postPlaylist'
            ]);

            Route::delete('/playlist', [
                'as' => 'radio.playlist.delete',
                'uses' => 'RadioController@deletePlaylist'
            ]);

            Route::get('/server/status', [
                'as' => 'radio.server.status',
                'uses' => 'RadioController@serverStatus'
            ]);

        });

    });

    Route::group(['prefix' => '/dashboard/content', 'middleware' => ['auth', 'role:super,admin,writer']], function () {
        Route::get('/', [
            'as' => 'content.index',
            'uses' => 'ContentController@getIndex',
        ]);
        Route::get('/component/get/all', [
            'uses' => 'ContentController@getComponentsData',
        ]);

        Route::post('/component/update/all', [
            'uses' => 'ContentController@postUpdateComponentsData',
        ]);

    });



});