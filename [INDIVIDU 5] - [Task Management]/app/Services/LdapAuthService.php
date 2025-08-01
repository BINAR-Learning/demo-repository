<?php

namespace App\Services;

use App\Ldap\User as LdapUser;
use LdapRecord\Connection;
use LdapRecord\Container;
use Illuminate\Support\Facades\Log;

class LdapAuthService
{
    protected Connection $connection;

    public function __construct()
    {
        $this->connection = Container::getDefaultConnection();
    }

    /**
     * Authenticate a user against LDAP
     *
     * @param string $username
     * @param string $password
     * @return array
     */
    public function authenticate(string $username, string $password): array
    {
        try {
            // Find the user in LDAP
            $ldapUser = LdapUser::where('samaccountname', $username)->first();

            if (!$ldapUser) {
                return [
                    'success' => false,
                    'message' => 'User not found in LDAP',
                    'user' => null
                ];
            }

            // Attempt to bind with user credentials
            $userDn = $ldapUser->getDn();
            if ($this->connection->auth()->attempt($userDn, $password)) {
                return [
                    'success' => true,
                    'message' => 'Authentication successful',
                    'user' => $ldapUser
                ];
            }

            return [
                'success' => false,
                'message' => 'Invalid credentials',
                'user' => null
            ];

        } catch (\Exception $e) {
            Log::error('LDAP authentication error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'LDAP connection error',
                'user' => null
            ];
        }
    }

    /**
     * Get user information from LDAP
     *
     * @param string $username
     * @return array|null
     */
    public function getUserInfo(string $username): ?array
    {
        try {
            $ldapUser = LdapUser::where('samaccountname', $username)->first();

            if (!$ldapUser) {
                return null;
            }

            return [
                'username' => $ldapUser->getUsernameAttribute(),
                'display_name' => $ldapUser->getDisplayNameAttribute(),
                'email' => $ldapUser->getEmailAttribute(),
                'department' => $ldapUser->getDepartmentAttribute(),
                'title' => $ldapUser->getTitleAttribute(),
                'employee_id' => $ldapUser->getEmployeeIdAttribute(),
                'enabled' => $ldapUser->isEnabled(),
                'locked' => $ldapUser->isLocked(),
                'expired' => $ldapUser->isExpired(),
            ];

        } catch (\Exception $e) {
            Log::error('LDAP user info error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Test LDAP connection
     *
     * @return bool
     */
    public function testConnection(): bool
    {
        try {
            $this->connection->connect();
            return true;
        } catch (\Exception $e) {
            Log::error('LDAP connection test failed: ' . $e->getMessage());
            return false;
        }
    }
} 