<?php
namespace App\Http\Controllers\Traits;

use DB;
use Illuminate\Http\Request;
use Validator;
trait SuperUserActions{
    use Validate;
    public function getAllUsers(){

        $users = DB::table('users')->get();

        return view('dashboard.pages.user.all', ['users' => $users]);
    }

    public function postEditUser(Request $request){

        $this->isValid($request, [
            'Uid' => 'required|exists:users,id'
        ]);

        $user = DB::table('users')->select('id', 'login', 'role', 'name', 'email')->where('id', $request['Uid'])->first();

        return response()->json($user);
    }

    public function postUpdateUser(Request $request){

        $this->isValid($request, [
            'login' => 'unique:users|min:4|max:16',
            'password' => 'min:6|max:32|confirmed',
            'password_confirmation' => 'min:6|max:32',
            'role' => 'in:super,admin,writer,dj',
            'email' => 'email'
        ]);


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

        $this->isValid($request, [
            'Uid' => 'required|exists:users,id'
        ]);


        DB::table('users')
            ->where('id', $request['Uid'])
            ->delete();

        return response()->json(['msg' => 'Successfully Deleted'], 200);
    }
}