<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CompanySeeder::class,
            WorkingUnitSeeder::class,
            JobPositionSeeder::class,
            AdminUserSeeder::class,
        ]);

        // User::factory(10)->create();

        // Create super admin role if it doesn't exist
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);

        // Find super admin user and assign role
        $superAdmin = User::first();
        if ($superAdmin) {
            $superAdmin->assignRole('super_admin');
        }
    }
}
