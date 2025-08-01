<div class="space-y-4">
    <div class="bg-green-50 rounded-lg p-6 border border-green-200">
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
            </div>
            <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium text-green-900">Step 2: Upload File</h3>
                <p class="mt-1 text-sm text-green-700">
                    Upload your filled Excel or CSV file. Only .xlsx, .xls, and .csv files are allowed (max 10MB).
                </p>
                <div class="mt-4">
                    <div class="flex items-center space-x-4">
                        <input 
                            type="file" 
                            wire:model="uploadedFile"
                            accept=".xlsx,.xls,.csv"
                            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                        >
                        <button 
                            type="button"
                            wire:click="processUploadedFile"
                            wire:loading.attr="disabled"
                            wire:target="processUploadedFile"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <div wire:loading wire:target="processUploadedFile" class="mr-2">
                                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <div wire:loading.remove wire:target="processUploadedFile">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span wire:loading.remove wire:target="processUploadedFile">Process</span>
                            <span wire:loading wire:target="processUploadedFile">Processing...</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div> 