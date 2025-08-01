<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\JobPosition;
use App\Models\WorkingUnit;
use Illuminate\Database\Seeder;

class JobPositionSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('name', 'TASPEN')->first();
        $workingUnit = WorkingUnit::where('company_id', $company->id)->first();

        JobPosition::create([
            'name' => 'Sample Job Position',
            'code' => 'SAMPLE-001',
            'working_unit_id' => $workingUnit->id,
        ]);
    }
} 