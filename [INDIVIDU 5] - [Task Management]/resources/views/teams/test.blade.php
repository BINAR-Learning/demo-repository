<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teams Integration Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-800 mb-8">🧪 Microsoft Teams Integration Test</h1>
            
            <!-- Status Section -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Integration Status</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span class="font-medium">Integration Enabled:</span>
                        <span class="ml-2 px-2 py-1 rounded text-sm {{ $isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                            {{ $isEnabled ? 'Yes' : 'No' }}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium">Webhook URL:</span>
                        <span class="ml-2 text-sm text-gray-600">
                            {{ $webhookUrl ? 'Configured' : 'Not configured' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Statistics Section -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Notification Statistics</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">{{ $stats['total'] }}</div>
                        <div class="text-sm text-gray-600">Total</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">{{ $stats['sent'] }}</div>
                        <div class="text-sm text-gray-600">Sent</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">{{ $stats['failed'] }}</div>
                        <div class="text-sm text-gray-600">Failed</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-yellow-600">{{ $stats['pending'] }}</div>
                        <div class="text-sm text-gray-600">Pending</div>
                    </div>
                </div>
            </div>

            <!-- Test Buttons Section -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Test Notifications</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onclick="testSimpleMessage()" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                        📝 Test Simple Message
                    </button>
                    <button onclick="testAdaptiveCard()" class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
                        🎴 Test Adaptive Card
                    </button>
                    <button onclick="testTaskNotification()" class="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded">
                        📋 Test Task Notification
                    </button>
                    <button onclick="testAll()" class="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded">
                        🧪 Test All Types
                    </button>
                </div>
            </div>

            <!-- Custom Message Section -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Send Custom Message</h2>
                <div class="space-y-4">
                    <div>
                        <label for="customMessage" class="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                        <textarea id="customMessage" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your custom message here..."></textarea>
                    </div>
                    <button onclick="testCustomMessage()" class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded">
                        📤 Send Custom Message
                    </button>
                </div>
            </div>

            <!-- Results Section -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4">Test Results</h2>
                <div id="results" class="space-y-2">
                    <p class="text-gray-500">Click a test button above to see results here...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showResult(message, isSuccess = true) {
            const resultsDiv = document.getElementById('results');
            const resultElement = document.createElement('div');
            resultElement.className = `p-3 rounded ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
            resultElement.innerHTML = `
                <div class="flex items-center">
                    <span class="mr-2">${isSuccess ? '✅' : '❌'}</span>
                    <span>${message}</span>
                    <span class="ml-auto text-xs text-gray-500">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
            resultsDiv.insertBefore(resultElement, resultsDiv.firstChild);
        }

        async function makeRequest(url, data = null) {
            try {
                const response = await axios.post(url, data);
                return response.data;
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.error || error.message
                };
            }
        }

        async function testSimpleMessage() {
            showResult('Sending simple message...', true);
            const result = await makeRequest('{{ route("teams.test.simple") }}');
            showResult(result.message, result.success);
        }

        async function testAdaptiveCard() {
            showResult('Sending adaptive card...', true);
            const result = await makeRequest('{{ route("teams.test.card") }}');
            showResult(result.message, result.success);
        }

        async function testTaskNotification() {
            showResult('Sending task notification...', true);
            const result = await makeRequest('{{ route("teams.test.task") }}');
            showResult(result.message, result.success);
        }

        async function testCustomMessage() {
            const message = document.getElementById('customMessage').value.trim();
            if (!message) {
                showResult('Please enter a message first', false);
                return;
            }

            showResult('Sending custom message...', true);
            const result = await makeRequest('{{ route("teams.test.custom") }}', { message });
            showResult(result.message, result.success);
        }

        async function testAll() {
            showResult('Starting comprehensive test...', true);
            
            // Test simple message
            await testSimpleMessage();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test adaptive card
            await testAdaptiveCard();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test task notification
            await testTaskNotification();
            
            showResult('Comprehensive test completed!', true);
        }
    </script>
</body>
</html> 