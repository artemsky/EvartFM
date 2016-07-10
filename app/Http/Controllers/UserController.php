<?php
namespace App\Http\Controllers;

use Validator;
use Illuminate\Support\Facades\Auth;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;

class UserController extends Controller{
    public function postSignIn(Request $request){

        $validator = Validator::make($request->all(), [
            'login' => 'required|min:4|max:16',
            'password' => 'required|min:6|max:32',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->getMessageBag(), 406);
        }

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
    
    public function getDashboardPage(){
        return view('dashboard.pages.home');
    }

    public function getLoginPage(){
        return view('dashboard.pages.login');
    }

    public function getLogout(){
        Auth::logout();
        return redirect()->route('login');
    }
}