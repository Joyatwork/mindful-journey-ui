<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Checkrole
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);

        $user = Auth::user();
        // Mets la variable user = user Authentification.

        //  if User n'est pas connecté, redirige vers -> login;
        if(!user) {
            return redirect()->route('login'); 
        }

        if(!in_array($user->role->name, $roles)) {
            abort(403, `Tu n'est pas autorisé `);
        }

        return $next($request);
    }
}
