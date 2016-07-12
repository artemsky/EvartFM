<?php
namespace App\Http\Controllers;

use DB;
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

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);


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
        return view('dashboard.pages.home');
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

    public function getAllUsers(){

        $users = DB::table('users')->get();

        return view('dashboard.pages.user.all', ['users' => $users]);
    }

    public function postEditUser(Request $request){

        $validator = Validator::make($request->all(), [
            'Uid' => 'required|exists:users,id'
        ]);

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);

        $user = DB::table('users')->select('id', 'login', 'role', 'name', 'email')->where('id', $request['Uid'])->first();

        return response()->json($user);
    }

    public function postUpdateUser(Request $request){

        $validator = Validator::make($request->all(), [
            'login' => 'unique:users|min:4|max:16',
            'password' => 'min:6|max:32|confirmed',
            'password_confirmation' => 'min:6|max:32',
            'role' => 'in:super,admin,writer,dj',
            'email' => 'email'
        ]);

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);
        
        
        $data = [];
        foreach ($request->all() as $key=>$value){
            $data[$key] = $value;
        }


        DB::table('users')
            ->where('id', $request['id'])
            ->update($data);

        return response()->json($data, 200);
    }
    public function postDeleteUser(Request $request){
        $validator = Validator::make($request->all(), [
            'Uid' => 'required|exists:users,id'
        ]);

        if($validator->fails())
            return response()->json($validator->getMessageBag(), 406);

        DB::table('users')
            ->where('id', $request['Uid'])
            ->delete();

        return response()->json(['msg' => 'Successfully Deleted'], 200);
    }
}