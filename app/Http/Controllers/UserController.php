<?php
namespace App\Http\Controllers;


use App\User;
use Illuminate\Http\Request;

class UserController extends Controller{
    public function postSignIn(Request $request){
        if(Auth::attempt([
            'login' => $request['login'],
            'password' => $request['password']
        ])){
            return redirect()->route('/');
        }
    }
    public function postRegister(Request $request){
        $login = $request['login'];
        $password = bcrypt($request['password']);
        
        $user = new User();
        $user->login = $login;
        $user->password = $password;
        $user->role = 'super';
        
        $user->save();

        return redirect()->back();
        

    }
}