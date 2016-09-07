<?php

namespace App\Components;

use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    protected $table = 'components_slider';
    public $timestamps = false;

    public function getTableColumns() {
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
}
