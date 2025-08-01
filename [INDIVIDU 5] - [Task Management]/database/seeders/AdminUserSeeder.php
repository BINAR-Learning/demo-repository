<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create super_admin role
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);

        // Get the first company (TASPEN)
        $company = Company::first();

        // Create admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'company_id' => 1,
            'working_unit_id' => 1,
            'job_position_id' => 1,
        ]);

        // Assign super_admin role
        $admin->assignRole($superAdminRole);
    }
} 