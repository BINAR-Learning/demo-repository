<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Services\ApiAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{

    protected $redirectTo = '/admin';
    protected $apiAuthService;

    public function __construct(ApiAuthService $apiAuthService)
    {
        $this->middleware('guest')->except('logout');
        $this->apiAuthService = $apiAuthService;
    }

    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $this->validateLogin($request);

        // Get the user's company through their username
        $user = User::where('username', $request->username)->first();
        
        if (!$user) {
            throw ValidationException::withMessages([
                'username' => [trans('auth.failed')],
            ]);
        }

        $company = $user->workingUnit?->company;

        if (!$company) {
            throw ValidationException::withMessages([
                'username' => ['User is not associated with any company.'],
            ]);
        }

        // Check authentication type and handle accordingly
        if ($company->usesApiAuth()) {
            if (!$company->api_url) {
                throw ValidationException::withMessages([
                    'username' => ['Company API URL is not configured.'],
                ]);
            }

            // Use API authentication
            $response = $this->apiAuthService->authenticate(
                $company->api_url,
                $request->username,
                $request->password
            );

            if (!$response['success']) {
                throw ValidationException::withMessages([
                    'username' => [$response['message'] ?? trans('auth.failed')],
                ]);
            }

            Auth::login($user);
            return redirect()->intended($this->redirectPath());
        }

        // Use default authentication
        if ($this->attemptLogin($request)) {
            return $this->sendLoginResponse($request);
        }

        return $this->sendFailedLoginResponse($request);
    }

    protected function username()
    {
        return 'username';
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
