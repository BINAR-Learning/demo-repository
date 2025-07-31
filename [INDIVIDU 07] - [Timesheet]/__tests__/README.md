# API Testing Suite

This directory contains comprehensive unit tests for the application's API routes using Jest and TypeScript.

## Test Structure

```
__tests__/
├── api/                           # API route tests
│   ├── ai/
│   │   └── analyze/
│   │       └── route.test.ts      # AI analysis endpoint tests
│   ├── invitations/
│   │   └── route.test.ts          # Invitation management tests
│   ├── projects/
│   │   └── route.test.ts          # Project CRUD tests
│   ├── team/
│   │   ├── route.test.ts          # Team data tests
│   │   └── [teamId]/
│   │       └── members/
│   │           └── comparison/
│   │               └── route.test.ts  # Team member comparison tests
│   ├── timesheet/
│   │   ├── route.test.ts          # Timesheet CRUD tests
│   │   └── [id]/
│   │       └── route.test.ts      # Timesheet activity deletion tests
│   └── user/
│       └── route.test.ts          # User data tests
├── utils/
│   └── test-utils.ts              # Shared test utilities and mocks
└── README.md                      # This file
```

## Test Coverage

The test suite covers the following areas:

### Authentication & Authorization
- ✅ Unauthenticated access handling
- ✅ User role-based permissions
- ✅ Team membership validation

### CRUD Operations
- ✅ Create operations with validation
- ✅ Read operations with filtering
- ✅ Update operations with authorization
- ✅ Delete operations with ownership checks

### Data Validation
- ✅ Required field validation
- ✅ Data type validation
- ✅ Business logic validation

### Error Handling
- ✅ Database error handling
- ✅ API error responses
- ✅ Graceful fallbacks

### Edge Cases
- ✅ Empty data sets
- ✅ Invalid parameters
- ✅ Boundary conditions

## Running Tests

### Install Dependencies
```bash
pnpm install
```

### Run All Tests
```bash
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Run Specific Test File
```bash
pnpm test __tests__/api/timesheet/route.test.ts
```

### Run Tests Matching Pattern
```bash
pnpm test --testNamePattern="should create"
```

## Test Utilities

The `test-utils.ts` file provides:

### Mock Data
- `mockUser` - Standard test user
- `mockTeam` - Standard test team
- `mockProject` - Standard test project
- `mockTimesheetActivity` - Standard test activity
- `mockInvitation` - Standard test invitation

### Helper Functions
- `createMockRequest()` - Create NextRequest objects
- `createMockRequestWithParams()` - Create requests with query parameters
- `setupTestDatabase()` - Set up test database with sample data
- `cleanupDatabase()` - Clean up test database

### Mock Functions
- `mockGetUser` - Mock user authentication
- `mockGetCurrentUserWithTeam` - Mock user with team data
- `mockGetTeamForUser` - Mock team data retrieval
- `mockGeminiAI` - Mock AI service responses

## Test Patterns

### Authentication Tests
```typescript
it('should return 401 when user is not authenticated', async () => {
  mockGetUser.mockResolvedValue(null)
  // ... test implementation
})
```

### Authorization Tests
```typescript
it('should return 403 when user is not authorized', async () => {
  // Modify user permissions
  await db.update(teamMembers).set({ role: 'member' })
  // ... test implementation
})
```

### Validation Tests
```typescript
it('should return 400 when required fields are missing', async () => {
  const request = createMockRequest('POST', '/api/endpoint', {})
  // ... test implementation
})
```

### Success Tests
```typescript
it('should create resource successfully', async () => {
  const request = createMockRequest('POST', '/api/endpoint', validData)
  const response = await POST(request)
  
  expect(response.status).toBe(201)
  expect(data).toHaveProperty('id')
  // ... verify database state
})
```

### Error Handling Tests
```typescript
it('should handle database errors gracefully', async () => {
  jest.spyOn(db, 'insert').mockImplementation(() => {
    throw new Error('Database error')
  })
  // ... test implementation
  jest.restoreAllMocks()
})
```

## Database Testing

Tests use a test database that is:
- Set up before each test with sample data
- Cleaned up after each test
- Isolated from the development database

### Database Setup
```typescript
beforeEach(async () => {
  await setupTestDatabase()
})

afterEach(async () => {
  await cleanupDatabase()
})
```

## Mocking Strategy

### External Services
- **Google Gemini AI**: Mocked to avoid API calls during testing
- **Database**: Real database operations for integration testing
- **Authentication**: Mocked user functions for controlled testing

### Environment Variables
Test environment variables are set in `jest.setup.js`:
- `GEMINI_API_KEY` - Test API key
- `JWT_SECRET` - Test JWT secret
- `NEXTAUTH_SECRET` - Test NextAuth secret

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Follow the pattern: "should [expected behavior] when [condition]"

### Assertions
- Test both success and failure cases
- Verify response status codes
- Check response data structure
- Validate database state changes

### Cleanup
- Always clean up mocks after tests
- Restore database state between tests
- Avoid test interdependencies

### Performance
- Use `beforeEach` for common setup
- Minimize database operations in tests
- Mock external services to avoid network calls

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: pnpm test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure test database is properly configured
   - Check database migration status

2. **Mock Not Working**
   - Verify mock is properly imported
   - Check mock implementation in test-utils.ts

3. **Test Isolation Issues**
   - Ensure `cleanupDatabase()` is called in `afterEach`
   - Check for shared state between tests

### Debug Mode
Run tests with verbose output:
```bash
pnpm test --verbose
```

### Coverage Reports
Generate detailed coverage reports:
```bash
pnpm test:coverage
```

The coverage report will show:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## Contributing

When adding new API endpoints:

1. Create corresponding test file in `__tests__/api/`
2. Follow existing test patterns
3. Add comprehensive test cases
4. Update this README if needed
5. Ensure all tests pass before submitting

## Test Maintenance

- Regularly update mocks when API changes
- Review and update test data as needed
- Monitor test performance and optimize slow tests
- Keep test utilities up to date with new patterns 