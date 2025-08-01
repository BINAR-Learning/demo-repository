<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\TeamsIntegrationSetting;
use Illuminate\Console\Command;

class SetupProjectTeamsWebhook extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'teams:setup-project-webhook 
                            {project : The project name or ID}
                            {webhook-url : The Teams workflow webhook URL}
                            {--channel= : The Teams channel name (optional)}
                            {--active : Set as active (default: true)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup Teams webhook for a specific project';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projectIdentifier = $this->argument('project');
        $webhookUrl = $this->argument('webhook-url');
        $channelName = $this->option('channel');
        $isActive = $this->option('active') ?? true;

        // Find the project
        $project = $this->findProject($projectIdentifier);
        
        if (!$project) {
            $this->error("Project not found: {$projectIdentifier}");
            return 1;
        }

        // Check if webhook already exists for this project
        $existingWebhook = TeamsIntegrationSetting::where('project_id', $project->id)->first();
        
        if ($existingWebhook) {
            if (!$this->confirm("Webhook already exists for project '{$project->name}'. Do you want to update it?")) {
                $this->info('Operation cancelled.');
                return 0;
            }
            
            $existingWebhook->update([
                'workflow_webhook_url' => $webhookUrl,
                'channel_name' => $channelName,
                'is_active' => $isActive,
            ]);
            
            $this->info("✅ Updated Teams webhook for project: {$project->name}");
        } else {
            // Create new webhook
            TeamsIntegrationSetting::create([
                'project_id' => $project->id,
                'workflow_webhook_url' => $webhookUrl,
                'channel_name' => $channelName,
                'is_active' => $isActive,
            ]);
            
            $this->info("✅ Created Teams webhook for project: {$project->name}");
        }

        // Display the configuration
        $this->newLine();
        $this->info('Configuration Details:');
        $this->table(
            ['Property', 'Value'],
            [
                ['Project', $project->name],
                ['Project ID', $project->id],
                ['Webhook URL', $webhookUrl],
                ['Channel', $channelName ?: 'Not specified'],
                ['Active', $isActive ? 'Yes' : 'No'],
            ]
        );

        return 0;
    }

    /**
     * Find project by name or ID
     */
    protected function findProject(string $identifier): ?Project
    {
        // Try to find by ID first
        if (is_numeric($identifier)) {
            $project = Project::find($identifier);
            if ($project) {
                return $project;
            }
        }

        // Try to find by name
        return Project::where('name', 'like', "%{$identifier}%")->first();
    }
} 