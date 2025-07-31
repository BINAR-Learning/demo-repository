# Timesheet AI Assistant

A comprehensive timesheet management system with AI-powered analysis, team collaboration, and project management features.

## 🔗 Links

- **GitHub Repository**: [https://github.com/AhWirayudha/timesheet](https://github.com/AhWirayudha/timesheet)
- **Live Demo**: [https://timesheet-brown-three.vercel.app/](https://timesheet-brown-three.vercel.app/)

## 🚀 Features

### Core Timesheet Management
- **Personal & Team Timesheets**: Log activities for personal work or team projects
- **Project Integration**: Associate timesheet entries with specific projects
- **Category-based Tracking**: Organize work by categories (Development, Design, Meeting, etc.)
- **Time Validation**: Prevent overlapping time entries
- **Export Functionality**: Export timesheet data to CSV format

### AI-Powered Analysis
- **Google Gemini Integration**: Advanced AI analysis using Google's Gemini models
- **Comprehensive Insights**: Personal, team, project, and comprehensive analysis modes
- **Comparison Analysis**: Compare team members, projects, and time periods (Owner only)
- **Work-Life Balance Assessment**: AI-powered recommendations for productivity optimization
- **Model Transparency**: Clear indication of analysis source (Gemini AI or Manual Logic)

### Team & Project Management
- **Role-Based Access Control**: Owner and User roles with appropriate permissions
- **Team Creation & Management**: Create teams and manage team members
- **Application-Based Invitations**: Invite team members through the application (no email required)
- **Project Management**: Create, edit, and manage projects with member assignments
- **Project Member Management**: Add/remove users to/from projects with roles
- **Team Analytics**: Track team performance and member contributions

### Enhanced Dashboard & Analytics
- **Multi-Period Analysis**: Weekly, monthly, and yearly analysis options
- **Advanced Filtering**: Filter analysis by scope, team members, and projects
- **Owner Dashboard**: Comprehensive statistics and management tools for team owners
- **Project Health Metrics**: Monitor project activity and member engagement
- **Real-time Statistics**: Dynamic calculation of hours, activities, and productivity metrics

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Navigation**: Clear navigation based on user role and team membership
- **Visual Indicators**: Color-coded badges for activities, projects, and personal work
- **Sample Data**: Easy testing with sample data generation
- **Loading States**: Smooth loading experiences with proper feedback

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based authentication
- **AI Integration**: Google Gemini API
- **State Management**: React hooks (useState, useEffect)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key
- pnpm package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd timesheet-ai-assistant
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/timesheet_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Set Up Database
```bash
# Run database migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed
```

### 5. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## 🔑 Getting Your Google Gemini API Key

1. **Visit Google AI Studio**: Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Sign In**: Use your Google account to sign in
3. **Create API Key**: Click "Create API Key" to generate a new key
4. **Copy the Key**: Copy the generated API key to your `.env.local` file
5. **Free Tier**: The application is configured to use Gemini's free tier models

## 📱 Usage Guide

### For New Users
1. **Sign Up**: Create a new account
2. **Personal Mode**: Start with personal timesheet logging
3. **Create Team**: Create your own team or join an existing one
4. **Project Setup**: Create projects for your team
5. **AI Analysis**: Use the dashboard for AI-powered insights

### For Team Owners
1. **Team Management**: Manage team members and invitations
2. **Project Creation**: Create and manage projects
3. **Member Assignment**: Add team members to projects
4. **Advanced Analytics**: Use comparison analysis for team insights
5. **Dashboard Overview**: Monitor team performance and project health

### For Team Members
1. **Join Team**: Accept team invitations
2. **Project Activities**: Log timesheet entries for specific projects
3. **Personal Work**: Log personal activities when not working on projects
4. **Team Analytics**: View team and project insights
5. **Activity Tracking**: Monitor your productivity patterns

## 🔧 Configuration

### Database Configuration
The application uses Drizzle ORM with PostgreSQL. Database schema is defined in `lib/db/schema.ts`.

### AI Analysis Configuration
- **Gemini Models**: Configured to use free tier models (`gemini-pro`, `gemini-1.5-flash`)
- **Fallback Logic**: Manual analysis when AI is unavailable
- **Model Transparency**: Clear indication of analysis source and model used

### Role-Based Access Control
- **Owner**: Can create teams, manage members, create projects, and access comparison analysis
- **User**: Can join teams, log activities, and view team analytics
- **Default Role**: New registrations default to 'user' role

## 📊 Features by User Role

### Personal Users (No Team)
- ✅ Personal timesheet logging
- ✅ AI analysis for personal data
- ✅ Sample data generation
- ✅ Team creation option
- ✅ Invitation checking

### Team Members
- ✅ Personal and project timesheet logging
- ✅ Team analytics access
- ✅ Project assignment
- ✅ AI analysis (personal, team, project)
- ❌ Team management (owner only)
- ❌ Comparison analysis (owner only)

### Team Owners
- ✅ All member features
- ✅ Team creation and management
- ✅ Project creation and management
- ✅ Member invitations
- ✅ Comparison analysis
- ✅ Enhanced dashboard statistics
- ✅ Project health monitoring

## 🔍 Analysis Types

### Personal Analysis
- Work-life balance assessment
- Productivity patterns
- Category distribution insights
- Personal recommendations

### Team Analysis
- Team member productivity comparison
- Workload distribution analysis
- Team collaboration insights
- Team-specific recommendations

### Project Analysis
- Project activity breakdown
- Resource allocation insights
- Project efficiency metrics
- Project-specific recommendations

### Comprehensive Analysis
- Combined personal, team, and project insights
- Cross-dimensional analysis
- Holistic recommendations
- Advanced productivity insights

### Comparison Analysis (Owner Only)
- Team member comparison
- Project comparison
- Time period comparison
- Comparative insights and recommendations

## 🚧 Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard routes
│   ├── (login)/          # Authentication routes
│   └── api/              # API routes
├── components/            # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database configuration
│   └── utils.ts          # General utilities
└── docs/                 # Documentation
```

### Key Files
- `app/(dashboard)/timesheet/page.tsx` - Main timesheet interface
- `app/(dashboard)/timesheet/dashboard/page.tsx` - Analytics dashboard
- `app/(dashboard)/dashboard/projects/page.tsx` - Project management
- `app/api/ai/analyze/route.ts` - AI analysis API
- `lib/db/schema.ts` - Database schema

### Database Schema
- `users` - User accounts and authentication
- `teams` - Team information
- `teamMembers` - Team membership and roles
- `projects` - Project definitions
- `projectMembers` - Project assignments
- `timesheetActivities` - Timesheet entries
- `aiInsights` - AI analysis results
- `invitations` - Team invitations
- `activityLogs` - System activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
1. Check the documentation in the `docs/` folder
2. Review the development log for recent changes
3. Open an issue on GitHub

## 🔄 Recent Updates

### Version 3.1 - Enhanced Analysis & Management Features
- ✅ Enhanced comparison analysis for team owners
- ✅ Improved timesheet project integration
- ✅ Better team and project management UI
- ✅ Enhanced AI analysis with comparison support
- ✅ Owner-specific dashboard statistics

### Version 3.0 - Role-Based Access Control
- ✅ User role system (owner/user)
- ✅ Application-based team invitations
- ✅ Enhanced project member management
- ✅ Role-based UI and functionality

### Version 2.1 - AI Analysis Enhancement
- ✅ Google Gemini API integration
- ✅ Model transparency and source indication
- ✅ Enhanced analysis capabilities
- ✅ Free tier model support

---

**Built with ❤️ using Next.js, React, and Google Gemini AI**
