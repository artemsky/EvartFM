<?php
namespace App\Http\Controllers;

use App\Services\RadioService;
use Validator;
use Illuminate\Support\Facades\Auth;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;

class UserController extends Controller{

    use Traits\SuperUserActions;
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
                'redirect' => route('dashboard.home')
            ], 200);
        }

        return response()->json([
            'msg' => Lang::get('auth.failed')
        ], 422);
    }
    public function postRegister(Request $request){

        $validator = Validator::make($request->all(), [
            'login' => 'required|unique:users|min:4|max:16',
            'password' => 'required|min:6|max:32|confirmed',
            'password_confirmation' => 'required',
            'role' => 'required|in:super,admin,writer,dj',
            'email' => 'email'
        ]);

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);

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
        return redirect()->route('login');
    }
    
    public function getAddUsers(){
        return view('dashboard.pages.user.add');
    }

    
}