<?php

namespace App\Components;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $table = 'components_video';
    public $timestamps = false;

    public function getTableColumns() {
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
}
