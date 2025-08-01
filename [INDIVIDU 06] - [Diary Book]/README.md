# Diary Books - Phase 4 Complete

A web-based diary application with user authentication, interactive calendar interface, rich text diary entries, and tagging system.

## Phase 1 Features ✅
- **Express.js Application Structure**: Clean SSR setup with proper separation of concerns
- **EJS Templating Engine**: Configured for server-side rendering
- **SQLite Database**: Initialized with migration support
- **User Authentication**: 
  - User registration with form validation
  - Login/logout functionality  
  - JWT token-based authentication
  - Password hashing with bcrypt
  - Route protection middleware
- **Basic Routing**: Clean route structure for auth and main pages
- **Error Handling**: Basic error handling and validation throughout the app

## Phase 2 Features ✅
- **Interactive Calendar Dashboard**: Full calendar view showing current month with responsive grid layout
- **Month/Year Navigation**: Previous/Next navigation controls with "Today" quick access button
- **Clickable Calendar Days**: Interactive calendar days with hover effects and keyboard navigation support
- **Enhanced Authentication**: 
  - Automatic token refresh when near expiration
  - Return-to URL functionality (redirects to intended page after login)
  - Improved session management with express-session
- **Responsive Design**: Mobile-optimized calendar layout that adapts to different screen sizes
- **Visual Enhancements**: Today highlighting, smooth transitions, and professional styling with Font Awesome icons

## Phase 3 Features ✅
- **Complete Diary Entry Management**: Full CRUD operations for diary entries
- **Entry Creation**: Simple text-based diary entries with title and content fields
- **Date-Based Organization**: Entries are organized by date with easy navigation
- **Entry Viewing**: 
  - Individual entry view with full content display
  - Date-based entry listing showing all entries for a specific day
  - Entry preview cards with truncated content
- **Entry Editing**: Full editing capabilities with form validation
- **Entry Deletion**: Secure deletion with confirmation prompts
- **Calendar Integration**: 
  - Visual indicators on calendar days with existing entries
  - Entry count badges on calendar days
  - Direct navigation from calendar to entry management
- **Database Schema**: Proper diary_entries table with user relationships and indexing
- **Form Validation**: Server-side validation for title and content requirements
- **Breadcrumb Navigation**: Clear navigation paths throughout the entry management system

## Phase 4 Features ✅
- **WYSIWYG Rich Text Editor**: 
  - Quill.js integration for rich content creation
  - Support for headers, bold, italic, underline, strike-through
  - Lists (ordered and unordered), blockquotes, and code blocks
  - Link and image embedding capabilities
  - Clean and intuitive toolbar interface
- **Tags System**:
  - Comma-separated tags for entry categorization
  - Tag display as clickable badges on entries
  - View all entries by specific tag
  - Tag filtering and navigation
  - Visual tag indicators on entry cards
- **Enhanced Entry Display**:
  - Rich HTML content rendering
  - Proper formatting for headers, lists, and quotes
  - Image display support
  - Improved typography and spacing
- **UI/UX Enhancements**:
  - Card hover effects and transitions
  - Enhanced entry preview with HTML stripping
  - Better visual hierarchy with improved styling
  - Responsive Quill editor interface
  - Tag badges with hover effects
- **Multiple Entries Per Day**: Already supported from Phase 3
- **Improved Entry Cards**: Better visual design with shadows and transitions

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

3. **Start the Application**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Access the Application**:
   - Open your browser to `http://localhost:3000`
   - Register a new account or login with existing credentials

## Project Structure
```
diary-books/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── config/
│   └── database.js        # Database connection and helpers
├── routes/
│   ├── index.js           # Main routes (home, dashboard)
│   ├── auth.js            # Authentication routes
│   └── entries.js         # Diary entry management routes
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model with database operations
│   └── DiaryEntry.js      # Diary entry model with CRUD operations
├── utils/
│   ├── auth.js            # Authentication utilities (hashing, JWT)
│   ├── calendar.js        # Calendar utility functions
│   └── render.js          # Template rendering helpers
├── views/
│   ├── index.ejs          # Welcome/home page
│   ├── dashboard.ejs      # User dashboard with calendar
│   ├── error.ejs          # Error page template
│   ├── auth/
│   │   ├── login.ejs      # Login page
│   │   └── register.ejs   # Registration page
│   └── entries/
│       ├── create.ejs     # New entry creation form (with Quill editor)
│       ├── edit.ejs       # Entry editing form (with Quill editor)
│       ├── view.ejs       # Individual entry view
│       ├── view-date.ejs  # Date-based entry listing
│       └── view-tag.ejs   # Tag-based entry listing
├── public/
│   ├── css/style.css      # Application styles
│   └── js/main.js         # Client-side JavaScript
├── scripts/
│   └── migrate.js         # Database migration script
└── database/
    └── diary.db           # SQLite database (created automatically)
```

## Environment Variables
The following environment variables can be configured in `.env`:
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens and sessions (change in production!)
- `DB_PATH`: Path to SQLite database file
- `NODE_ENV`: Environment mode (development/production)
- `SESSION_SECRET`: Session secret for express-session (required in production)

## Deployment

### Railway.app Deployment
This application is configured for automatic deployment to Railway.app via GitHub Actions.

**Setup Requirements:**
1. Create a Railway account and project
2. Add `RAILWAY_TOKEN` to GitHub repository secrets
3. Configure environment variables in Railway dashboard

**CI/CD Pipeline:**
- Automated deployment on push to main branch
- Sequential pipeline: Lint → Test → SonarCloud → Deploy
- Pull requests run quality checks without deployment

See [Railway Deployment Setup Guide](./documentation/railway-deployment-setup.md) for detailed instructions.

## Next Steps - Phase 5 (Polish & Optimization)
- Comprehensive error handling improvements
- Advanced input validation
- Loading states and feedback animations
- Performance optimizations
- Cross-browser compatibility testing
- Search functionality for entries
- Export functionality for diary entries
- User preferences and settings

## Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 7-day expiration and automatic refresh
- HTTP-only cookies for token storage
- Session-based return-to URL functionality
- Input validation and sanitization
- SQL injection protection through parameterized queries
- CSRF protection ready

## Calendar Features
- **Full Month View**: Complete calendar grid showing all days of the current month
- **Smart Navigation**: Previous/Next month navigation with URL-based routing
- **Today Highlighting**: Current day is visually highlighted with distinct styling
- **Responsive Grid**: Calendar adapts to mobile screens with optimized spacing
- **Interactive Days**: Clickable calendar days with hover effects and keyboard support
- **Accessibility**: Full keyboard navigation and ARIA labels for screen readers

## Entry Management Features
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for diary entries
- **Date Organization**: Entries are automatically organized by date with efficient indexing
- **Multiple Entries**: Support for multiple diary entries per day
- **Rich Content**: Line breaks preserved in entry content with proper formatting
- **Entry Previews**: Truncated previews in date view with "Read More" functionality
- **User Isolation**: Each user can only access their own entries with proper authorization
- **Breadcrumb Navigation**: Clear navigation paths with back buttons and breadcrumbs
- **Action Confirmations**: Delete confirmations to prevent accidental data loss

## Rich Text Editing Features
- **WYSIWYG Editor**: Quill.js for intuitive rich text editing
- **Formatting Options**: Headers, bold, italic, underline, strike-through
- **Content Blocks**: Lists, blockquotes, code blocks
- **Media Support**: Links and images
- **Clean Toolbar**: Organized editing tools with clear icons
- **HTML Storage**: Content saved as clean HTML in database

## Tagging System
- **Flexible Tags**: Add multiple tags to any entry
- **Tag Navigation**: Click tags to view all entries with that tag
- **Visual Indicators**: Tags displayed as badges on entries
- **Tag Filtering**: Dedicated tag view page
- **Tag Management**: Easy to add, edit, or remove tags from entries
- **Comma-Separated**: Simple tag input format
