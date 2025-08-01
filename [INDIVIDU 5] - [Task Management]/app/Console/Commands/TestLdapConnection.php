<?php

namespace App\Console\Commands;

use App\Services\LdapAuthService;
use Illuminate\Console\Command;

class TestLdapConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ldap:test {username?} {password?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test LDAP connection and authentication';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ldapService = app(LdapAuthService::class);

        $this->info('Testing LDAP connection...');

        // Test connection
        if ($ldapService->testConnection()) {
            $this->info('✅ LDAP connection successful');
        } else {
            $this->error('❌ LDAP connection failed');
            return 1;
        }

        // Test authentication if credentials provided
        $username = $this->argument('username');
        $password = $this->argument('password');

        if ($username && $password) {
            $this->info("Testing authentication for user: {$username}");
            
            $result = $ldapService->authenticate($username, $password);
            
            if ($result['success']) {
                $this->info('✅ LDAP authentication successful');
                
                // Get user info
                $userInfo = $ldapService->getUserInfo($username);
                if ($userInfo) {
                    $this->info('User Information:');
                    $this->table(['Field', 'Value'], [
                        ['Username', $userInfo['username'] ?? 'N/A'],
                        ['Display Name', $userInfo['display_name'] ?? 'N/A'],
                        ['Email', $userInfo['email'] ?? 'N/A'],
                        ['Department', $userInfo['department'] ?? 'N/A'],
                        ['Title', $userInfo['title'] ?? 'N/A'],
                        ['Employee ID', $userInfo['employee_id'] ?? 'N/A'],
                        ['Enabled', $userInfo['enabled'] ? 'Yes' : 'No'],
                        ['Locked', $userInfo['locked'] ? 'Yes' : 'No'],
                        ['Expired', $userInfo['expired'] ? 'Yes' : 'No'],
                    ]);
                }
            } else {
                $this->error('❌ LDAP authentication failed: ' . $result['message']);
                return 1;
            }
        } else {
            $this->warn('No credentials provided. Use: php artisan ldap:test <username> <password>');
        }

        return 0;
    }
}
