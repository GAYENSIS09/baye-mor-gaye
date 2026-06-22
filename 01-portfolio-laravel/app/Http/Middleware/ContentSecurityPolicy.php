<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https: http://localhost:8000",
            "font-src 'self'",
            "connect-src 'self'",
            "media-src 'self' https:",
            "frame-src 'self' https:",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
        ]);

        if ($request->is('api/*')) {
            $response->headers->set('Content-Security-Policy', $csp);
        }
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
