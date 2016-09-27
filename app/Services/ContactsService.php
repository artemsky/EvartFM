<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;


class ContactsService
{
    protected static $file = 'contacts.json';


    public static function getData(): string
    {
        return json_decode(Storage::get(storage_path() ."/". self::$file) ?? '',true);
    }

    public static function setData($data)
    {
        Storage::put(storage_path() ."/". self::$file, json_encode($data));
    }
}