-- =====================================================
-- DATABASE SCHEMA FOR UPDATE-PROFILE WORKSHOP PROJECT
-- =====================================================

-- Create database (if not exists)
-- CREATE DATABASE workshop_db;

-- =====================================================
-- TABLE DEFINITIONS
-- =====================================================

-- 1. AUTH TABLE - Stores authentication information
CREATE TABLE IF NOT EXISTS auth (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE - Stores user profile information
CREATE TABLE IF NOT EXISTS users (
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
  profile_picture_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER_PROFILE_UPDATES TABLE - Stores profile update audit trail
CREATE TABLE IF NOT EXISTS user_profile_updates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  updated_fields JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER_ROLES TABLE - Stores user role assignments
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. USER_LOGS TABLE - Stores user activity logs
CREATE TABLE IF NOT EXISTS user_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. USER_DIVISIONS TABLE - Stores user division assignments
CREATE TABLE IF NOT EXISTS user_divisions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  division_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TODOS TABLE - Stores user todo items
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_profile_updates_user_id ON user_profile_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_updates_created_at ON user_profile_updates(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON user_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_divisions_user_id ON user_divisions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_divisions_division_name ON user_divisions(division_name);
CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email);

-- Todo indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON todos(updated_at);
CREATE INDEX IF NOT EXISTS idx_todos_user_status ON todos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_todos_user_priority ON todos(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_todos_user_due_date ON todos(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_todos_user_created_at ON todos(user_id, created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_todos_user_status_priority ON todos(user_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_todos_user_due_date_status ON todos(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_todos_search ON todos(user_id, title, description);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA STRUCTURE
-- =====================================================

-- Sample auth record
-- INSERT INTO auth (email, password) VALUES ('user@example.com', 'hashed_password');

-- Sample user record
-- INSERT INTO users (auth_id, full_name, username, birth_date, bio, long_bio, profile_json, address, phone_number, profile_picture_url) 
-- VALUES (1, 'John Doe', 'johndoe', '1990-01-01', 'Short bio', 'Long detailed bio...', '{"social_media": {"instagram": "johndoe"}, "preferences": {"theme": "light"}}', 'Jl. Sudirman No. 123, Jakarta', '+6281234567890', 'https://example.com/profile.jpg');

-- Sample user role
-- INSERT INTO user_roles (user_id, role) VALUES (1, 'user');

-- Sample user division
-- INSERT INTO user_divisions (user_id, division_name) VALUES (1, 'Tech');

-- Sample user log
-- INSERT INTO user_logs (user_id, action) VALUES (1, 'profile_updated');

-- Sample todo records
-- INSERT INTO todos (user_id, title, description, priority, status, due_date) 
-- VALUES 
--   (1, 'Complete workshop project', 'Finish implementing the todo list feature', 'high', 'in-progress', '2024-01-15'),
--   (1, 'Review code', 'Code review for team members', 'medium', 'pending', '2024-01-20'),
--   (1, 'Update documentation', 'Update API documentation', 'low', 'completed', '2024-01-10');

-- =====================================================
-- RELATIONSHIPS OVERVIEW
-- =====================================================

/*
RELATIONSHIP DIAGRAM:

auth (1) -----> (1) users
                |
                v
            user_profile_updates (many)
                |
                v
            user_roles (many)
                |
                v
            user_divisions (many)
                |
                v
            user_logs (many)
                |
                v
            todos (many)

DETAILED RELATIONSHIPS:
- auth.id -> users.auth_id (One-to-One)
- users.id -> user_profile_updates.user_id (One-to-Many)
- users.id -> user_roles.user_id (One-to-Many)
- users.id -> user_divisions.user_id (One-to-Many)
- users.id -> user_logs.user_id (One-to-Many)
- users.id -> todos.user_id (One-to-Many)
*/

-- =====================================================
-- COMMON QUERIES USED IN THE APPLICATION
-- =====================================================

-- Query to get user with all related data (used in /api/user/[id])
/*
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.birth_date,
  u.bio,
  u.long_bio,
  u.profile_json,
  u.address,
  u.phone_number,
  u.profile_picture_url,
  u.created_at,
  u.updated_at,
  a.email,
  ur.role,
  ud.division_name
FROM users u
LEFT JOIN auth a ON u.auth_id = a.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN LATERAL (
  SELECT division_name
  FROM user_divisions
  WHERE user_id = u.id
  ORDER BY id DESC
  LIMIT 1
) ud ON true
WHERE u.id = $1
*/

-- Query to get users with division filter (used in /api/users)
/*
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.birth_date,
  u.bio,
  u.address,
  u.phone_number,
  u.profile_picture_url,
  ud.division_name
FROM users u
LEFT JOIN user_divisions ud ON u.id = ud.user_id
WHERE ud.division_name = $1
*/

-- Query to get todos with pagination and filters (used in /api/todos)
/*
SELECT 
  t.id,
  t.user_id,
  t.title,
  t.description,
  t.priority,
  t.status,
  t.due_date,
  t.created_at,
  t.updated_at
FROM todos t
WHERE t.user_id = $1
  AND ($2::text IS NULL OR t.status = $2)
  AND ($3::text IS NULL OR t.priority = $3)
  AND ($4::text IS NULL OR t.title ILIKE '%' || $4 || '%' OR t.description ILIKE '%' || $4 || '%')
  AND ($5::date IS NULL OR t.due_date = $5)
ORDER BY t.created_at DESC
LIMIT $6 OFFSET $7
*/

-- Query to get todo statistics (used in /api/todos/stats)
/*
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue,
  COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority,
  COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
  ROUND(
    (COUNT(CASE WHEN status = 'completed' THEN 1 END)::decimal / NULLIF(COUNT(*), 0)) * 100, 2
  ) as completion_rate
FROM todos
WHERE user_id = $1
*/

-- Query to get profile update history (used in /api/profile/history)
/*
SELECT 
  id,
  updated_fields,
  created_at
FROM user_profile_updates
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3
*/

-- =====================================================
-- AVAILABLE DIVISIONS
-- =====================================================

/*
The application supports these divisions:
- HR
- Tech
- Finance
- Ops
*/

-- =====================================================
-- NOTES FOR WORKSHOP PRACTICE
-- =====================================================

/*
PERFORMANCE ISSUES INTENTIONALLY INCLUDED FOR PRACTICE:

1. No proper indexing on frequently queried columns
2. Complex JOIN operations without optimization
3. LATERAL JOINs that could be simplified
4. No query result limiting
5. String concatenation in WHERE clauses
6. Multiple state variables in frontend
7. Inefficient filtering logic
8. No memoization
9. Complex sorting algorithms
10. Unnecessary re-renders

These issues are intentionally included for refactoring practice in the workshop.
*/ 