# Jest Testing Setup for API Routes

## Overview
This document outlines the Jest testing setup for the Next.js API routes in this project.

## Current Status

### ✅ Working Tests
- `__tests__/basic.test.ts` - Basic Jest setup verification
- `__tests__/api/user/route.test.ts` - User API route tests (4 tests passing)
- `__tests__/api/timesheet/route.test.ts` - Timesheet API route tests (10 tests passing)

### ❌ Tests Needing Fixes
The following test files have the same Jest hoisting issue and need to be updated:

1. `__tests__/api/team/route.test.ts`
2. `__tests__/api/ai/analyze/route.test.ts`
3. `__tests__/api/timesheet/[id]/route.test.ts`
4. `__tests__/api/projects/route.test.ts`
5. `__tests__/api/team/[teamId]/members/comparison/route.test.ts`
6. `__tests__/api/invitations/route.test.ts`

## Setup Configuration

### Jest Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.test.(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'app/api/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

module.exports = createJestConfig(customJestConfig)
```

### Jest Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-api-key'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock Next.js Request and Response
global.Request = class MockRequest {
  constructor(url, options = {}) {
    Object.defineProperty(this, 'url', {
      value: url,
      writable: false,
      configurable: true
    })
    this.method = options.method || 'GET'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.body = options.body
  }

  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'))
  }
}

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.headers = new Map(Object.entries(options.headers || {}))
  }

  json() {
    return Promise.resolve(this.body)
  }

  static json(data, options = {}) {
    return new MockResponse(data, options)
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))
```

## Test Utilities (`__tests__/utils/test-utils.ts`)

### Mock Data
- `mockUser` - Test user data
- `mockTeam` - Test team data
- `mockProject` - Test project data
- `mockTimesheetActivity` - Test timesheet activity data
- `mockInvitation` - Test invitation data

### Helper Functions
- `createMockRequest()` - Create mock NextRequest objects
- `createMockRequestWithParams()` - Create mock requests with search parameters
- `cleanupDatabase()` - Mock database cleanup (no-op)
- `setupTestDatabase()` - Mock database setup (no-op)

### Database Mocking
The database is mocked to avoid real database connections:
```javascript
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  },
}))
```

## Test Patterns

### Working Pattern for API Route Tests
```typescript
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/route'
import { setupTestDatabase, cleanupDatabase } from '@/__tests__/utils/test-utils'

// Mock the function
jest.mock('@/lib/db/queries', () => ({
  getUser: jest.fn(),
}))

describe('/api/route', () => {
  let mockGetUser: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()
    await setupTestDatabase()
    
    // Get the mocked function
    const { getUser } = require('@/lib/db/queries')
    mockGetUser = getUser
    
    mockGetUser.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    // More tests...
  })
})
```

## Issues Resolved

### 1. Jest Hoisting Issue
**Problem**: `ReferenceError: Cannot access 'mockGetUser' before initialization`
**Solution**: Declare mock functions inside `jest.mock()` calls instead of importing them:
```typescript
// ❌ Wrong
const mockGetUser = jest.fn()
jest.mock('@/lib/db/queries', () => ({
  getUser: mockGetUser,
}))

// ✅ Correct
jest.mock('@/lib/db/queries', () => ({
  getUser: jest.fn(),
}))
```

### 2. NextRequest URL Property
**Problem**: `TypeError: Cannot set property url of #<NextRequest> which has only a getter`
**Solution**: Use `Object.defineProperty` to set read-only properties:
```javascript
Object.defineProperty(this, 'url', {
  value: url,
  writable: false,
  configurable: true
})
```

### 3. Database Connection Timeouts
**Problem**: Tests trying to connect to real PostgreSQL database
**Solution**: Mock the entire database object to avoid real connections

### 4. Date Comparison Issues
**Problem**: Date objects vs strings in test assertions
**Solution**: Use `.toEqual()` for Date objects instead of `.toBe()` for strings

## Next Steps

### Immediate Actions Needed:
1. **Fix Mock Initialization**: Apply the working pattern to the 6 failing test files
2. **Database Setup**: Ensure test database is properly configured
3. **Run Full Test Suite**: Execute all tests to verify functionality

### Files to Update:
1. `__tests__/api/team/route.test.ts`
2. `__tests__/api/ai/analyze/route.test.ts`
3. `__tests__/api/timesheet/[id]/route.test.ts`
4. `__tests__/api/projects/route.test.ts`
5. `__tests__/api/team/[teamId]/members/comparison/route.test.ts`
6. `__tests__/api/invitations/route.test.ts`

### Commands:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/api/user/route.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Coverage Areas

### API Routes Tested:
- ✅ User API (`/api/user`)
- ✅ Timesheet API (`/api/timesheet`)
- ❌ Team API (`/api/team`)
- ❌ AI Analysis API (`/api/ai/analyze`)
- ❌ Projects API (`/api/projects`)
- ❌ Invitations API (`/api/invitations`)
- ❌ Team Members Comparison API (`/api/team/[teamId]/members/comparison`)

### Test Scenarios Covered:
- Authentication/Authorization
- CRUD operations
- Error handling
- Input validation
- Database operations (mocked)
- API response formats

## Best Practices Implemented

1. **Isolation**: Each test is isolated with proper setup/teardown
2. **Mocking**: External dependencies are properly mocked
3. **Error Handling**: Tests cover both success and error scenarios
4. **Type Safety**: TypeScript types are maintained in tests
5. **Readability**: Tests are well-structured and documented 