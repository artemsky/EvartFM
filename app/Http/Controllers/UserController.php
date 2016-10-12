<?php
namespace App\Http\Controllers;

use App\Services\RadioService;
use Validator;
use Illuminate\Support\Facades\Auth;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;

class UserController extends Controller{

    use Traits\Validate;
    public function postSignIn(Request $request){


        $this->isValid($request, [
            'login' => 'required|min:4|max:16',
            'password' => 'required|min:6|max:32',
        ]);
        if(Auth::attempt([
            'login' => $request['login'],
            'password' => $request['password']
        ])){
            return response()->json([
                'message' => trans('auth.succeed'),
                'redirectURL' => route('dashboard.home')
            ], 200);
        }

        return response()->json([
            'message' => Lang::get('auth.failed')
        ], 422);
    }
    public function postRegister(Request $request){

        $this->isValid($request, [
            'login' => 'required|unique:users|min:4|max:16',
            'password' => 'required|min:6|max:32|confirmed',
            'password_confirmation' => 'required|min:6|max:32',
            'role' => 'required|in:super,admin,writer,dj',
            'email' => 'email'
        ]);


        $user = new User();
        $user->login = $request['login'];
        $user->password = bcrypt($request['password']);
        $user->role = $request['role'];
        $user->name = $request['name'];
        $user->email = $request['email'];

        $user->save();
        
        return response()->json(['msg' => 'Successfully Added']);
    }
    
    public function getDashboardPage(){
        $rs = new RadioService();
        return view('dashboard.pages.home')->with([
            'Stats' => $rs->getData()
        ]);
    }

    public function getLoginPage(){
        return view('dashboard.pages.login');
    }

    public function getLogout(){
        Auth::logout();
        return redirect()->route('dashboard.login.get');
    }
    
    public function getAddUsers(){
        return view('dashboard.pages.user.add');
    }

    public function getAllUsers(){
        return view('dashboard.pages.user.all', ['users' => User::all()]);
    }

    public function deleteUser(Request $request){
        $user = User::find($request['id']);
        if($user->delete())
            return response()->json([
                'message' => "User [{$user->login}] successfully deleted"
            ]);
        return response()->json([
            'message' => "Error occurred! Try again later"
        ], 403);
    }

    public function postUpdateUser(Request $request){
        $user = User::find($request['id']);
        $user->role = $request['role'];
        $user->name = $request['name'];
        $user->email = $request['email'];
        if(array_key_exists('password', $request->all())){
            $user->password = bcrypt($request['password']);
        }
        $user->save();
        return response()->json([
            'message' => "User [{$user->login}] successfully updated"
        ]);
    }

    
}