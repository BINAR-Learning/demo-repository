import { GET } from "../src/app/api/users/route";
import { NextRequest } from "next/server";

describe("API Stability Test - /users endpoint", () => {
  test("should handle 100 consecutive requests with stable responses", async () => {
    const totalRequests = 100;
    const results: Array<{
      requestNumber: number;
      status: number;
      responseTime: number;
      dataLength: number;
      hasUsers: boolean;
      error?: string;
    }> = [];

    console.log(
      `🚀 Starting stability test: ${totalRequests} requests to /api/users`
    );
    console.log("=".repeat(60));

    // Execute 100 requests
    for (let i = 1; i <= totalRequests; i++) {
      const startTime = Date.now();

      try {
        const request = new NextRequest("http://localhost/api/users", {
          method: "GET",
        });

        const response = await GET(request);
        const responseTime = Date.now() - startTime;
        const data = await response.json();

        results.push({
          requestNumber: i,
          status: response.status,
          responseTime,
          dataLength: data.users ? data.users.length : 0,
          hasUsers: data.users && data.users.length > 0,
        });

        // Log progress every 10 requests
        if (i % 10 === 0) {
          console.log(
            `✅ Request ${i}/${totalRequests} - Status: ${
              response.status
            }, Time: ${responseTime}ms, Users: ${data.users?.length || 0}`
          );
        }
      } catch (error: unknown) {
        const responseTime = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          requestNumber: i,
          status: 500,
          responseTime,
          dataLength: 0,
          hasUsers: false,
          error: errorMessage,
        });

        console.log(
          `❌ Request ${i}/${totalRequests} - Error: ${errorMessage}`
        );
      }
    }

    console.log("=".repeat(60));
    console.log("📊 Test Results Summary:");
    console.log("=".repeat(60));

    // Analyze results
    const successfulRequests = results.filter((r) => r.status === 200);
    const failedRequests = results.filter((r) => r.status !== 200);
    const responseTimes = successfulRequests.map((r) => r.responseTime);
    const dataLengths = successfulRequests.map((r) => r.dataLength);

    // Calculate statistics
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const minResponseTime =
      responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime =
      responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    const avgDataLength =
      dataLengths.length > 0
        ? dataLengths.reduce((a, b) => a + b, 0) / dataLengths.length
        : 0;

    const minDataLength = dataLengths.length > 0 ? Math.min(...dataLengths) : 0;
    const maxDataLength = dataLengths.length > 0 ? Math.max(...dataLengths) : 0;

    // Print statistics
    console.log(
      `📈 Success Rate: ${successfulRequests.length}/${totalRequests} (${(
        (successfulRequests.length / totalRequests) *
        100
      ).toFixed(2)}%)`
    );
    console.log(`❌ Failed Requests: ${failedRequests.length}`);

    if (successfulRequests.length > 0) {
      console.log(`⏱️  Response Time Statistics:`);
      console.log(`   - Average: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   - Min: ${minResponseTime}ms`);
      console.log(`   - Max: ${maxResponseTime}ms`);

      console.log(`📊 Data Length Statistics:`);
      console.log(`   - Average: ${avgDataLength.toFixed(2)} users`);
      console.log(`   - Min: ${minDataLength} users`);
      console.log(`   - Max: ${maxDataLength} users`);
    }

    // Detailed error analysis
    if (failedRequests.length > 0) {
      console.log(`🔍 Error Analysis:`);
      const errorTypes = failedRequests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      Object.entries(errorTypes).forEach(([status, count]) => {
        console.log(`   - Status ${status}: ${count} requests`);
      });
    }

    // Stability checks
    console.log("=".repeat(60));
    console.log("🔍 Stability Validation:");
    console.log("=".repeat(60));

    // Test 1: All successful requests should return status 200
    expect(successfulRequests.length).toBeGreaterThan(0);
    expect(successfulRequests.every((r) => r.status === 200)).toBe(true);

    // Test 2: All successful requests should have users data
    expect(successfulRequests.every((r) => r.hasUsers)).toBe(true);

    // Test 3: Response time should be reasonable (less than 10 seconds)
    expect(maxResponseTime).toBeLessThan(10000);

    // Test 4: Data consistency - all responses should have similar user counts
    if (dataLengths.length > 1) {
      const dataLengthVariance =
        Math.max(...dataLengths) - Math.min(...dataLengths);
      expect(dataLengthVariance).toBeLessThanOrEqual(10); // Allow small variance
    }

    // Test 5: Success rate should be high (at least 90%)
    const successRate = (successfulRequests.length / totalRequests) * 100;
    expect(successRate).toBeGreaterThanOrEqual(90);

    console.log(`✅ All stability checks passed!`);
    console.log(`🎯 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`📊 Consistent Data: ${dataLengths.length > 0 ? "Yes" : "No"}`);
  }, 300000); // 5 minute timeout for 100 requests

  test("should handle concurrent requests", async () => {
    const concurrentRequests = 10;
    const promises = [];

    console.log(`🔄 Testing ${concurrentRequests} concurrent requests...`);

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        (async () => {
          try {
            const request = new NextRequest("http://localhost/api/users", {
              method: "GET",
            });
            const response = await GET(request);
            const data = await response.json();

            return {
              status: response.status,
              dataLength: data.users?.length || 0,
              hasUsers: data.users && data.users.length > 0,
            };
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            return {
              status: 500,
              dataLength: 0,
              hasUsers: false,
              error: errorMessage,
            };
          }
        })()
      );
    }

    const results = await Promise.all(promises);
    const successfulResults = results.filter((r) => r.status === 200);

    console.log(`📊 Concurrent Test Results:`);
    console.log(`   - Total Requests: ${concurrentRequests}`);
    console.log(`   - Successful: ${successfulResults.length}`);
    console.log(`   - Failed: ${results.length - successfulResults.length}`);

    // All concurrent requests should succeed
    expect(successfulResults.length).toBe(concurrentRequests);
    expect(successfulResults.every((r) => r.hasUsers)).toBe(true);
  }, 60000); // 1 minute timeout

  test("should validate API response structure consistency", async () => {
    const request = new NextRequest("http://localhost/api/users", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    // Validate response structure
    expect(data).toHaveProperty("users");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("activeUsers");
    expect(data).toHaveProperty("seniorUsers");
    expect(data).toHaveProperty("usersWithCompleteProfiles");
    expect(data).toHaveProperty("usersByDivision");
    expect(data).toHaveProperty("filteredBy");
    expect(data).toHaveProperty("message");

    // Validate data types
    expect(Array.isArray(data.users)).toBe(true);
    expect(typeof data.total).toBe("number");
    expect(typeof data.activeUsers).toBe("number");
    expect(typeof data.seniorUsers).toBe("number");
    expect(typeof data.usersWithCompleteProfiles).toBe("number");
    expect(typeof data.usersByDivision).toBe("object");
    expect(typeof data.filteredBy).toBe("string");
    expect(typeof data.message).toBe("string");

    // Validate user object structure (if users exist)
    if (data.users.length > 0) {
      const user = data.users[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("fullName");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("createdAt");
    }

    console.log(`✅ API response structure validation passed`);
    console.log(`📊 Response contains ${data.users.length} users`);
  });
});
