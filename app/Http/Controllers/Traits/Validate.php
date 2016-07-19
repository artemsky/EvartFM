<?php
namespace App\Http\Controllers\Traits;

use Illuminate\Validation\ValidationException;
use Validator;
use Illuminate\Http\JsonResponse;
trait Validate{
    public function isValid($request, $checks, $status = 406){
        $validator = Validator::make($request->all(), $checks);
        if($validator->fails())
            throw new ValidationException($validator, new JsonResponse($validator->getMessageBag(), $status), $validator->getMessageBag());
    }
}