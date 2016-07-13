<?php
namespace App\Http\Controllers\Traits;

use DB;
use Illuminate\Http\Request;
use Validator;
trait SuperUserActions{
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