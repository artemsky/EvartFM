<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;

class UserController extends Controller{
    public function postSignIn(Request $request){
        if(Auth::attempt([
            'login' => $request['login'],
            'password' => $request['password']
        ])){
            return response()->json([
                'redirect' => route('home')
            ], 200);
        }

        return response()->json([
            'msg' => Lang::get('auth.failed')
        ], 422);
    }
    public function postRegister(Request $request){
        $login = $request['login'];
        $password = bcrypt($request['password']);
        
        $user = new User();
        $user->login = $login;
        $user->password = $password;
        $user->role = 'super';
        
        $user->save();

        Auth::login($user);
        return redirect()->route('home');
    }
    
    public function getDashboard(){
        return view('dashboard.pages.home');
    }
}