<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class JwtAuthController extends Controller
{
    public function callback(Request $request)
    {
        $token = $request->query('token');
        if (!$token) {
            abort(403, 'No token provided');
        }

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            // Check expiry
            if ($decoded->exp < time()) {
                abort(403, 'Token expired');
            }

            // Find or create user based on NIK
            $user = User::where('employee_id', $decoded->nik)->first();
            
            if (!$user) {
                // If user doesn't exist, redirect to Filament login with token
                return redirect()->route('filament.admin.auth.login', ['token' => $token]);
            }

            // If user exists, log them in and redirect to admin
            Auth::login($user);
            Session::put([
                'nik' => $decoded->nik,
                'name' => $decoded->name,
                'kdjab' => $decoded->job_position->code,
                'kdcab' => $decoded->working_unit->code,
                'namajab' => $decoded->job_position->name,
                'namacab' => $decoded->working_unit->name,
                'iat' => $decoded->iat,
                'exp' => $decoded->exp,
                'token' => $token
            ]);    
            return redirect('/admin');
    
        } catch (\Exception $e) {
            abort(403, 'Invalid token');
        }
    }
} 