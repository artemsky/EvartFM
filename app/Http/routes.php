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



    Route::group(['middleware' => 'role:super'], function () {
        Route::get('/dashboard/user/add', function () {
            return view('dashboard.pages.user.add');
        })->name("adduser");
        Route::get('/dashboard/user', [
            'as' => 'user',
            'uses' => 'UserController@getRoleRoutes',
            'middleware' => 'auth'
        ]);
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

    Route::post('/register', [
        'as' => 'register',
        'uses' => 'UserController@postRegister'
    ]);
});