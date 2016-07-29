<?php

namespace App\Http\Middleware;

use Closure;

class RoleMiddleware
{
    /**
     * Run the request filter.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  array  $roles
     * @return mixed
     */
    public function handle($request, Closure $next, ...$roles){

        foreach ($roles as $role) {
            if($request->user()->hasRole($role))
                return $next($request);
        }

        return redirect('/dashboard');
    }
}
