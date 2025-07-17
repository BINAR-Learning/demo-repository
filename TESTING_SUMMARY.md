# Testing Summary

This document provides an overview of all automated tests in the project.

## 📁 Test Structure

```
├── __tests__/                    # Jest Unit Tests
│   ├── api-stability.test.ts     # API stability (100 requests)
│   ├── api-login.test.ts         # Login API tests
│   ├── api-profile.test.ts       # Profile API tests
│   ├── login.test.tsx            # Login component tests
│   ├── profile.test.tsx          # Profile component tests
│   └── update-password.test.tsx  # Password update tests
├── e2e/                          # Playwright E2E Tests
│   └── users-stability-performance.spec.ts  # Performance testing (20 iterations)
└── scripts/
    └── run-api-stability-test.js # Test runner script
```

## 🧪 Available Tests

### Unit Tests (Jest)

| Test File                  | Purpose                                     | Commands                                                 |
| -------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `api-stability.test.ts`    | API stability with 100 consecutive requests | `npm run test:api-stability`                             |
| `api-login.test.ts`        | Login API validation                        | `npm test -- --testPathPattern=api-login.test.ts`        |
| `api-profile.test.ts`      | Profile API validation                      | `npm test -- --testPathPattern=api-profile.test.ts`      |
| `login.test.tsx`           | Login component UI tests                    | `npm test -- --testPathPattern=login.test.tsx`           |
| `profile.test.tsx`         | Profile component UI tests                  | `npm test -- --testPathPattern=profile.test.tsx`         |
| `update-password.test.tsx` | Password update component tests             | `npm test -- --testPathPattern=update-password.test.tsx` |

### E2E Tests (Playwright)

| Test File                             | Purpose                             | Commands                       |
| ------------------------------------- | ----------------------------------- | ------------------------------ |
| `users-stability-performance.spec.ts` | Performance testing (20 iterations) | `npm run test:e2e:performance` |

## 🚀 Quick Commands

```bash
# Run all unit tests
npm test

# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:api-stability        # API stability (Jest)
npm run test:e2e:performance      # Performance testing (Playwright)

# Run with verbose output
npm run test:api-stability:run    # With detailed logging
```

## 📊 Test Coverage

### API Testing

- ✅ Login endpoint validation
- ✅ Profile CRUD operations
- ✅ Users list with filtering
- ✅ API stability under load
- ✅ Response structure validation

### Component Testing

- ✅ Login form functionality
- ✅ Profile update forms
- ✅ Password change forms
- ✅ User list rendering

### Performance Testing

- ✅ Page load time measurement
- ✅ Before/after refactoring comparison
- ✅ Stability validation (20 iterations)
- ✅ Performance classification

## 🎯 Use Cases

### For Development

```bash
# Quick validation during development
npm test -- --testPathPattern=api-login.test.ts
```

### For Performance Analysis

```bash
# Before refactoring
npm run test:e2e:performance

# After refactoring
npm run test:e2e:performance

# Compare results for improvement validation
```

### For CI/CD

```bash
# Full test suite
npm test && npm run test:e2e
```

## 📈 Performance Metrics

The E2E performance test provides:

- **Load Time Statistics**: Average, min, max
- **Success Rate**: Percentage of successful iterations
- **Performance Classification**:
  - ✅ Excellent (< 5s average)
  - ⚠️ Moderate (5-15s average)
  - ❌ Poor (> 15s average)

## 🔧 Configuration

### Jest Configuration

- **Test Environment**: jsdom
- **Coverage**: Enabled with multiple reporters
- **Timeout**: 30 seconds default

### Playwright Configuration

- **Browser**: Chromium (with Chrome fallback)
- **Timeout**: 1 hour for performance tests
- **Base URL**: http://localhost:3000
- **Auto-start**: Next.js dev server

## 📝 Notes

- **Intentional Performance Issues**: Tests are designed to work with the "bad query" implementation
- **Before/After Comparison**: Perfect for measuring refactoring improvements
- **Real-world Simulation**: Tests simulate actual user behavior
- **Comprehensive Coverage**: Both API and UI testing included

For detailed documentation, see:

- [API_STABILITY_TESTING.md](./API_STABILITY_TESTING.md)
- [README.md](./README.md#testing)
