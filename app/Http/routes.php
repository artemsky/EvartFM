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



Route::group(['middleware' => 'web'], function () {
    Route::get('/dashboard', [
        'as' => 'home',
        'uses' => 'UserController@getDashboardPage',
        'middleware' => 'auth'
    ]);



    Route::group(['prefix' => '/dashboard/user', 'middleware' => ['auth', 'role:super']], function () {

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


    Route::group(['prefix' => '/dashboard/news', 'middleware' => ['auth', 'role:super,writer']], function () {
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


//        Route::get('/rename', [
//            'uses' => 'NewsController@rename'
//        ]);

    });

    Route::group(['prefix' => '/dashboard/schedule', 'middleware' => ['auth', 'role:super,writer']], function () {
        Route::get('/', [
            'as' => 'schedule.index',
            'uses' => 'EventsController@getIndex',
        ]);
        Route::group(['prefix' => '/events'], function () {
            Route::get('/', [
                'as' => 'schedule.events.all',
                'uses' => 'EventsController@getEvents',
            ]);
            Route::get('/{date}', [
                'as' => 'schedule.events.date',
                'uses' => 'EventsController@getEvent',
            ])->where(['date' => '\d{4}-\d{2}-\d{2}']);
        });

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


});