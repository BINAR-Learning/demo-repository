<?php

namespace App\Filament\Resources\UserResource\Actions;

use App\Models\Company;
use App\Models\JobPosition;
use App\Models\User;
use App\Models\WorkingUnit;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Get;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Ldap\User as LdapUser;

class SyncUserData
{
    public static function make(): Action
    {
        return Action::make('syncUserData')
            ->label('Sync User Data')
            ->icon('heroicon-o-arrow-path')
            ->requiresConfirmation()
            ->modalHeading('Sync User Data')
            ->modalDescription('This action will override all existing user data with the latest data from the API. Are you sure you want to continue?')
            ->modalSubmitActionLabel('Yes, Sync Data')
            ->color('warning')
            ->form([
                Select::make('company_id')
                    ->label('Company')
                    ->options(Company::pluck('name', 'id'))
                    ->searchable()
                    ->placeholder('Select company (optional)')
                    ->helperText('Leave empty to sync all users')
                    ->live(),
                Select::make('working_unit_id')
                    ->label('Working Unit')
                    ->options(function (Get $get) {
                        $companyId = $get('company_id');
                        if (!$companyId) {
                            return WorkingUnit::pluck('name', 'id');
                        }
                        return WorkingUnit::where('company_id', $companyId)->pluck('name', 'id');
                    })
                    ->searchable()
                    ->placeholder('Select working unit (optional)')
                    ->helperText('Leave empty to sync all users')
                    ->live()
            ])
            ->action(function (array $data) {
                try {

                    $selectedCompany = !empty($data['company_id']) ? Company::find($data['company_id']) : null;
                    $selectedWorkingUnit = !empty($data['working_unit_id']) ? WorkingUnit::find($data['working_unit_id']) : null;

                    $employees = LdapUser::query()
                        ->where('objectclass', '=', 'user')
                        ->where('objectcategory', '=', 'person')
                        ->where('mail', '*');

                    // Filter by working unit if selected
                    if (!is_null($selectedWorkingUnit)) {
                        $employees = $employees->where('orgunit', $selectedWorkingUnit->code);
                    }

                    $employees = $employees->get();

                    $createdCount = 0;
                    $updatedCount = 0;

                    foreach ($employees as $employee) {
                        if ($employee['employeeid'][0] && $employee['kodejabatan'][0]) {

                            // Find or create working unit
                            $workingUnit = WorkingUnit::firstOrCreate(
                                ['code' => $employee['orgunit'][0]],
                                [
                                    'name' => $employee['physicaldeliveryofficename'][0],
                                    'code' => $employee['orgunit'][0], // Temporary random code, will be updated on login
                                    'company_id' => !is_null($selectedWorkingUnit) ? $selectedWorkingUnit->company_id : 1
                                ]
                            );

                            // Find or create job position
                            $jobPosition = JobPosition::firstOrCreate(
                                ['code' => $employee['kodejabatan'][0]],
                                [
                                    'name' => $employee['title'][0],
                                    'code' => $employee['kodejabatan'][0],
                                    'working_unit_id' => $workingUnit->id
                                ]
                            );

                             // Find existing user or create new one
                             $user = User::where('employee_id', $employee['employeeid'][0])->first();

                             if (!$user) {
                                $user = User::create([
                                    'employee_id' => $employee['employeeid'][0],
                                    'username' => strtolower($employee['samaccountname'][0]),
                                    'name' => $employee['displayname'][0],
                                    'email' => strtolower($employee['mail'][0]) ?? strtolower($employee['employeeid'][0]) . '@taspen.co.id',
                                    'password' => bcrypt('password123'), // Default password
                                    'job_position_id' => $jobPosition->id,
                                    'working_unit_id' => $workingUnit->id,
                                ]);

                                // Assign user role
                                $user->assignRole('user');
                                $createdCount++;
                            } else {
                                // Update existing user
                                $user->update([
                                    'name' => $employee['displayname'][0],
                                    'username' => strtolower($employee['samaccountname'][0]),
                                    'email' => strtolower($employee['mail'][0]) ?? strtolower($employee['employeeid'][0]) . '@taspen.co.id',
                                    'job_position_id' => $jobPosition->id,
                                    'working_unit_id' => $workingUnit->id,
                                ]);
                                $updatedCount++;
                            }
                        }
                    }

                    $message = '';
                    if (!empty($data['company_id']) && !empty($data['working_unit_id'])) {
                        $message = "Created {$createdCount} new users and updated {$updatedCount} existing users for the selected company and working unit.";
                    } elseif (!empty($data['company_id'])) {
                        $message = "Created {$createdCount} new users and updated {$updatedCount} existing users for the selected company.";
                    } elseif (!empty($data['working_unit_id'])) {
                        $message = "Created {$createdCount} new users and updated {$updatedCount} existing users for the selected working unit.";
                    } else {
                        $message = "Created {$createdCount} new users and updated {$updatedCount} existing users.";
                    }

                    Notification::make()
                        ->title('User Sync Successful')
                        ->body($message)
                        ->success()
                        ->send();

                } catch (\Exception $e) {

                    Notification::make()
                        ->title('User Sync Failed')
                        ->body($e->getMessage())
                        ->danger()
                        ->send();
                }
            });
    }
} 