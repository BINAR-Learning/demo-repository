# Conditional Data Storage for Timesheet Activities

## Overview

The timesheet application now implements conditional data storage based on user authentication status:

- **Guest Users**: Data is stored locally in the browser using `localStorage`
- **Authenticated Users**: Data is stored in the database and synced across devices

## Implementation Details

### Authentication Detection

The application automatically detects user authentication status by making a request to `/api/user`:

- If the request succeeds and returns user data → User is authenticated
- If the request fails or returns an error → User is a guest

### Data Storage Methods

#### For Guest Users (localStorage)
- **Storage Key**: `timesheetActivities`
- **Data Format**: JSON array of timesheet activities
- **ID Generation**: Uses timestamp + random string for unique IDs
- **Persistence**: Data persists only in the current browser
- **Limitations**: 
  - Data is not synced across devices
  - Data is lost if browser data is cleared
  - No team features available

#### For Authenticated Users (Database)
- **Storage**: PostgreSQL database via Drizzle ORM
- **Table**: `timesheet_activities`
- **ID Generation**: Auto-incrementing database IDs
- **Persistence**: Data is synced across all devices
- **Features**: 
  - Full team collaboration
  - Project management
  - Analytics and reporting
  - Data backup and recovery

### User Interface Changes

#### Authentication Status Notice
- **Guest Users**: Blue notice card explaining local storage with sign-in/sign-up buttons
- **Authenticated Users**: No notice (normal operation)

#### Feature Availability
- **Guest Users**: 
  - Basic timesheet entry and management
  - Local analytics and reporting
  - Sample data generation
- **Authenticated Users**:
  - All guest features plus:
  - Team collaboration
  - Project assignment
  - Advanced analytics
  - Data export and sharing

### API Endpoints

The following API endpoints require authentication and will return 401 for guest users:

- `GET /api/timesheet` - Fetch user's timesheet activities
- `POST /api/timesheet` - Create new timesheet activity
- `DELETE /api/timesheet/[id]` - Delete timesheet activity
- `GET /api/user` - Get current user information
- `GET /api/projects` - Get user's projects
- `GET /api/team/[teamId]/members/comparison` - Get team member comparison data

### Migration Path

Users can seamlessly transition from guest to authenticated:

1. **Guest User**: Uses localStorage, data is stored locally
2. **Sign Up/In**: User creates account or signs in
3. **Data Migration**: Existing localStorage data can be manually migrated (future feature)
4. **Full Access**: User now has access to all features with database storage

### Technical Implementation

#### Key Files Modified
- `app/(dashboard)/timesheet/page.tsx` - Main timesheet entry page
- `app/(dashboard)/timesheet/dashboard/page.tsx` - Analytics dashboard
- `app/api/timesheet/route.ts` - API endpoints (authentication required)

#### Key Functions Added
- `checkAuthenticationAndLoadData()` - Detects auth status and loads appropriate data
- `loadActivitiesFromLocalStorage()` - Loads data from localStorage for guests
- `saveActivitiesToLocalStorage()` - Saves data to localStorage for guests

#### State Management
- `isAuthenticated` - Boolean state indicating user authentication status
- Conditional rendering based on authentication status
- Different data handling logic for each user type

### Benefits

1. **Lower Barrier to Entry**: Users can try the app without creating an account
2. **Data Privacy**: Guest users' data stays local to their browser
3. **Seamless Experience**: Same UI for both user types with appropriate feature availability
4. **Scalability**: Database storage for authenticated users supports team features
5. **Flexibility**: Users can choose their preferred level of commitment

### Future Enhancements

1. **Data Migration**: Automatic migration of localStorage data when user signs up
2. **Offline Support**: Enhanced offline capabilities for authenticated users
3. **Data Export**: Export localStorage data for backup
4. **Guest Analytics**: Enhanced analytics for guest users
5. **Team Invitations**: Allow guests to receive and accept team invitations 