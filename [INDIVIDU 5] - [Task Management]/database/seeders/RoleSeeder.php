<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for all resources
        $resources = ['user', 'role', 'permission', 'company', 'working_unit', 'job_position'];
        $actions = ['view_any', 'view', 'create', 'update', 'delete', 'delete_any'];

        foreach ($resources as $resource) {
            foreach ($actions as $action) {
                Permission::create(['name' => $action . '_' . $resource]);
            }
        }

        // Create super admin role and assign all permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Create admin role with limited permissions
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view_any_user',
            'view_user',
            'create_user',
            'update_user',
            'view_any_company',
            'view_company',
            'view_any_working_unit',
            'view_working_unit',
            'view_any_job_position',
            'view_job_position',
        ]);

        // Create user role with basic permissions
        $user = Role::create(['name' => 'user']);
        $user->givePermissionTo([
            'view_user',
            'view_company',
            'view_working_unit',
            'view_job_position',
        ]);
    }
}
