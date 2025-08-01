<?php

namespace App\Auth;

use App\Services\ApiAuthService;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;

class ApiGuard implements Guard
{
    use GuardHelpers;

    protected $request;
    protected $provider;
    protected $apiAuthService;

    public function __construct(UserProvider $provider, Request $request, ApiAuthService $apiAuthService)
    {
        $this->request = $request;
        $this->provider = $provider;
        $this->apiAuthService = $apiAuthService;
    }

    public function user()
    {
        if (!is_null($this->user)) {
            return $this->user;
        }

        $user = null;

        if ($this->request->hasSession() && $this->request->session()->has('user')) {
            $user = $this->provider->retrieveById(
                $this->request->session()->get('user')
            );
        }

        return $this->user = $user;
    }

    public function validate(array $credentials = [])
    {
        if (empty($credentials['username']) || empty($credentials['password'])) {
            return false;
        }

        $result = $this->apiAuthService->authenticate(
            $credentials['username'],
            $credentials['password']
        );

        return $result['success'];
    }
} 