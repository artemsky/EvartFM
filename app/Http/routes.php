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


    Route::group(['prefix' => '/dashboard/news/{sort?}/{order?}', 'middleware' => ['auth', 'role:super,writer']], function () {
        Route::get('/', [
            'as' => 'allnews',
            'uses' => 'NewsController@getAllNews',
        ])->where(['sort' => 'asc|desc', 'order' => 'id|created_at|updated_at|title_long|title_short']);

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
        'uses' => 'UserController@postSignIn'
    ]);


});