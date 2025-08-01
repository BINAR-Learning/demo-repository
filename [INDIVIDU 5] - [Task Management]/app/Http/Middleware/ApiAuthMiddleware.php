<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiToken = session('api_token');

        if (!$apiToken) {
            auth()->logout();
            return redirect()->route('filament.admin.auth.login');
        }

        // Add API token to all outgoing requests
        Http::macro('withToken', function ($token) {
            return Http::withHeaders([
                'Authorization' => 'Bearer ' . $token
            ]);
        });

        return $next($request);
    }
} 