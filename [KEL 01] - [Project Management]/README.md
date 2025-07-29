# Sistem Management Project dan Quotation

## 📋 Overview

This is a comprehensive web application for managing projects and quotations built with modern technologies. The system provides a complete solution for project management, quotation handling, and team collaboration.

## 🔗 Repository

**GitHub Repository**: [https://github.com/muhajirshiddiqaf/project-management](https://github.com/muhajirshiddiqaf/project-management)

## 🚀 Tech Stack

- **Frontend**: React.js dengan SaaS UI Pro
- **Backend**: Node.js dengan Express.js
- **Database**: PostgreSQL
- **Containerization**: Docker
- **Authentication**: JWT

## 📁 Project Structure

```
Final Project/
├── documents/
│   ├── PRD_System_Management_Project_Quotation.md
│   └── History_Prompts.md
├── frontend/
│   ├── README.md
│   ├── Dockerfile
│   └── .dockerignore
├── backend/
│   ├── README.md
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
└── README.md
```

## 📚 Documentation

### Documents Folder

The `documents/` folder contains essential project documentation:

1. **PRD_System_Management_Project_Quotation.md**
   - Product Requirements Document
   - Detailed system specifications
   - Feature requirements and user stories
   - Technical architecture overview

2. **History_Prompts.md**
   - Development history and decision tracking
   - AI prompt history for development
   - Project evolution documentation

## 🛠️ Quick Start

### Prerequisites

- Docker
- Docker Compose
- Node.js (v18 or higher) - for local development

### Using Docker (Recommended)

1. **Clone repository**
   ```bash
   git clone https://github.com/muhajirshiddiqaf/project-management
   cd "Final Project"
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Local Development

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Setup Database**
   ```sql
   CREATE DATABASE project_management;
   ```

## 📋 Features

### ✅ Completed

- Project structure setup
- Docker configuration
- PRD documentation
- History prompts tracking

### 🚧 In Progress

- Backend API development
- Frontend React app setup
- Database schema implementation
- Authentication system

### 📝 Planned

- User management
- Project CRUD operations
- Quotation management
- Dashboard and analytics
- File upload functionality
- Email notifications
- PDF generation

## 🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
npm run migrate
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up --build

# Stop and remove volumes
docker-compose down -v
```

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password123@localhost:5432/project_management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Project Management System
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@projectmanagement.com or create an issue in the [repository](https://github.com/muhajirshiddiqaf/project-management).

## 🔗 Links

- **Main Repository**: [https://github.com/muhajirshiddiqaf/project-management](https://github.com/muhajirshiddiqaf/project-management)
- **Frontend**: http://localhost:3000 (when running locally)
- **Backend API**: http://localhost:3001 (when running locally)

---

*This README provides comprehensive information about the Project Management and Quotation System. For detailed technical specifications, please refer to the documents in the repository.* 