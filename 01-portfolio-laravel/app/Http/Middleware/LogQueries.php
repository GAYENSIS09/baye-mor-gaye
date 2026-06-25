<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogQueries
{
    public function handle(Request $request, Closure $next): Response
    {
        DB::enableQueryLog();
        
        $response = $next($request);
        
        $queries = DB::getQueryLog();
        if (count($queries) > 0) {
            $total = count($queries);
            Log::debug("[DB] {$total} queries for {$request->method()} {$request->path()}");
        }
        
        return $response;
    }
}
