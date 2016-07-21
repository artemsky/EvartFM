<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    public function repeat()
    {
        return $this->hasOne('App\EventsRepeater');
    }
}
