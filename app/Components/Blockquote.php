<?php

namespace App\Components;

use Illuminate\Database\Eloquent\Model;

class Blockquote extends Model
{
    protected $table = 'components_blockquote';
    public $timestamps = false;

    public function getTableColumns() {
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
}
