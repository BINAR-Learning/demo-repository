# Project Management System

A comprehensive Laravel-based project management application with Kanban board, Microsoft Teams integration, LDAP authentication, and enterprise-ready deployment features.

## 📋 Application Overview

This is a modern project management system designed for enterprise environments, featuring:

- **Interactive Kanban Board** - Drag-and-drop task management with real-time updates
- **Multi-Authentication System** - LDAP/Active Directory, API-based, and standard authentication
- **Microsoft Teams Integration** - Real-time notifications for task updates and project activities
- **Role-Based Access Control** - Super admin, project managers, and team member roles
- **Enterprise Deployment** - Docker containerization with Kubernetes/OpenShift support
- **Comprehensive Admin Panel** - Filament-based interface for complete system management

## 🚀 Key Features

### 📊 Task Management
- **Kanban Board Interface** with drag-and-drop functionality
- **Task Status Tracking** (To Do, In Progress, Review, Done)
- **Task Assignment & Due Dates** with priority levels
- **File Attachments & Comments** on tasks
- **Custom Fields** for project-specific requirements
- **Excel Import/Export** for bulk task operations
- **Advanced Filtering** by project, assignee, priority, and custom criteria

### 🏢 Project Management
- **Project Creation & Management** with custom fields
- **Team Member Assignment** with role-based permissions
- **Project Timeline Tracking** with start and end dates
- **Project-specific Labels** for task categorization
- **Multi-project Support** for complex organizations

### 👥 User & Authentication Management
- **LDAP/Active Directory Integration** for enterprise authentication
- **Multi-domain Support** for complex directory structures
- **API-based Authentication** for external system integration
- **Role-based Permissions** using Filament Shield
- **User Impersonation** for administrative purposes

### 📢 Microsoft Teams Integration
- **Workflow-based Notifications** (replacing deprecated webhooks)
- **Task Status Change Alerts** sent to appropriate Teams channels
- **Assignment Notifications** with user mentions
- **Due Date Reminders** for upcoming deadlines
- **Rich Adaptive Cards** for enhanced visual presentation
- **Project-specific Channel Integration**

### 🛡️ Security & Compliance
- **Enterprise Authentication** via LDAP/AD
- **Role-based Access Control** with granular permissions
- **Audit Logging** for all system activities
- **Secure API Endpoints** with JWT authentication
- **Data Protection** with soft deletes and activity logging

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - Modern PHP framework
- **PHP 8.2+** - Latest PHP features and performance
- **MySQL/SQL Server** - Database with multi-driver support
- **Redis** - Caching and session management

### Frontend & Admin Panel
- **Filament 3.2** - Modern admin panel framework
- **Livewire** - Dynamic interface components
- **Alpine.js** - Lightweight JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework

### Authentication & Integration
- **LDAP Record** - Enterprise directory integration
- **Firebase JWT** - Secure token management
- **Microsoft Teams API** - Workflow notifications
- **Active Directory** - Enterprise user management

### DevOps & Deployment
- **Docker** - Containerization with Apache web server
- **Kubernetes/OpenShift** - Container orchestration
- **Multi-stage Builds** - Optimized container images
- **Health Checks** - Application monitoring

### Additional Libraries
- **PhpSpreadsheet** - Excel import/export functionality
- **Filament Shield** - Role and permission management
- **Filament Logger** - Activity and audit logging
- **Filament Excel** - Enhanced spreadsheet operations

## 📋 Prerequisites

- **Docker & Docker Compose** (for containerized development)
- **Git** - Version control
- **PHP 8.2+** & **Composer** (for local development)
- **Node.js & NPM** (for frontend assets)
- **LDAP Server** (for authentication, optional)
- **Microsoft Teams** (for notifications, optional)

## 🚀 Installation

### Option 1: Docker Development (Recommended)

1. **Clone the repository:**
```bash
git clone [your-repository-url]
cd project-management-system
```

2. **Copy and configure environment:**
```bash
cp src/.env.example src/.env
```

3. **Configure environment variables in `src/.env`:**
```env
APP_NAME="Project Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=project_management
DB_USERNAME=root
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# LDAP Configuration (optional)
LDAP_CONNECTION=default
LDAP_HOST=your-ldap-server.com
LDAP_USERNAME="CN=Service Account,OU=Service Accounts,DC=domain,DC=com"
LDAP_PASSWORD=your-ldap-password
LDAP_BASE_DN="DC=domain,DC=com"

# Microsoft Teams Integration (optional)
TEAMS_WEBHOOK_URL=your-teams-workflow-webhook-url
```

4. **Build and start containers:**
```bash
./build.sh  # or manually: docker build -t project-management:latest .
docker-compose up -d
```

5. **Install dependencies and setup:**
```bash
docker exec project-app composer install
docker exec project-app php artisan key:generate
docker exec project-app php artisan migrate
docker exec project-app php artisan db:seed
docker exec project-app npm install && npm run build
```

### Option 2: Local Development

1. **Install PHP dependencies:**
```bash
cd src
composer install
```

2. **Install frontend dependencies:**
```bash
npm install
npm run dev
```

3. **Setup application:**
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

4. **Start development server:**
```bash
php artisan serve
```

## 🌐 Accessing the Application

### Local Development
- **Main Application:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **API Endpoints:** http://localhost:8000/api

### Default Credentials
After seeding, you can log in with:
- **Username:** admin
- **Password:** password

## 🏗️ Application Architecture

### Directory Structure
```
project-management-system/
├── src/                          # Laravel application source
│   ├── app/
│   │   ├── Auth/                # Custom authentication providers
│   │   ├── Enums/               # Task status and other enumerations
│   │   ├── Filament/            # Admin panel resources and pages
│   │   │   ├── Pages/          # Custom Filament pages (Kanban, etc.)
│   │   │   ├── Resources/      # CRUD resources for all models
│   │   │   └── Widgets/        # Dashboard widgets
│   │   ├── Http/               # Controllers and middleware
│   │   ├── Livewire/           # Interactive components
│   │   ├── Models/             # Eloquent models
│   │   ├── Policies/           # Authorization policies
│   │   └── Services/           # Business logic services
│   ├── database/               # Migrations, seeders, factories
│   ├── resources/              # Views, CSS, JS assets
│   └── routes/                 # Web, API, console routes
├── manifest/                    # Kubernetes deployment manifests
├── resources/                   # Docker configuration files
├── scripts/                     # Deployment and utility scripts
├── Dockerfile                   # Container definition
└── docker-compose.yml          # Local development environment
```

### Database Schema
Key entities and relationships:
- **Users** - Authentication and profile management
- **Companies** - Organization structure
- **Projects** - Project definitions and settings
- **Tasks** - Individual work items with full lifecycle
- **Task Labels** - Status categories (customizable per project)
- **Project Members** - User-project relationships with roles
- **Custom Fields** - Flexible metadata for projects and tasks
- **Activity Logs** - Audit trail for all system actions

## 🔧 Development

### Running Commands

**Artisan commands:**
```bash
docker exec project-app php artisan [command]
```

**Composer operations:**
```bash
docker exec project-app composer [command]
```

**Frontend development:**
```bash
docker exec project-app npm run dev    # Development build
docker exec project-app npm run build  # Production build
```

### Database Operations

**Fresh migration with seeding:**
```bash
docker exec project-app php artisan migrate:fresh --seed
```

**Create new migration:**
```bash
docker exec project-app php artisan make:migration create_[table_name]
```

### Creating Filament Resources

```bash
docker exec project-app php artisan make:filament-resource [ModelName] --generate
```

## 🚀 Production Deployment

### Docker Production Build

```bash
# Build production image
./build.sh

# Tag for registry
docker tag project-management:latest your-registry.com/project-management:v1.0

# Push to registry
docker push your-registry.com/project-management:v1.0
```

### Kubernetes Deployment

1. **Configure secrets:**
```bash
# Generate environment secret
./scripts/generate-env-secret.sh

# Generate image pull secret (if using private registry)
./scripts/generate-docker-pull-secret.sh
```

2. **Deploy to Kubernetes:**
```bash
kubectl apply -f manifest/
```

3. **Verify deployment:**
```bash
kubectl get pods -l app=project
kubectl logs -f deployment/project
```

### Environment Configuration

**Production environment variables:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database (use managed service in production)
DB_CONNECTION=mysql
DB_HOST=your-production-db-host
DB_DATABASE=project_management_prod

# Security
APP_KEY=base64:your-32-character-secret-key

# Microsoft Teams
TEAMS_WEBHOOK_URL=https://your-tenant.webhook.office.com/...

# LDAP Production Settings
LDAP_HOST=your-production-ldap-server.com
LDAP_BASE_DN="DC=company,DC=com"
```

## 🔒 Security Configuration

### LDAP/Active Directory Setup

1. **Configure LDAP connection in `config/ldap.php`:**
```php
'connections' => [
    'default' => [
        'hosts' => [env('LDAP_HOST', 'your-dc.company.com')],
        'base_dn' => env('LDAP_BASE_DN', 'DC=company,DC=com'),
        'username' => env('LDAP_USERNAME'),
        'password' => env('LDAP_PASSWORD'),
    ],
],
```

2. **Test LDAP connection:**
```bash
docker exec project-app php artisan ldap:test
```

### Role and Permission Setup

The application uses Filament Shield for comprehensive role management:

- **Super Admin** - Full system access
- **Project Manager** - Manage assigned projects and teams
- **Team Member** - Access to assigned projects and tasks
- **Viewer** - Read-only access to permitted projects

## 📊 Monitoring and Maintenance

### Application Logs

```bash
# View application logs
docker exec project-app tail -f storage/logs/laravel.log

# View web server logs
docker logs project-app
```

### Database Maintenance

```bash
# Backup database
docker exec mysql mysqldump -u root -p project_management > backup.sql

# Optimize database
docker exec project-app php artisan db:optimize
```

### Performance Optimization

```bash
# Clear and cache configuration
docker exec project-app php artisan config:cache
docker exec project-app php artisan route:cache
docker exec project-app php artisan view:cache
```

## 🔧 Troubleshooting

### Common Issues

1. **LDAP Connection Issues**
   ```bash
   # Test LDAP connectivity
   docker exec project-app php artisan ldap:test
   
   # Check LDAP logs
   docker exec project-app tail -f storage/logs/ldap.log
   ```

2. **Microsoft Teams Integration**
   ```bash
   # Test Teams webhook
   curl -X POST "YOUR_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"text": "Test message"}'
   ```

3. **File Permission Issues**
   ```bash
   # Fix storage permissions
   docker exec project-app chmod -R 775 storage bootstrap/cache
   docker exec project-app chown -R www-data:www-data storage bootstrap/cache
   ```

4. **Database Connection Problems**
   ```bash
   # Check database connectivity
   docker exec project-app php artisan tinker
   >>> DB::connection()->getPdo();
   ```

### Performance Issues

1. **Enable query logging for debugging:**
   ```php
   // Add to AppServiceProvider::boot()
   DB::listen(function ($query) {
       Log::info($query->sql, $query->bindings);
   });
   ```

2. **Clear all caches:**
   ```bash
   docker exec project-app php artisan cache:clear
   docker exec project-app php artisan config:clear
   docker exec project-app php artisan route:clear
   docker exec project-app php artisan view:clear
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following PSR-12 coding standards
4. Add tests for new functionality
5. Run the test suite (`php artisan test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow Laravel and Filament best practices
- Write tests for new features
- Update documentation for significant changes
- Use semantic versioning for releases
- Ensure Docker builds work correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the application logs for error details
- Consult the [Laravel](https://laravel.com/docs) and [Filament](https://filamentphp.com/docs) documentation
