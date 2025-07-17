# API Stability Testing Guide

## Overview

This project includes automated testing to validate the stability and performance of the `/api/users` endpoint. The tests simulate real-world usage patterns by making multiple consecutive and concurrent requests to ensure the API remains stable under load.

## Test Features

### 🎯 What the Tests Validate

1. **Response Stability**: Ensures all requests return status 200
2. **Data Consistency**: Validates that response data remains consistent across requests
3. **Performance Metrics**: Measures response times and identifies performance bottlenecks
4. **Concurrent Handling**: Tests how the API handles multiple simultaneous requests
5. **Error Handling**: Monitors and reports any failures or errors

### 📊 Test Metrics Collected

- **Success Rate**: Percentage of successful requests (target: ≥90%)
- **Response Time**: Average, minimum, and maximum response times
- **Data Length**: Consistency of user data returned
- **Error Analysis**: Detailed breakdown of any failures

## Running the Tests

### Quick Start

```bash
# Run the complete API stability test suite
npm run test:api-stability:run
```

### Individual Test Commands

```bash
# Run only the API stability tests
npm run test:api-stability

# Run all tests including API stability
npm test
```

### Test Configuration

The tests are configured in `__tests__/api-stability.test.ts` with the following parameters:

- **Total Requests**: 100 consecutive requests
- **Concurrent Requests**: 10 simultaneous requests
- **Timeout**: 5 minutes for the main test, 1 minute for concurrent test
- **Success Rate Threshold**: 90% minimum success rate
- **Response Time Limit**: 10 seconds maximum per request

## Test Scenarios

### 1. Consecutive Request Test

- Makes 100 sequential requests to `/api/users`
- Validates response consistency and performance
- Reports detailed statistics and error analysis

### 2. Concurrent Request Test

- Makes 10 simultaneous requests
- Tests API's ability to handle parallel load
- Ensures no race conditions or data corruption

### 3. Response Structure Validation

- Validates API response format and data types
- Ensures all required fields are present
- Checks user object structure consistency

## Expected Results

### ✅ Successful Test Run

```
🚀 Starting stability test: 100 requests to /api/users
============================================================
✅ Request 10/100 - Status: 200, Time: 245ms, Users: 15
✅ Request 20/100 - Status: 200, Time: 238ms, Users: 15
...
============================================================
📊 Test Results Summary:
============================================================
📈 Success Rate: 100/100 (100.00%)
❌ Failed Requests: 0
⏱️  Response Time Statistics:
   - Average: 245.32ms
   - Min: 180ms
   - Max: 320ms
📊 Data Length Statistics:
   - Average: 15.00 users
   - Min: 15 users
   - Max: 15 users
============================================================
🔍 Stability Validation:
============================================================
✅ All stability checks passed!
🎯 Success Rate: 100.00%
⚡ Average Response Time: 245.32ms
📊 Consistent Data: Yes
```

### ❌ Failed Test Run

If tests fail, you'll see detailed error information including:

- Specific request numbers that failed
- Error messages and status codes
- Performance degradation indicators
- Data inconsistency warnings

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Ensure your database is running and accessible
   - Check database credentials in environment variables

2. **Timeout Errors**

   - Increase timeout values in test configuration
   - Check for database performance issues
   - Monitor server resources during testing

3. **Data Inconsistency**
   - Verify database seeding is complete
   - Check for concurrent data modifications
   - Ensure proper database isolation

### Performance Optimization

If response times are consistently high:

1. **Database Optimization**

   - Add indexes to frequently queried columns
   - Optimize SQL queries in the API route
   - Consider query result caching

2. **API Optimization**
   - Implement response caching
   - Add pagination to large datasets
   - Optimize data processing logic

## Customization

### Modifying Test Parameters

Edit `__tests__/api-stability.test.ts` to adjust:

```typescript
// Change number of requests
const totalRequests = 200; // Default: 100

// Change concurrent request count
const concurrentRequests = 20; // Default: 10

// Adjust timeout values
}, 600000); // Default: 300000 (5 minutes)

// Modify success rate threshold
expect(successRate).toBeGreaterThanOrEqual(95); // Default: 90
```

### Adding New Test Scenarios

To add additional test scenarios:

1. Create a new test function in the same file
2. Follow the existing pattern for request handling
3. Add appropriate assertions and logging
4. Update the test script if needed

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: API Stability Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "20"
      - run: npm install
      - run: npm run test:api-stability
```

### Pre-commit Hook

Add to your pre-commit configuration:

```json
{
  "hooks": {
    "pre-commit": "npm run test:api-stability"
  }
}
```

## Monitoring and Alerts

### Performance Thresholds

Set up monitoring for:

- Response time > 5 seconds
- Success rate < 90%
- Error rate > 5%

### Metrics Collection

The tests automatically collect metrics that can be integrated with:

- Grafana dashboards
- Prometheus monitoring
- Application performance monitoring (APM) tools

## Support

For issues with the API stability tests:

1. Check the test output for specific error messages
2. Verify database connectivity and data integrity
3. Review recent code changes that might affect the API
4. Check server logs for additional error details

---

**Note**: These tests are designed to run against a development or staging environment. For production testing, ensure proper data isolation and consider using a dedicated test database.
