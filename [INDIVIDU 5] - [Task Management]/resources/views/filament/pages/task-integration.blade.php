<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Progress Steps --}}
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-medium text-gray-900">Import Process</h2>
                <div class="flex items-center space-x-4">
                    {{-- Step 1: Select Project --}}
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {{ $currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600' }}">
                            1
                        </div>
                        <span class="p-2 text-sm font-medium {{ $currentStep === 'select_project' ? 'text-blue-600' : ($data['project_id'] ? 'text-green-600' : 'text-gray-500') }}">
                            Select Project
                        </span>
                    </div>

                    <div class="w-8 h-px {{ $data['project_id'] ? 'bg-green-300' : 'bg-gray-300' }}"></div>

                    {{-- Step 2: Download Template --}}
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {{ $currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600' }}">
                            2
                        </div>
                        <span class="p-2 text-sm font-medium {{ $currentStep === 'download_template' ? 'text-blue-600' : ($currentStep === 'preview' ? 'text-green-600' : 'text-gray-500') }}">
                            Download & Upload
                        </span>
                    </div>

                    <div class="w-8 h-px {{ $currentStep === 'preview' ? 'bg-green-300' : 'bg-gray-300' }}"></div>

                    {{-- Step 3: Preview & Import --}}
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {{ $currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600' }}">
                            3
                        </div>
                        <span class="p-2 text-sm font-medium {{ $currentStep === 'preview' ? 'text-blue-600' : 'text-gray-500' }}">
                            Preview & Import
                        </span>
                    </div>
                </div>
            </div>

            {{-- Current Step Content --}}
            @if($currentStep === 'select_project' || !$data['project_id'])
                <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">Select a Project</h3>
                    <p class="mt-1 text-sm text-gray-500">Choose the project where you want to import tasks.</p>
                </div>
            @endif
        </div>

        {{-- Project Selection Form --}}
        @if($currentStep === 'select_project' || !$data['project_id'])
            <x-filament-panels::form>
                {{ $this->form }}
            </x-filament-panels::form>
        @endif

        {{-- Download Template Section --}}
        @if($data['project_id'] && ($currentStep === 'download_template' || $currentStep === 'upload_file'))
            <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div class="ml-3 flex-1">
                        <h3 class="text-sm font-medium text-blue-900">Step 1: Download Template</h3>
                        <p class="mt-1 text-sm text-blue-700">
                            Download the Excel template with the correct format including custom fields for 
                            <strong>{{ \App\Models\Project::find($data['project_id'])?->name }}</strong>.
                        </p>
                        <br>
                        <div class="mt-4">
                            <x-filament::button
                                color="primary"
                                wire:click="downloadTemplate"
                                size="sm"
                                wire:loading.attr="disabled"
                                wire:target="downloadTemplate"
                            >
                                <div class="flex items-center gap-2">
                                    <div wire:loading wire:target="downloadTemplate">
                                        <x-filament::loading-indicator class="w-4 h-4" />
                                    </div>
                                    <div wire:loading.remove wire:target="downloadTemplate">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span wire:loading.remove wire:target="downloadTemplate">Download Template</span>
                                    <span wire:loading wire:target="downloadTemplate">Downloading...</span>
                                </div>
                            </x-filament::button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Upload Section --}}
            <x-filament-panels::form>
                {{ $this->form }}
            </x-filament-panels::form>
        @endif

        {{-- Preview Section --}}
        @if($importPreview && $currentStep === 'preview')
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Preview & Validation Results</h3>
                    <div class="flex gap-2">
                        <x-filament::button
                            color="gray"
                            wire:click="resetImport"
                            size="sm"
                        >
                            Start Over
                        </x-filament::button>
                    </div>
                </div>

                {{-- Validation Summary --}}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white rounded-lg p-4 border">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-500">Total Rows</p>
                                <p class="text-2xl font-semibold text-gray-900">{{ count($importPreview) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4 border">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-500">Valid Rows</p>
                                <p class="text-2xl font-semibold text-green-600">{{ count(array_filter($importPreview, fn($row) => !$row['has_errors'])) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4 border">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-500">Errors</p>
                                <p class="text-2xl font-semibold text-red-600">{{ count(array_filter($importPreview, fn($row) => $row['has_errors'])) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <br>

                {{-- Validation Errors Summary --}}
                @if($validationErrors)
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div class="flex items-center gap-2 text-red-800 font-medium text-sm mb-2">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                            Validation Errors Found
                        </div>
                        <div class="max-h-32 overflow-y-auto">
                            <ul class="text-sm text-red-700 space-y-1">
                                @foreach(array_unique($validationErrors) as $error)
                                    <li>• {{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                @endif

                {{-- Preview Table --}}
                <div class="overflow-x-auto border border-gray-300 rounded-lg bg-white">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Row</th>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Title</th>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Description</th>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Label</th>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Assignee</th>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Priority</th>
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Due Date</th>
                                @foreach($customFieldsHeaders as $header)
                                    <th class="px-3 py-2 text-left font-medium text-gray-700">{{ $header }}</th>
                                @endforeach
                                <th class="px-3 py-2 text-left font-medium text-gray-700">Errors</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($importPreview as $index => $row)
                                <tr class="{{ $row['has_errors'] ? 'bg-red-50' : 'bg-white' }}">
                                    <td class="px-3 py-2 font-medium">{{ $index + 1 }}</td>
                                    <td class="px-3 py-2">{{ $row['title'] ?? '' }}</td>
                                    <td class="px-3 py-2">{{ Str::limit($row['description'] ?? '', 50) }}</td>
                                    <td class="px-3 py-2">{{ $row['label'] ?? '' }}</td>
                                    <td class="px-3 py-2">{{ $row['assignee'] ?? '' }}</td>
                                    <td class="px-3 py-2">
                                        @if($row['priority'])
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                                {{ $row['priority'] === 'high' ? 'bg-red-100 text-red-800' : 
                                                   ($row['priority'] === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') }}">
                                                {{ ucfirst($row['priority']) }}
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-3 py-2">{{ $row['due_date'] ?? '' }}</td>
                                    @foreach($customFieldsHeaders as $header)
                                        <td class="px-3 py-2">{{ $row['custom_fields'][$header] ?? '' }}</td>
                                    @endforeach
                                    <td class="px-3 py-2">
                                        @if($row['errors'])
                                            <div class="text-red-600 text-xs">
                                                @foreach($row['errors'] as $error)
                                                    <div>• {{ $error }}</div>
                                                @endforeach
                                            </div>
                                        @else
                                            <span class="text-green-600 text-xs">✓ Valid</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                {{-- Import Actions --}}
                <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div class="text-sm text-gray-600">
                        Ready to import {{ count(array_filter($importPreview, fn($row) => !$row['has_errors'])) }} valid tasks
                    </div>
                    <div class="flex gap-3">
                        <x-filament::button
                            color="gray"
                            wire:click="resetImport"
                            size="sm"
                        >
                            Cancel
                        </x-filament::button>
                        <x-filament::button
                            color="success"
                            wire:click="processImport"
                            size="sm"
                            :disabled="count(array_filter($importPreview, fn($row) => !$row['has_errors'])) === 0"
                            wire:loading.attr="disabled"
                            wire:target="processImport"
                        >
                            <div class="flex items-center gap-2">
                                <div wire:loading wire:target="processImport">
                                    <x-filament::loading-indicator class="w-4 h-4" />
                                </div>
                                <span wire:loading.remove wire:target="processImport">
                                    Import {{ count(array_filter($importPreview, fn($row) => !$row['has_errors'])) }} Tasks
                                </span>
                                <span wire:loading wire:target="processImport">Processing...</span>
                            </div>
                        </x-filament::button>
                    </div>
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page> 