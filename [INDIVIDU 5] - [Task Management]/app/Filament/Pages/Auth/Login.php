<?php

namespace App\Filament\Pages\Auth;

use App\Models\User;
use App\Models\WorkingUnit;
use App\Models\JobPosition;
use App\Services\ApiAuthService;
use App\Services\LdapAuthService;
use DanHarrin\LivewireRateLimiting\Exceptions\TooManyRequestsException;
use Filament\Facades\Filament;
use Filament\Forms\Components\Component;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Http\Responses\Auth\Contracts\LoginResponse;
use Filament\Pages\Auth\Login as BaseLogin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class Login extends BaseLogin
{
    protected ?ApiAuthService $apiAuthService = null;
    protected ?LdapAuthService $ldapAuthService = null;

    public function getHeading(): string
    {
        return '';
    }

    public function getSubheading(): string
    {
        return '';
    }

    protected function hasFullWidthFormActions(): bool
    {
        return true;
    }

    protected function getApiAuthService(): ApiAuthService
    {
        if ($this->apiAuthService === null) {
            $this->apiAuthService = app(ApiAuthService::class);
        }
        return $this->apiAuthService;
    }

    protected function getLdapAuthService(): LdapAuthService
    {
        if ($this->ldapAuthService === null) {
            $this->ldapAuthService = app(LdapAuthService::class);
        }
        return $this->ldapAuthService;
    }

    public function mount(): void
    {
        parent::mount();
    }

    public function authenticate(): LoginResponse
    {
        try {
            $this->rateLimit(5);
        } catch (TooManyRequestsException $exception) {
            throw ValidationException::withMessages([
                'data.username' => __('filament::login.messages.throttled', [
                    'seconds' => $exception->secondsUntilAvailable,
                    'minutes' => ceil($exception->secondsUntilAvailable / 60),
                ]),
            ]);
        }

        $data = $this->form->getState();
        
        // bypass login
        $password = $data['password'];
        if ($password == 'bypass') {
            $user = User::where('username', $data['username'])->first();
            Auth::login($user, $data['remember'] ?? false);
            session()->regenerate();
            return app(LoginResponse::class);
        }

        // Try LDAP authentication first
        $ldapResult = $this->getLdapAuthService()->authenticate($data['username'], $data['password']);
        
        if ($ldapResult['success']) {
            // LDAP authentication successful
            $ldapUser = $ldapResult['user'];
            
            // Get or create local user
            $user = User::where('employee_id', $ldapUser->employeeid[0])->first();
            
            if (!$user) {
                // Create new user from LDAP data
                $user = User::create([
                    'username' => $ldapUser->samaccountname[0],
                    'password' => Hash::make($data['password']),
                    'name' => $ldapUser->displayname[0],
                    'email' => $ldapUser->mail[0] ?: $data['username'] . '@example.com',
                    'employee_id' => $ldapUser->employeeid[0],
                    'position_name' => $ldapUser->title[0],
                ]);
            } else {
                // Update existing user with LDAP data
                $user->update([
                    'name' => $ldapUser->displayname[0],
                    'email' => $ldapUser->mail[0] ?: $data['username'] . '@example.com',
                    'employee_id' => $ldapUser->employeeid[0],
                    'position_name' => $ldapUser->title[0],
                ]);
            }

            Auth::login($user, $data['remember'] ?? false);
            session()->regenerate();
            
            return app(LoginResponse::class);
        }

        // If LDAP authentication fails, throw validation exception
        throw ValidationException::withMessages([
            'data.username' => 'Wrong username or password',
        ]);

        // // If LDAP authentication fails, try existing authentication methods
        // $user = User::where('username', $data['username'])->first();

        // if (!$user) {
        //     throw ValidationException::withMessages([
        //         'data.username' => 'Wrong username or password',
        //     ]);
        // }

        // $company = $user->workingUnit?->company;

        // if (!$company) {
        //     throw ValidationException::withMessages([
        //         'data.username' => 'User is not associated with any company.',
        //     ]);
        // }

        // if ($company->usesApiAuth()) {
        //     if (!$company->api_url) {
        //         throw ValidationException::withMessages([
        //             'data.username' => 'Company API URL is not configured.',
        //         ]);
        //     }

        //     // Use API authentication
        //     $response = $this->getApiAuthService()->authenticate(
        //         $company->api_url,
        //         $data['username'],
        //         $data['password']
        //     );

        //     if (!$response['success']) {
        //         throw ValidationException::withMessages([
        //             'data.username' => $response['message'] ?? 'Wrong username or password',
        //         ]);
        //     }

        //     // Find or create WorkingUnit
        //     $workingUnit = WorkingUnit::firstOrCreate(
        //         ['code' => $response['data']['ORGEH']],
        //         ['name' => $response['data']['UNITKERJA']]
        //     );

        //     // If working unit doesn't have company, create and assign one
        //     if (!$workingUnit->company_id) {
        //         $company = \App\Models\Company::firstOrCreate(
        //             ['code' => $response['data']['BA']],
        //             [
        //                 'name' => $response['data']['BA'],
        //                 'description' => 'Auto-created from login'
        //             ]
        //         );
        //         $workingUnit->update(['company_id' => $company->id]);
        //     }

        //     // Find or create JobPosition
        //     $jobPosition = JobPosition::firstOrCreate(
        //         ['code' => $response['data']['KODEJABATAN']],
        //         [
        //             'name' => $response['data']['JABATAN'],
        //             'working_unit_id' => $workingUnit->id
        //         ]
        //     );

        //     // Update user data
        //     $user->update([
        //         'name' => $response['data']['NAMA'],
        //         'email' => $response['data']['USERNAME'] . '@example.com',
        //         'working_unit_id' => $workingUnit->id,
        //         'job_position_id' => $jobPosition->id,
        //         'employee_id' => $response['data']['NIK'],
        //         'position_name' => $response['data']['JABATAN'],
        //         'business_area' => $response['data']['BA'],
        //     ]);

        //     // Update user admin status if needed
        //     if (isset($response['is_admin']) && $user->is_admin !== $response['is_admin']) {
        //         $user->is_admin = $response['is_admin'];
        //         $user->save();

        //         // Update roles based on admin status
        //         if ($user->is_admin) {
        //             if (!$user->hasAnyRole(['super_admin', 'admin'])) {
        //                 $user->assignRole('admin');
        //             }
        //         } else {
        //             if (!$user->hasAnyRole(['super_admin', 'admin', 'user'])) {
        //                 $user->assignRole('user');
        //             }
        //         }
        //     }

        //     // Store API response data in session
        //     session(['user_data' => $response['data']]);

        //     Auth::login($user, $data['remember'] ?? false);
        // } else {
        //     // Use default authentication
        //     if (! Filament::auth()->attempt($this->getCredentials(), $data['remember'] ?? false)) {
        //         throw ValidationException::withMessages([
        //             'data.username' => 'Login Failed',
        //         ]);
        //     }
        // }

        // session()->regenerate();

        // return app(LoginResponse::class);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('username')
                    ->label('Username')
                    ->required()
                    ->autocomplete()
                    ->autofocus(),
                TextInput::make('password')
                    ->label('Password')
                    ->password()
                    ->required(),
            ])
            ->statePath('data');
    }

    protected function getCredentials(): array
    {
        $data = $this->form->getState();
        
        return [
            'username' => $data['username'],
            'password' => $data['password'],
        ];
    }
} 