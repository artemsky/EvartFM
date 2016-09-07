<?php

namespace App\Components;

use Illuminate\Database\Eloquent\Model;

class Events extends Model
{
    protected $table = 'components_events';
    public $timestamps = false;

    public function getTableColumns() {
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
}
