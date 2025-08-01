<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Log;

class CreateProject extends CreateRecord
{
    protected static string $resource = ProjectResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        Log::info('CreateProject - mutateFormDataBeforeCreate - Input data:', $data);

        // Extract members data
        $members = $data['members'] ?? [];
        unset($data['members']);

        // Extract custom fields data
        $customFields = $data['custom_fields'] ?? [];
        unset($data['custom_fields']);

        // Extract labels data
        $labels = $data['labels'] ?? [];
        unset($data['labels']);

        Log::info('Labels data for create:', ['labels' => $labels]);

        // Store data in session for after create
        session(['project_members' => $members]);
        session(['project_custom_fields' => $customFields]);
        session(['project_labels' => $labels]);

        return $data;
    }

    protected function afterCreate(): void
    {
        Log::info('CreateProject - afterCreate - Record:', $this->record->toArray());

        // Get data from session
        $members = session('project_members', []);
        $customFields = session('project_custom_fields', []);
        $labels = session('project_labels', []);

        Log::info('afterCreate - Members from session:', ['members' => $members]);
        Log::info('Labels from session:', ['labels' => $labels]);

        // Save members
        if (!empty($members)) {
            Log::info('Syncing members:', ['members' => $members]);
            $this->record->members()->sync($members);
        } else {
            Log::info('No members to sync');
        }

        // Create custom fields
        if (!empty($customFields)) {
            foreach ($customFields as $field) {
                $fieldData = [
                    'project_id' => $this->record->id,
                    'name' => $field['name'],
                    'type' => $field['type'],
                    'is_required' => $field['is_required'] ?? false,
                    'is_use_for_filter' => $field['is_use_for_filter'] ?? false,
                    'is_allow_multiple' => $field['is_allow_multiple'] ?? false,
                    'options' => $field['options'] ?? [],
                ];

                \App\Models\ProjectCustomField::create($fieldData);
            }
        }

        // Create labels
        if (!empty($labels)) {
            foreach ($labels as $label) {
                try {
                    $labelData = [
                        'project_id' => $this->record->id,
                        'name' => $label['name'],
                        'color' => $label['color'],
                        'icon' => $label['icon'],
                        'order' => $label['order'] ?? 0,
                    ];

                    Log::info('Creating label:', $labelData);
                    \App\Models\TaskLabel::create($labelData);
                } catch (\Exception $e) {
                    Log::error('Error creating label:', [
                        'error' => $e->getMessage(),
                        'label_data' => $label
                    ]);
                }
            }
        }

        // Clear session data
        session()->forget(['project_members', 'project_custom_fields', 'project_labels']);
    }
} 