<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Services\ContactsService;


class Contacts extends Controller
{
    public function getEditContacts(){
        return view('dashboard.pages.contacts.index')-with(['Contacts' => ContactsService::getData()]);
    }
    public function getPageContacts(){
        return view('public.contacts')-with(['Contacts' => ContactsService::getData()]);
    }
    public function postContacts(Request $request){
        ContactsService::setData($request['data']);
        return response()->isSuccessful();
    }
}
