<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Tabs --}}
        <div class="shadow">
            <div class="border-b border-gray-200">
                <nav class="flex -mb-px" aria-label="Tabs">
                    <button id="projectDashboardTab" class="w-1/2 py-4 px-1 text-center border-b-2 border-primary-500 font-medium text-sm text-primary-600 flex items-center justify-center gap-2" aria-current="page">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Project Dashboard
                    </button>
                    <button id="shareDashboardTab" class="w-1/2 py-4 px-1 text-center border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" />
                        </svg>
                        Share Dashboard
                    </button>
                </nav>
            </div>
        </div>

        {{-- Project Dashboard Content --}}
        <div id="projectDashboardContent" style="margin-top: 0px;">
            {{-- Project Filter --}}
            <div class="shadow mb-4">
                <div class="p-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-base font-medium text-gray-900">Project Filter</h2>
                        <div class="w-64">
                            <form id="projectFilterForm" class="flex items-center gap-2">
                                <select id="projectSelect" class="w-full dark:bg-gray-800" style="border: 1px solid #ececec; border-radius: 5px; padding: 5px;">
                                    <option value="">Select Project</option>
                                    @foreach ($this->getProjects() as $project)
                                        <option value="{{ $project->id }}" {{ $selectedProject == $project->id ? 'selected' : '' }}>{{ $project->name }}</option>
                                    @endforeach
                                </select>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {{-- No Project Selected Message --}}
            <div id="noProjectSelectedMessage" class="shadow p-8 text-center" style="padding: 40px;">
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
                <p class="text-gray-500">Please select a project to view the dashboard.</p>
            </div>

            {{-- Dashboard Content (hidden by default) --}}
            <div id="projectDashboardData" class="hidden">
                {{-- Main Content Top Flex Layout --}}
                <div class="flex flex-col lg:flex-row gap-4">
                    {{-- Task Statistics by Label (left, 1/3) --}}
                    <div class="w-full lg:w-2/3">
                        <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                            Task Statistics by Label
                        </div>
                        <div class="rounded-b shadow relative" style="min-height: 300px; max-height: 300px; overflow-y: auto;">
                            <div class="p-4">
                                <div id="taskStatisticsLoading" class="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10" style="display: flex;">
                                    <span class="text-sm text-gray-600">Loading ...</span>
                                </div>
                                <div class="mb-4" style="height: 250px;">
                                    <canvas id="taskStatisticsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- 2x2 Chart Flex Grid (right, 1/3) --}}
                    <div class="w-full lg:w-1/3 flex flex-col gap-4">
                        <div class="flex gap-4">
                            <div class="flex-1">
                                <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                                    Task Composition
                                </div>
                                <div class="rounded-b shadow flex flex-col items-center justify-center p-2 relative" style="min-height: 300px; max-height: 300px; overflow-y: auto;">
                                    <div id="taskCompositionLoading" class="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10" style="display: flex;">
                                        <span class="text-sm text-gray-600">Loading ...</span>
                                    </div>
                                    <div id="projectProgress" class="text-xs text-gray-700 font-semibold mb-2">
                                        Loading ...
                                    </div>
                                    <div class="mb-2" style="width: 200px; height: 200px;">
                                        <canvas id="taskCompositionChart"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-1">
                                {{-- Task by Priority --}}
                                <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                                    Task by Priority
                                </div>
                                <div class="rounded-b shadow flex flex-col items-center justify-center p-2 relative" style="min-height: 300px; max-height: 300px; overflow-y: auto;">
                                    <div id="taskPriorityLoading" class="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10" style="display: flex;">
                                        <span class="text-sm text-gray-600">Loading ...</span>
                                    </div>
                                    <div class="mb-2" style="width: 200px; height: 200px;">
                                        <canvas id="taskPriorityChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col lg:flex-row gap-4" style="margin-top: 20px;">
                    <div class="w-full">
                        {{-- Member Task Distribution --}}
                        <div class=" shadow">
                            <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                                Member Task Distribution
                            </div>
                            <div class="rounded-b shadow flex flex-col items-center justify-center p-2 relative" style="min-height: 300px; max-height: 300px; overflow-y: auto;">
                                <div id="memberTaskDistributionLoading" class="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10" style="display: flex;">
                                    <span class="text-sm text-gray-600">Loading ...</span>
                                </div>
                                <canvas id="memberTaskStackedChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="w-full">
                        <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                            Member Task Completion
                        </div>
                        <div class="rounded-b shadow flex flex-col items-center justify-center p-2 relative" style="min-height: 300px; max-height: 300px; overflow-y: auto;">
                            <div id="memberTaskCompletionLoading" class="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10" style="display: flex;">
                                <span class="text-sm text-gray-600">Loading ...</span>
                            </div>
                            <div class="w-full" style="height: 250px; width: 500px;">
                                <canvas id="memberTaskBarChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col lg:flex-row gap-4" style="margin-top: 20px;">
                    <div class="w-full">
                        {{-- Monthly Completed Tasks Statistics --}}
                        <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                            Monthly Completed Tasks
                        </div>
                        <div class="rounded-b shadow flex flex-col items-center justify-center p-2 relative" style="min-height: 320px; max-height: 320px; overflow-y: auto;">
                            <div id="monthlyCompletedTasksLoading" class="absolute inset-0 flex items-center justify-center bg-opacity-75 z-10" style="display: flex;">
                                <span class="text-sm text-gray-600">Loading ...</span>
                            </div>
                            <div class="w-full" style="height: 300px;">
                                <canvas id="monthlyCompletedTasksChart" class="w-full h-full"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="w-full">
                        {{-- Completed Tasks --}}
                        <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                            Recently Completed Tasks
                        </div>
                        <div class="shadow" style="min-height: 320px; max-height: 320px; overflow-y: auto;">
                            <div class="p-4">
                                <div class="overflow-x-auto" style="padding: 10px;">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="border-b">
                                                <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Task</th>
                                                <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Assignee</th>
                                                <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Completed</th>
                                                <th class="text-left py-1.5 px-2 w-20 text-xs font-medium text-gray-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="recentlyCompletedTasks">
                                            <tr>
                                                <td colspan="4" class="text-center py-2 text-xs text-gray-500">
                                                    Loading...
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Overdue Tasks --}}
                <div class="shadow" style="margin-top: 20px;">
                    <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                        Overdue Tasks
                    </div>
                    <div class="overflow-x-auto" style="padding: 20px;">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-1.5 px-2 w-24 text-xs font-medium text-gray-500">Label</th>
                                    <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Task</th>
                                    <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Assignee</th>
                                    <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Overdue</th>
                                    <th class="text-left py-1.5 px-2 w-20 text-xs font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody id="overdueTasks">
                                <tr>
                                    <td colspan="5" class="text-center py-2 text-xs text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {{-- Share Dashboard Content --}}
        <div id="shareDashboardContent" class="hidden">
            {{-- Shared Tasks Table --}}
            <div class="shadow">
                <div class="px-4 py-2 rounded-t font-semibold text-gray-800 border-b w-full text-center">
                    Shared Tasks
                </div>
                <div class="overflow-x-auto" style="padding: 20px;">
                    <table class="w-full table-bordered">
                        <thead>
                            <tr class="border-b">
                                <th class="text-left py-1.5 px-2 w-24 text-xs font-medium text-gray-500">Label</th>
                                <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Task</th>
                                <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Assignee</th>
                                <th class="text-left py-1.5 px-2 text-xs font-medium text-gray-500">Due Date</th>
                                <th style="width: 40%;" class="text-left py-1.5 px-2 w-32 text-xs font-medium text-gray-500">Project</th>
                            </tr>
                        </thead>
                        <tbody id="sharedTasks">
                            <tr>
                                <td colspan="5" class="text-center py-2 text-xs text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>

@push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <script>
        let chart = null;
        let memberTaskBarChart = null;
        let taskStatisticsChart = null;
        let taskPriorityChart = null;
        let monthlyCompletedTasksChart = null;
        let memberTaskStackedChart = null;

        // Add event listener for project select change
        document.getElementById('projectSelect').addEventListener('change', function() {
            const projectId = this.value;
            const dashboardData = document.getElementById('projectDashboardData');
            const noProjectMessage = document.getElementById('noProjectSelectedMessage');

            if (projectId) {
                dashboardData.classList.remove('hidden');
                noProjectMessage.classList.add('hidden');
                renderAllCharts();
            } else {
                dashboardData.classList.add('hidden');
                noProjectMessage.classList.remove('hidden');
            }
        });

        // Add tab switching functionality
        document.getElementById('projectDashboardTab').addEventListener('click', function() {
            document.getElementById('shareDashboardContent').classList.add('hidden');
            document.getElementById('projectDashboardContent').classList.remove('hidden');
            this.classList.add('border-primary-500', 'text-primary-600');
            this.classList.remove('border-transparent', 'text-gray-500');
            document.getElementById('shareDashboardTab').classList.remove('border-primary-500', 'text-primary-600');
            document.getElementById('shareDashboardTab').classList.add('border-transparent', 'text-gray-500');

            const projectId = document.getElementById('projectSelect').value;
            if (projectId) {
                renderAllCharts();
            }
        });

        document.getElementById('shareDashboardTab').addEventListener('click', function() {
            document.getElementById('projectDashboardContent').classList.add('hidden');
            document.getElementById('shareDashboardContent').classList.remove('hidden');
            this.classList.add('border-primary-500', 'text-primary-600');
            this.classList.remove('border-transparent', 'text-gray-500');
            document.getElementById('projectDashboardTab').classList.remove('border-primary-500', 'text-primary-600');
            document.getElementById('projectDashboardTab').classList.add('border-transparent', 'text-gray-500');

            loadSharedTasks();
        });

        // Initialize dashboard state
        document.addEventListener('DOMContentLoaded', function() {
            const projectId = document.getElementById('projectSelect').value;

            if (!projectId) {
                document.getElementById('projectDashboardData').classList.add('hidden');
                document.getElementById('noProjectSelectedMessage').classList.remove('hidden');
            }
        });

        function renderAllCharts() {
            renderChart();
            renderMemberTaskBarChart();
            renderTaskStatisticsChart();
            renderTaskPriorityChart();
            renderMonthlyCompletedTasksChart();
            renderMemberTaskDistributionChart();
            loadRecentlyCompletedTasks();
            loadOverdueTasks();
        }

        function showLoading(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'flex';
                element.style.opacity = '1';
            }
        }

        function hideLoading(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'none';
                element.style.opacity = '0';
            }
        }

        function renderChart() {
            console.log('renderChart called');
            const canvas = document.getElementById('taskCompositionChart');
            if (!canvas) {
                console.log('Canvas not found');
                return;
            }
            const ctx = canvas.getContext('2d');
            if (chart) chart.destroy();

            showLoading('taskCompositionLoading');
            const projectId = document.getElementById('projectSelect').value;

            // Get data from API
            fetch(`/api/task-stats?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Chart data:', data);
                    hideLoading('taskCompositionLoading');

                    // Update project progress text
                    const totalTasks = data.total;
                    const completedTasks = data.completed;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                    document.getElementById('projectProgress').textContent = 
                        `Project progress: ${progress}%, ${completedTasks} of ${totalTasks} tasks completed`;

            chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Active Tasks', 'Completed Tasks'],
                    datasets: [{
                                data: [data.active, data.completed],
                        backgroundColor: [
                            '#6366f1', // Active
                            '#22c55e' // Completed
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            formatter: function(value) {
                                return value > 0 ? value : '';
                            }
                        }
                    },
                    cutout: '60%'
                },
                plugins: [ChartDataLabels]
            });
                    console.log('Chart rendered successfully');
                })
                .catch(error => {
                    console.error('Error fetching task stats:', error);
                    hideLoading('taskCompositionLoading');
                    document.getElementById('projectProgress').textContent = 
                        'Error loading project progress';
                });
        }

        function renderMemberTaskBarChart() {
            const barCanvas = document.getElementById('memberTaskBarChart');
            if (!barCanvas) return;
            const barCtx = barCanvas.getContext('2d');
            if (memberTaskBarChart) memberTaskBarChart.destroy();

            showLoading('memberTaskCompletionLoading');
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID for Member Task Completion:', projectId);

            // Get data from API
            fetch(`/api/member-task-completion?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Member Task Completion data:', data);
                hideLoading('memberTaskCompletionLoading');

                const labels = data.map(member => member.name);
                const completedData = data.map(member => member.completed);
                const totalData = data.map(member => member.total);

            memberTaskBarChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                        labels: labels,
                    datasets: [{
                            label: 'Completed',
                                data: completedData,
                            backgroundColor: '#22c55e'
                        },
                        {
                            label: 'Total',
                                data: totalData,
                            backgroundColor: '#6366f1'
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            formatter: function(value) {
                                return value > 0 ? value : '';
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                },
                plugins: [ChartDataLabels]
                });
            })
            .catch(error => {
                console.error('Error fetching member task completion:', error);
                hideLoading('memberTaskCompletionLoading');
            });
        }

        function renderTaskStatisticsChart() {
            const canvas = document.getElementById('taskStatisticsChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (taskStatisticsChart) taskStatisticsChart.destroy();

            showLoading('taskStatisticsLoading');
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID:', projectId);

            // Get data from API
            fetch(`/api/task-stats-by-label?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task Statistics Chart data:', data);
                hideLoading('taskStatisticsLoading');

                const labelNames = data.map(item => item.name);
                const activeTasks = data.map(item => item.active_tasks);
                const overdueTasks = data.map(item => item.overdue_tasks);

            taskStatisticsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                        labels: labelNames,
                    datasets: [{
                            label: 'Active Tasks',
                                data: activeTasks,
                            backgroundColor: '#6366f1',
                        },
                        {
                            label: 'Overdue Tasks',
                                data: overdueTasks,
                            backgroundColor: '#ef4444',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            formatter: function(value) {
                                return value > 0 ? value : '';
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
                });
            })
            .catch(error => {
                console.error('Error fetching task statistics:', error);
                hideLoading('taskStatisticsLoading');
            });
        }

        function renderTaskPriorityChart() {
            const canvas = document.getElementById('taskPriorityChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (taskPriorityChart) taskPriorityChart.destroy();

            showLoading('taskPriorityLoading');
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID for Priority Chart:', projectId);

            // Get data from API
            fetch(`/api/task-stats-by-priority?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task Priority Chart data:', data);
                hideLoading('taskPriorityLoading');

                const priorityLabels = ['High', 'Medium', 'Low', 'None'];
                const priorityData = [
                    data.high || 0,
                    data.medium || 0,
                    data.low || 0,
                    data.none || 0
                ];
                const priorityColors = ['#ef4444', '#facc15', '#22c55e', '#9ca3af'];

            taskPriorityChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                        labels: priorityLabels,
                    datasets: [{
                            data: priorityData,
                            backgroundColor: priorityColors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            formatter: function(value) {
                                return value > 0 ? value : '';
                            }
                        }
                    },
                    cutout: '60%'
                },
                plugins: [ChartDataLabels]
                });
            })
            .catch(error => {
                console.error('Error fetching task priority stats:', error);
                hideLoading('taskPriorityLoading');
            });
        }

        function renderMonthlyCompletedTasksChart() {
            const canvas = document.getElementById('monthlyCompletedTasksChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (monthlyCompletedTasksChart) monthlyCompletedTasksChart.destroy();

            showLoading('monthlyCompletedTasksLoading');
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID for Monthly Tasks:', projectId);

            // Get data from API
            fetch(`/api/monthly-completed-tasks?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Monthly Completed Tasks data:', data);
                hideLoading('monthlyCompletedTasksLoading');

                // Get all unique member names
                const allMembers = new Set();
                data.forEach(month => {
                    month.members.forEach(member => {
                        allMembers.add(member.user.name);
                    });
                });
                const memberNames = Array.from(allMembers);

                // Prepare datasets for each member
                const colors = ['#6366f1', '#22c55e', '#f59e42', '#ef4444', '#3b82f6', '#a21caf', '#facc15', '#9ca3af'];
                const memberDatasets = memberNames.map((memberName, index) => {
                    const memberData = data.map(month => {
                        const member = month.members.find(m => m.user.name === memberName);
                        return member ? member.count : 0;
                    });

                    return {
                        label: memberName,
                        data: memberData,
                        backgroundColor: colors[index % colors.length],
                        stack: 'members',
                        type: 'bar',
                        barPercentage: 0.7,
                        categoryPercentage: 0.7,
                    };
                });

                // Calculate baseline
                const totalCompleted = data.reduce((sum, month) => sum + month.total, 0);
                const monthCount = data.length;
                const baseline = monthCount > 0 ? Math.round(totalCompleted / monthCount * 100) / 100 : 0;
                const baselineData = Array(monthCount).fill(baseline);

            monthlyCompletedTasksChart = new Chart(ctx, {
                type: 'bar',
                data: {
                        labels: data.map(month => month.month),
                    datasets: [
                            ...memberDatasets,
                        {
                            label: 'Baseline',
                                data: baselineData,
                            type: 'line',
                            borderColor: '#222',
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false,
                            order: 99,
                            tension: 0.2,
                            borderDash: [6, 6],
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            formatter: function(value) {
                                return value > 0 ? value : '';
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
            })
            .catch(error => {
                console.error('Error fetching monthly completed tasks:', error);
                hideLoading('monthlyCompletedTasksLoading');
            });
        }

        function renderMemberTaskDistributionChart() {
            const stackedCanvas = document.getElementById('memberTaskStackedChart');
            if (!stackedCanvas) return;
                const stackedCtx = stackedCanvas.getContext('2d');
            if (memberTaskStackedChart) memberTaskStackedChart.destroy();

            showLoading('memberTaskDistributionLoading');
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID for Member Distribution:', projectId);

            // Get data from API
            fetch(`/api/member-task-distribution?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Member Task Distribution data:', data);
                hideLoading('memberTaskDistributionLoading');

                const memberNames = data.members.map(member => member.name);
                const datasets = data.labels.map(label => {
                    return {
                        label: label.name,
                        data: data.members.map(member => member.task_counts[label.name] || 0),
                        backgroundColor: label.color
                    };
                });

                memberTaskStackedChart = new Chart(stackedCtx, {
                    type: 'bar',
                    data: {
                        labels: memberNames,
                        datasets: datasets
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            datalabels: {
                                color: '#fff',
                                font: {
                                    weight: 'bold',
                                    size: 11
                                },
                                formatter: function(value) {
                                    return value > 0 ? value : '';
                                }
                            }
                        },
                        scales: {
                            x: {
                                stacked: true,
                                beginAtZero: true
                            },
                            y: {
                                stacked: true
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            })
            .catch(error => {
                console.error('Error fetching member task distribution:', error);
                hideLoading('memberTaskDistributionLoading');
            });
        }

        function loadRecentlyCompletedTasks() {
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID for Recently Completed Tasks:', projectId);

            const tbody = document.getElementById('recentlyCompletedTasks');
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-2 text-xs text-gray-500">Loading...</td></tr>';

            // Get data from API
            fetch(`/api/recently-completed-tasks?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(tasks => {
                console.log('Recently Completed Tasks data:', tasks);

                if (tasks.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-2 text-xs text-gray-500">No completed tasks found</td></tr>';
                    return;
                }

                tbody.innerHTML = tasks.map(task => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-1.5 px-2">
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs font-medium text-gray-900 line-through">${task.title}</span>
                            </div>
                        </td>
                        <td class="py-1.5 px-2">
                            ${task.assignee ? `
                                <div class="flex items-center gap-1.5">
                                    <span class="ml-2 text-sm" style="font-size: 12px;">${task.assignee.name}</span>
                                </div>
                            ` : ''}
                        </td>
                        <td class="py-1.5 px-2">
                            <span class="text-xs text-gray-500">${task.completed_at}</span>
                        </td>
                        <td class="py-1.5 px-2">
                            <button onclick="window.location.href='/admin/tasks/${task.id}'" class="inline-flex items-center justify-center py-1 px-2 text-xs font-medium text-white bg-primary-600  hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                View
                            </button>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(error => {
                console.error('Error fetching recently completed tasks:', error);
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-2 text-xs text-gray-500">Error loading tasks</td></tr>';
            });
        }

        function loadOverdueTasks() {
            const projectId = document.getElementById('projectSelect').value;
            console.log('Project ID for Overdue Tasks:', projectId);

            const tbody = document.getElementById('overdueTasks');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2 text-xs text-gray-500">Loading...</td></tr>';

            // Get data from API
            fetch(`/api/overdue-tasks?project_id=${projectId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(tasks => {
                console.log('Overdue Tasks data:', tasks);

                if (tasks.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2 text-xs text-gray-500">No overdue tasks found</td></tr>';
                    return;
                }

                tbody.innerHTML = tasks.map(task => `
                    <tr class="border-b hover:bg-red-50">
                        <td class="py-1.5 px-2">
                            ${task.label ? `
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                                    style="background-color: ${task.label.color}; color: white;">
                                    ${task.label.name}
                                </span>
                            ` : ''}
                        </td>
                        <td class="py-1.5 px-2">
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs font-medium text-gray-900">${task.title}</span>
                                ${task.priority ? `
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                        ${task.priority === 'high' ? 'bg-danger-100 text-danger-800' : 
                                          task.priority === 'medium' ? 'bg-warning-100 text-warning-800' : 
                                          'bg-success-100 text-success-800'}">
                                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                ` : ''}
                            </div>
                        </td>
                        <td class="py-1.5 px-2">
                            ${task.assignee ? `
                                <div class="flex items-center gap-1.5">
                                    <span class="ml-2 text-sm" style="font-size: 12px;">${task.assignee.name}</span>
                                </div>
                            ` : ''}
                        </td>
                        <td class="py-1.5 px-2">
                            <span class="text-xs font-medium text-danger-600">${task.due_date}</span>
                        </td>
                        <td class="py-1.5 px-2">
                            <button onclick="window.location.href='/admin/tasks/${task.id}'" 
                                class="inline-flex items-center justify-center py-1 px-2 text-xs font-medium text-white bg-primary-600  hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                View
                            </button>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(error => {
                console.error('Error fetching overdue tasks:', error);
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2 text-xs text-gray-500">Error loading tasks</td></tr>';
            });
        }

        function loadSharedTasks() {
            const tbody = document.getElementById('sharedTasks');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2 text-xs text-gray-500">Loading...</td></tr>';

            fetch('/api/shared-tasks', {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(tasks => {
                if (Object.keys(tasks).length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2 text-xs text-gray-500">No shared tasks found</td></tr>';
                    return;
                }

                tbody.innerHTML = Object.values(tasks).map(task => `
                    <tr class="border-b">
                        <td class="py-1.5 px-2" style="width: 150px;">
                            ${task.label ? `
                                <span class="inline-flex items-center px-2 py-1 text-xs font-medium" 
                                    style="background-color: ${task.label.color}; color: white;">
                                    ${task.label.name}
                                </span>
                            ` : ''}
                        </td>
                        <td class="py-1.5 px-2">
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs font-medium text-gray-900">${task.title}</span>
                            </div>
                        </td>
                        <td class="py-1.5 px-2">
                            ${task.assignee ? `
                                <div class="flex items-center gap-1.5">
                                    <span class="ml-2 text-sm" style="font-size: 12px;">${task.assignee.name}</span>
                                </div>
                            ` : 'Unassigned'}
                        </td>
                        <td class="py-1.5 px-2">
                            <span class="text-xs text-gray-500">${task.due_date}</span>
                        </td>
                        <td class="py-1.5 px-2" style="width: 150px;">
                            ${task.project ? `
                                <div class="flex items-center gap-1.5">
                                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                                        ${task.project.name}
                                    </span>
                                </div>
                            ` : '<span class="text-xs text-gray-400">No Project</span>'}
                        </td>
                    </tr>
                `).join('');
            })
            .catch(error => {
                console.error('Error fetching shared tasks:', error);
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2 text-xs text-gray-500">Error loading shared tasks</td></tr>';
            });
        }

        // Hide all loaders initially
        document.addEventListener('DOMContentLoaded', function() {
            const loaders = [
                'taskStatisticsLoading',
                'taskCompositionLoading',
                'taskPriorityLoading',
                'memberTaskDistributionLoading',
                'memberTaskCompletionLoading',
                'monthlyCompletedTasksLoading'
            ];
            
            loaders.forEach(loaderId => {
                const loader = document.getElementById(loaderId);
                if (loader) {
                    loader.style.display = 'none';
                }
            });

            console.log('DOM Content Loaded');
            renderAllCharts();
        });
    </script>
@endpush
