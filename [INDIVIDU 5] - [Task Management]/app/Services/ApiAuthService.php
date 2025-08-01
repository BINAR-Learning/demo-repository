<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiAuthService
{
    public function authenticate(string $apiUrl, string $username, string $password): array
    {
        try {

            $response = Http::post($apiUrl, [
                'username' => $username,
                'password' => $password,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Check if login was successful
                if (isset($data['STATUSLOGIN']) && $data['STATUSLOGIN'] == 1) {
                    // Check if user is admin (you might need to adjust this based on your API response)
                    $isAdmin = isset($data['is_admin']) ? (bool)$data['is_admin'] : false;
                    
                    return [
                        'success' => true,
                        'is_admin' => $isAdmin,
                        'data' => $data
                    ];
                }
            }

            Log::error('API Authentication failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'Authentication failed'
            ];
        } catch (\Exception $e) {
            Log::error('API Authentication error', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Authentication error: ' . $e->getMessage()
            ];
        }
    }
} 