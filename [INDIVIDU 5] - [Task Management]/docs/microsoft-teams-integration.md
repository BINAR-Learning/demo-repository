## Background
This application is a project management app with kanban board to manage all the status of the task. It relates with assignee and project status. Currently, the user of the app has a Microsoft Teams license in one company. From that information, I want to make any changes of the task will integrate with Microsoft Teams to create notification to user or channel.

## Development Detail

### Overview
The Microsoft Teams integration will provide real-time notifications for task-related activities using **Microsoft Teams Workflows** (the replacement for deprecated incoming webhooks). This approach allows us to send notifications to Teams channels without requiring Microsoft Graph API access or special licenses.

### Key Features
1. **Task Status Change Notifications** - Notify when task status changes (To Do → In Progress → Review → Done)
2. **Assignee Change Notifications** - Notify when a task is assigned or reassigned
3. **Due Date Notifications** - Alert users about upcoming or overdue tasks
4. **Comment Notifications** - Notify when new comments are added to tasks
5. **Project Channel Integration** - Send notifications to project-specific Teams channels
6. **User Mention Support** - Mention specific users in notifications using @username
7. **Rich Card Notifications** - Use Teams adaptive cards for better visual presentation

### Technical Architecture

#### 1. Database Schema Extensions
```sql
-- Teams integration settings table
CREATE TABLE teams_integration_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    workflow_webhook_url VARCHAR(500) NOT NULL,
    channel_name VARCHAR(255),
    team_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    notification_types JSON,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Project Teams mapping table
CREATE TABLE project_teams_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    workflow_webhook_url VARCHAR(500) NOT NULL,
    channel_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Teams notification logs table
CREATE TABLE teams_notification_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    notification_type VARCHAR(100),
    workflow_run_id VARCHAR(255),
    status ENUM('pending', 'sent', 'failed'),
    error_message TEXT,
    payload JSON,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 2. Configuration Structure
```php
// config/teams.php
return [
    'enabled' => env('TEAMS_INTEGRATION_ENABLED', false),
    'workflow_webhook_url' => env('TEAMS_WORKFLOW_WEBHOOK_URL'),
    'default_channel' => env('TEAMS_DEFAULT_CHANNEL', 'general'),
    'notification_types' => [
        'task_created' => true,
        'task_updated' => true,
        'task_assigned' => true,
        'task_completed' => true,
        'task_commented' => true,
        'task_overdue' => true,
    ],
    'retry_attempts' => 3,
    'timeout' => 30,
    'rate_limit' => [
        'max_requests' => 100,
        'per_minutes' => 1,
    ],
];
```

#### 3. Service Layer Architecture

**TeamsWorkflowService**
- Handle workflow webhook message formatting
- Manage adaptive card creation
- Handle message sending and retry logic
- Log notification activities
- Implement rate limiting

**TeamsIntegrationService**
- Orchestrate notification logic
- Determine notification recipients
- Handle different notification types
- Manage integration settings
- Route notifications to appropriate channels

**TeamsNotificationFormatter**
- Format messages for different notification types
- Create adaptive card payloads
- Handle user mentions and formatting
- Generate rich text messages

#### 4. Event-Driven Architecture
```php
// Events
TaskCreated::class
TaskUpdated::class
TaskAssigned::class
TaskCompleted::class
TaskCommented::class
TaskOverdue::class

// Listeners
SendTeamsTaskNotification::class
SendTeamsAssignmentNotification::class
SendTeamsCommentNotification::class
SendTeamsOverdueNotification::class
```

### Implementation Plan

#### Phase 1: Foundation Setup (Week 1-2)
1. **Database Migrations**
   - Create teams_integration_settings table
   - Create project_teams_mapping table
   - Create teams_notification_logs table

2. **Configuration Setup**
   - Create teams.php config file
   - Add environment variables
   - Set up Teams workflow webhooks

3. **Basic Service Classes**
   - TeamsWorkflowService
   - TeamsIntegrationService
   - TeamsNotificationFormatter

#### Phase 2: Core Integration (Week 3-4)
1. **Workflow Implementation**
   - Implement workflow webhook message sending
   - Create adaptive card templates
   - Add retry mechanism and rate limiting

2. **Event System Integration**
   - Extend TaskObserver to dispatch events
   - Create event classes
   - Implement event listeners

3. **Basic Notifications**
   - Task status change notifications
   - Task assignment notifications
   - Simple text-based messages

#### Phase 3: Advanced Features (Week 5-6)
1. **Rich Notifications**
   - Implement adaptive cards
   - Add action buttons (View Task, Mark Complete)
   - Include task details and attachments

2. **Channel Management**
   - Project-specific channel notifications
   - Multi-channel support
   - Channel mapping interface

3. **Advanced Features**
   - User mention functionality
   - Overdue task notifications
   - Comment notifications

#### Phase 4: Enhancement & Testing (Week 7-8)
1. **Advanced Features**
   - Bulk notifications
   - Notification preferences
   - Custom message templates

2. **Error Handling & Logging**
   - Comprehensive error handling
   - Notification delivery tracking
   - Performance monitoring

3. **Testing & Documentation**
   - Unit tests for services
   - Integration tests
   - User documentation

### File Structure
```
src/
├── app/
│   ├── Events/
│   │   ├── TaskCreated.php
│   │   ├── TaskUpdated.php
│   │   ├── TaskAssigned.php
│   │   ├── TaskCompleted.php
│   │   ├── TaskCommented.php
│   │   └── TaskOverdue.php
│   ├── Listeners/
│   │   ├── SendTeamsTaskNotification.php
│   │   ├── SendTeamsAssignmentNotification.php
│   │   ├── SendTeamsCommentNotification.php
│   │   └── SendTeamsOverdueNotification.php
│   ├── Models/
│   │   ├── TeamsIntegrationSetting.php
│   │   ├── ProjectTeamsMapping.php
│   │   └── TeamsNotificationLog.php
│   ├── Services/
│   │   ├── TeamsWorkflowService.php
│   │   ├── TeamsIntegrationService.php
│   │   └── TeamsNotificationFormatter.php
│   └── Filament/
│       └── Resources/
│           ├── TeamsIntegrationSettingResource.php
│           └── ProjectTeamsMappingResource.php
├── config/
│   └── teams.php
├── database/
│   └── migrations/
│       ├── create_teams_integration_settings_table.php
│       ├── create_project_teams_mapping_table.php
│       └── create_teams_notification_logs_table.php
└── tests/
    └── Feature/
        └── TeamsIntegrationTest.php
```

### Environment Variables
```env
# Teams Integration
TEAMS_INTEGRATION_ENABLED=true
TEAMS_WORKFLOW_WEBHOOK_URL=https://company.webhook.office.com/webhookb2/...
TEAMS_DEFAULT_CHANNEL=general
```

### Microsoft Teams Workflow Setup

#### Step 1: Create Teams Workflow
1. **Access Power Automate**
   - Go to https://make.powerautomate.com
   - Sign in with your Microsoft 365 account

2. **Create New Workflow**
   - Click "Create" → "Automated cloud flow"
   - Choose "When a HTTP request is received" as trigger

3. **Configure HTTP Trigger**
   ```json
   {
     "type": "object",
     "properties": {
       "message": {
         "type": "string"
       },
       "channel": {
         "type": "string"
       },
       "card": {
         "type": "object"
       }
     }
   }
   ```

4. **Add Teams Action**
   - Add "Post a message" action
   - Configure to post to specified channel
   - Use dynamic content from HTTP request

#### Step 2: Get Webhook URL
1. **Test the Workflow**
   - Click "Test" in Power Automate
   - Copy the HTTP POST URL
   - This is your workflow webhook URL

#### Step 3: Configure in Application
1. **Set Environment Variable**
   ```env
   TEAMS_WORKFLOW_WEBHOOK_URL=https://prod-xxx.region.logic.azure.com:443/workflows/...
   ```

### Security Considerations
1. **Webhook Security** - Validate workflow URLs and implement signature verification
2. **Rate Limiting** - Implement rate limiting to prevent API abuse
3. **Data Privacy** - Ensure only necessary data is sent to Teams
4. **Access Control** - Implement proper authorization for Teams integration settings
5. **Workflow Permissions** - Ensure workflow has proper permissions to post to channels

### Monitoring & Analytics
1. **Notification Delivery Tracking** - Monitor success/failure rates
2. **Performance Metrics** - Track API response times
3. **Error Logging** - Comprehensive error tracking and alerting
4. **Usage Analytics** - Track notification types and frequency

## Development Step

### Step 1: Environment Setup
1. Create Microsoft Teams workflow in Power Automate
2. Configure workflow webhook URLs for target channels
3. Set up environment variables
4. Install required dependencies (only HTTP client needed)

### Step 2: Database Implementation
1. Create migration files for new tables
2. Implement Eloquent models with relationships
3. Add model observers and events
4. Create database seeders for testing

### Step 3: Service Layer Development
1. Implement TeamsWorkflowService with webhook functionality
2. Create TeamsIntegrationService for orchestration
3. Develop TeamsNotificationFormatter for message formatting
4. Add comprehensive error handling and logging

### Step 4: Event System Integration
1. Extend existing TaskObserver to dispatch events
2. Create event classes for different task activities
3. Implement event listeners for Teams notifications
4. Test event-driven notification flow

### Step 5: UI/UX Implementation
1. Create Filament resources for Teams settings management
2. Implement project Teams mapping interface
3. Add notification preferences and controls
4. Create notification preview functionality

### Step 6: Testing & Deployment
1. Write comprehensive unit and integration tests
2. Perform end-to-end testing with Teams workflows
3. Create deployment documentation
4. Monitor and optimize performance

### Step 7: Documentation & Training
1. Create user documentation
2. Develop admin configuration guide
3. Provide troubleshooting documentation
4. Conduct user training sessions