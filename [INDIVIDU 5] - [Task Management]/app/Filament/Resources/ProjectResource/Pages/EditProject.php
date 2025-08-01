<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Log;

class EditProject extends EditRecord
{
    protected static string $resource = ProjectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
            Actions\ForceDeleteAction::make(),
            Actions\RestoreAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        Log::info('EditProject - mutateFormDataBeforeSave - Input data:', $data);

        // Extract members data
        $members = $data['members'] ?? [];
        unset($data['members']);

        // Extract custom fields data
        $customFields = $data['custom_fields'] ?? [];
        unset($data['custom_fields']);

        // Extract labels data
        $labels = $data['labels'] ?? [];
        unset($data['labels']);

        Log::info('Members data to save:', ['members' => $members]);
        Log::info('Labels data to save:', ['labels' => $labels]);
        Log::info('Custom fields data to save:', ['custom_fields' => $customFields]);

        // Get the project record
        $project = $this->getRecord();

        // Handle custom fields
        if (!empty($customFields)) {
            // Get existing field IDs
            $existingFieldIds = $project->customFields()->pluck('id')->toArray();
            $newFieldIds = collect($customFields)->pluck('id')->filter()->toArray();

            // Delete fields that are no longer present
            $fieldsToDelete = array_diff($existingFieldIds, $newFieldIds);
            if (!empty($fieldsToDelete)) {
                \App\Models\ProjectCustomField::whereIn('id', $fieldsToDelete)->delete();
            }

            // Update or create fields
            foreach ($customFields as $field) {
                try {
                    $fieldData = [
                        'project_id' => $project->id,
                        'name' => $field['name'],
                        'type' => $field['type'],
                        'is_required' => $field['is_required'] ?? false,
                        'is_use_for_filter' => $field['is_use_for_filter'] ?? false,
                        'is_allow_multiple' => $field['is_allow_multiple'] ?? false,
                        'options' => $field['options'] ?? [],
                    ];

                    Log::info('Creating/Updating custom field:', [
                        'field_data' => $fieldData,
                        'original_field' => $field,
                        'is_allow_multiple_value' => $field['is_allow_multiple'] ?? false
                    ]);

                    if (isset($field['id'])) {
                        // Update existing field using model instance to apply casts
                        $existingField = \App\Models\ProjectCustomField::find($field['id']);
                        if ($existingField) {
                            $existingField->fill($fieldData);
                            $updated = $existingField->save();
                            Log::info('Update result:', ['success' => $updated, 'field_id' => $field['id']]);
                        }
                    } else {
                        // Create new field
                        $created = \App\Models\ProjectCustomField::create($fieldData);
                        Log::info('Create result:', ['success' => $created]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error saving custom field:', [
                        'error' => $e->getMessage(),
                        'field_data' => $field
                    ]);
                }
            }
        } else {
            // If no custom fields provided, delete all existing fields
            $project->customFields()->delete();
        }

        // Handle labels
        if (!empty($labels)) {
            // Get existing label IDs
            $existingLabelIds = $project->labels()->pluck('id')->toArray();
            $newLabelIds = collect($labels)->pluck('id')->filter()->toArray();

            // Delete labels that are no longer present
            $labelsToDelete = array_diff($existingLabelIds, $newLabelIds);
            if (!empty($labelsToDelete)) {
                \App\Models\TaskLabel::whereIn('id', $labelsToDelete)->delete();
            }

            // Update or create labels
            foreach ($labels as $label) {
                try {
                    $labelData = [
                        'project_id' => $project->id,
                        'name' => $label['name'],
                        'color' => $label['color'],
                        'icon' => $label['icon'],
                        'order' => $label['order'] ?? 0,
                    ];

                    Log::info('Creating/Updating label:', $labelData);

                    if (isset($label['id'])) {
                        // Update existing label using model instance
                        $existingLabel = \App\Models\TaskLabel::find($label['id']);
                        if ($existingLabel) {
                            $existingLabel->fill($labelData);
                            $existingLabel->save();
                        }
                    } else {
                        // Create new label
                        \App\Models\TaskLabel::create($labelData);
                    }
                } catch (\Exception $e) {
                    Log::error('Error saving label:', [
                        'error' => $e->getMessage(),
                        'label_data' => $label
                    ]);
                }
            }
        } else {
            // If no labels provided, delete all existing labels
            $project->labels()->delete();
        }

        // Save members
        if (!empty($members)) {
            Log::info('Syncing members:', ['members' => $members]);
            $this->record->members()->sync($members);
        } else {
            Log::info('No members to sync');
        }

        return $data;
    }
} 