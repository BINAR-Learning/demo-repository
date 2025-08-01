<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::create([
            'name' => 'TASPEN',
            'code' => 'A000',
            'login_type' => 'default',
        ]);
    }
} 