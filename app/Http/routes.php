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
    Route::get('/dashboard', function () {
        return view('dashboard.index');
    });

    Route::post('/login', [
        'as' => 'login',
        'uses' => 'UserController@postSignIn'
    ]);

    Route::post('/register', [
        'as' => 'register',
        'uses' => 'UserController@postRegister'
    ]);
});