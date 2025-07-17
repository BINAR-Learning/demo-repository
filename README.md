[![Codecov](https://codecov.io/gh/BINAR-Learning/demo-repository/graph/badge.svg?token=A9U236VZ3Q)](https://codecov.io/gh/BINAR-Learning/demo-repository)

# 🛠 Workshop Project - Sesi 11 & 12

A Next.js application demonstrating JWT authentication, database integration, and legacy code examples for refactoring workshops.

## 🚀 Features

- **JWT Authentication**: Secure login with JWT tokens
- **Password Hashing**: bcrypt for secure password storage
- **Database Integration**: PostgreSQL with raw SQL queries
- **Indonesian User Data**: 1000 realistic Indonesian users
- **Protected APIs**: JWT middleware for secure routes
- **Legacy Code Examples**: Poor practices for refactoring demo
- **Performance Benchmarking**: console.time for performance tracking
- **Complex Data Structure**: Multiple tables with relationships
- **Data Quality Issues**: NULL and DUPLICATE data for ETL practice
- **User Profile Management**: Complete profile with address, phone, birth date
- **Division Filtering**: Real-time filtering by division with poor performance
- **Enhanced User List**: Display address and division information
- **Prometheus Metrics**: Real-time monitoring with custom metrics
- **Grafana Cloud Integration**: Remote write to Grafana Cloud for monitoring
- **Automated Testing**: Jest unit tests and Playwright E2E performance tests

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn
- Prometheus (for monitoring)
- Grafana Cloud account (for dashboard)

## 🔧 Environment Variables

### Required Variables

| Variable      | Description               | Default       | Example                     |
| ------------- | ------------------------- | ------------- | --------------------------- |
| `DB_USER`     | PostgreSQL username       | `postgres`    | `postgres`                  |
| `DB_HOST`     | PostgreSQL host           | `localhost`   | `localhost`                 |
| `DB_NAME`     | Database name             | `workshop_db` | `workshop_db`               |
| `DB_PASSWORD` | PostgreSQL password       | `admin123`    | `your_password`             |
| `DB_PORT`     | PostgreSQL port           | `5432`        | `5432`                      |
| `JWT_SECRET`  | Secret key for JWT tokens | -             | `your-super-secret-jwt-key` |

### Optional Variables

| Variable              | Description      | Default                 | Example                |
| --------------------- | ---------------- | ----------------------- | ---------------------- |
| `NODE_ENV`            | Environment mode | `development`           | `production`           |
| `NEXT_PUBLIC_APP_URL` | Application URL  | `http://localhost:3000` | `https://your-app.com` |

### Environment File Setup

For **local development**, use `.env.local`:

```bash
# Create environment file
cp .env.example .env.local

# Or create manually
touch .env.local
```

**File Priority** (Next.js):

1. `.env.local` (highest priority, ignored by Git)
2. `.env.development` (development only)
3. `.env` (lowest priority)

## 🛠 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd demo-repository
   git fetch
   git checkout Module-5
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**

   ```bash
   # Start PostgreSQL service first
   # Windows: Start from Services
   # macOS: brew services start postgresql
   # Ubuntu: sudo systemctl start postgresql
   ```

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database Configuration
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=workshop_db
   DB_PASSWORD=admin123
   DB_PORT=5432

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-for-workshop

   # Application Configuration (Optional)
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Note**: Use `.env.local` for local development. This file is automatically ignored by Git for security.

5. **Create and seed the database**

   ```bash
   npm run db-create
   ```

   This script will:

   - Create the `workshop_db` database if it doesn't exist
   - Create all required tables with proper schema
   - Seed 10,000 Indonesian users with realistic data using faker
   - Create 3 fixed accounts for testing:
     - aku123@gmail.com / password123
     - kamu123@yopmail.com / password123
     - user123@test.com / password123
   - All other users have password: `User123@`

## 🗂️ Database Structure

The project uses a normalized database structure with 6 main tables:

### 1. `auth` Table

```sql
CREATE TABLE auth (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `users` Table (Updated Structure)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_id INTEGER REFERENCES auth(id),
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  birth_date DATE,
  bio TEXT,
  long_bio TEXT,
  profile_json JSON,
  address TEXT,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `user_roles` Table

```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `user_logs` Table

```sql
CREATE TABLE user_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `user_divisions` Table

```sql
CREATE TABLE user_divisions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  division_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🗄️ Database Management

### Available Scripts

```bash
# Create database and seed data
npm run db-create

# Drop database completely
npm run db-drop

# Reset database (drop + create)
npm run db-reset
```

## 🔌 API Endpoints

### Authentication

- `POST /api/login` - User login
- `POST /api/password` - Update password

### User Management

- `GET /api/users` - Get all users (with division filter)
- `GET /api/user/:id` - Get specific user
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile

### API Features

#### Division Filtering

The users API supports division filtering via query parameter:

```bash
# Get all users
GET /api/users

# Get users from specific division
GET /api/users?division=Tech
GET /api/users?division=Marketing
GET /api/users?division=HR
```

**Available Divisions**: HR, Tech, Finance, Ops

#### Profile API Response

The profile API returns comprehensive user data including new fields:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "user123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "081234567890",
    "birthDate": "1990-01-01",
    "address": "Jl. Sudirman No. 123, Jakarta",
    "division": "Tech",
    "role": "user",
    "bio": "Software developer...",
    "longBio": "Detailed bio...",
    "profileJson": {
      /* complex JSON data */
    }
  }
}
```

## 🎯 New Features for Refactor Practice

### 1. Enhanced Profile Management

**Added Fields**:

- `address`: User's full address (text)
- `phoneNumber`: Contact number (10-15 digits)
- `birthDate`: Date of birth (date picker)
- `longBio`: Detailed bio for ETL practice (max 2000 characters)

**Default Values**: All new fields are populated from the API response when editing profile.

**Long Bio Purpose**: Designed specifically for Sesi 12 ETL practice with complex text data.

### 2. Division Filtering

**Frontend Implementation**:

- Dropdown filter for division selection
- Real-time filtering without debouncing
- Direct API calls on filter change
- No pagination or optimization

**Backend Implementation**:

- Query parameter support: `?division=Tech`
- Intentionally poor performance practices:
  - No indexing on division_name
  - Manual JOIN operations
  - No LIMIT clause
  - Complex subqueries
  - String concatenation in WHERE clause

**Example Bad Query**:

```sql
SELECT * FROM users
JOIN user_divisions ON users.id = user_divisions.user_id
WHERE user_divisions.division_name = 'Marketing'
```

### 3. Enhanced User List Display

**New Fields Displayed**:

- Address information
- Division assignment
- Phone number (if available)

**Performance Issues for Practice**:

- Multiple state variables
- Inefficient filtering logic
- No memoization
- Complex sorting algorithms
- Unnecessary re-renders

## 🚀 Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Access the application**

   - **Main Page**: http://localhost:3000
   - **Login**: http://localhost:3000/login
   - **Profile**: http://localhost:3000/profile
   - **Users List**: http://localhost:3000/users

3. **Test the new features**

   - **Profile Update**: Edit address, phone, birth date
   - **Division Filter**: Use dropdown to filter users by division
   - **Performance**: Check console for timing information

## 🔍 Performance Monitoring

The application includes comprehensive monitoring with Prometheus metrics and Grafana Cloud integration.

### Prometheus Metrics

The application exposes custom metrics at `/api/metrics`:

- **HTTP Metrics**: Request count, duration, status codes
- **Database Metrics**: Query duration, connection stats
- **JWT Metrics**: Token generation time
- **System Metrics**: CPU, memory, heap usage

### Console Timing

- `Profile Get Execution`: Time to fetch user profile
- `Profile Update Execution`: Time to update profile
- `Users API Execution`: Time to fetch users list
- `Users Page Fetch`: Frontend fetch timing

### Performance Issues to Address

1. **Database Queries**: Complex joins, subqueries, no indexing
2. **Frontend Logic**: Inefficient filtering, sorting, state management
3. **API Design**: No pagination, no caching, no optimization
4. **Component Structure**: Poor separation of concerns

## 📊 Monitoring Setup

### Quick Start

1. **Start the application**

   ```bash
   npm run dev
   ```

2. **Setup Prometheus**

   - Download from https://prometheus.io/download/
   - Copy `prometheus.yml.template` to Prometheus folder
   - Update with your Grafana Cloud credentials
   - Run: `prometheus.exe --config.file=prometheus.yml`

3. **View metrics**
   - Local: http://localhost:3000/api/metrics
   - Prometheus UI: http://localhost:9090
   - Grafana Cloud: Your workspace dashboard

### Available Metrics

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `database_query_duration_seconds` - Database query time
- `jwt_token_generation_duration_seconds` - JWT generation time
- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage

For detailed setup instructions, see [PROMETHEUS_SETUP.md](./PROMETHEUS_SETUP.md).

## 🧪 Testing

The project includes comprehensive automated testing with Jest (unit tests) and Playwright (E2E tests).

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run specific test files
npm test -- --testPathPattern=api-login.test.ts
npm test -- --testPathPattern=profile.test.tsx

# Run API stability tests
npm run test:api-stability
npm run test:api-stability:run
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run performance tests (20 iterations)
npm run test:e2e:performance

# Run with specific browser
npx playwright test --project=chromium
```

### Test Coverage

- **API Tests**: Login, profile, users endpoints
- **Component Tests**: Login form, profile page, user list
- **Performance Tests**: Load time measurement for before/after refactoring
- **Stability Tests**: 100 consecutive API calls validation

### Performance Testing

The E2E performance test (`users-stability-performance.spec.ts`) is designed for:

- **Before/After Comparison**: Measure performance before and after refactoring
- **Load Testing**: 20 iterations to validate stability
- **Metrics Collection**: Average, min, max load times
- **Performance Analysis**: Automatic classification (Excellent/Moderate/Poor)

**Expected Output**:
```
🚀 Starting Performance Test - 20 iterations
✅ Iterasi ke-10: Load time: 150000ms, Users: 1
✅ Iterasi ke-20: Load time: 145000ms, Users: 1
📊 Performance Test Results:
📈 Success Rate: 20/20 (100.0%)
⏱️  Load Time Statistics:
   - Average: 148000ms
   - Min: 120000ms
   - Max: 200000ms
🎯 Performance Analysis:
   - ❌ Poor performance (> 15s average) - requires refactoring
```

For detailed testing documentation, see [API_STABILITY_TESTING.md](./API_STABILITY_TESTING.md).

## 📚 Workshop Materials

### Session 11 - Refactoring Practice

**Topics Covered**:

- Database query optimization
- Frontend performance improvements
- API design patterns
- Component refactoring
- State management optimization

**Practice Areas**:

1. **Database**: Index creation, query optimization, JOIN strategies
2. **Frontend**: React optimization, memoization, state management
3. **API**: Pagination, caching, response optimization
4. **Architecture**: Code organization, separation of concerns

### Session 12 - Query Optimization

**Focus Areas**:

- SQL query performance analysis
- Index strategy development
- Query execution plan optimization
- Database schema improvements

## 🐛 Troubleshooting

### Database Connection Issues

1. **Password Authentication Failed**

   ```bash
   # Check PostgreSQL service
   # Windows: Services > PostgreSQL
   # macOS: brew services list
   # Ubuntu: sudo systemctl status postgresql
   ```

2. **Database Does Not Exist**

   ```bash
   # Drop and recreate
   npm run db-drop
   npm run db-create
   ```

3. **Connection Refused**
   ```bash
   # Check PostgreSQL is running
   # Verify port 5432 is open
   # Check firewall settings
   ```

### Environment Variables

1. **Variables Not Loading**

   ```bash
   # Ensure .env.local exists
   # Restart development server
   npm run dev
   ```

2. **Wrong Database Credentials**
   ```bash
   # Update .env.local with correct credentials
   # Default: postgres/admin123
   ```

### Application Issues

1. **JWT Token Errors**

   ```bash
   # Clear browser storage
   # Re-login to get new token
   ```

2. **API 500 Errors**
   ```bash
   # Check database connection
   # Verify table structure
   # Check console for detailed errors
   ```

## 📝 Development Notes

### Code Quality

- **Intentional Bad Practices**: Used for workshop demonstration
- **Performance Issues**: Designed for refactoring practice
- **Legacy Patterns**: Demonstrates real-world problems

### Workshop Goals

1. **Identify Performance Bottlenecks**
2. **Practice Query Optimization**
3. **Learn Refactoring Techniques**
4. **Understand Best Practices**

### Future Improvements

- Add proper indexing
- Implement pagination
- Add caching layer
- Optimize React components
- Improve API design

## 📄 License

This project is for educational purposes only.

---

**Note**: This project intentionally contains poor practices for workshop demonstration. In production, follow industry best practices for security, performance, and maintainability.
