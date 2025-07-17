const fetch = require("node-fetch");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testEndpoint(url, method = "GET", headers = {}) {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: response.ok,
      status: response.status,
      duration,
      data: await response.text(),
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      error: error.message,
      duration,
    };
  }
}

async function testPerformance() {
  console.log("🚀 Starting Performance Test...\n");

  const baseUrl = "http://localhost:3000";
  const testConfig = {
    totalRequests: 20,
    concurrentRequests: 5,
    delayBetweenBatches: 1000, // 1 second
    endpoints: [
      { path: "/api/users", method: "GET", name: "Users API" },
      { path: "/api/profile", method: "GET", name: "Profile API" },
      { path: "/api/metrics", method: "GET", name: "Metrics API" },
    ],
  };

  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    durations: [],
    errors: [],
  };

  console.log(`📊 Test Configuration:`);
  console.log(`   - Total Requests: ${testConfig.totalRequests}`);
  console.log(`   - Concurrent Requests: ${testConfig.concurrentRequests}`);
  console.log(`   - Endpoints: ${testConfig.endpoints.length}`);
  console.log(`   - Base URL: ${baseUrl}\n`);

  // Test each endpoint
  for (const endpoint of testConfig.endpoints) {
    console.log(
      `🎯 Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})`
    );

    const endpointResults = {
      total: 0,
      successful: 0,
      failed: 0,
      durations: [],
      errors: [],
    };

    // Make requests in batches
    for (
      let batch = 0;
      batch <
      Math.ceil(testConfig.totalRequests / testConfig.concurrentRequests);
      batch++
    ) {
      const batchPromises = [];

      // Create concurrent requests for this batch
      for (let i = 0; i < testConfig.concurrentRequests; i++) {
        const requestNumber = batch * testConfig.concurrentRequests + i + 1;
        if (requestNumber <= testConfig.totalRequests) {
          batchPromises.push(
            testEndpoint(`${baseUrl}${endpoint.path}`, endpoint.method).then(
              (result) => {
                endpointResults.total++;
                results.total++;

                if (result.success) {
                  endpointResults.successful++;
                  results.successful++;
                  endpointResults.durations.push(result.duration);
                  results.durations.push(result.duration);

                  console.log(
                    `   ✅ Request ${requestNumber}/${testConfig.totalRequests} - ${result.duration}ms`
                  );
                } else {
                  endpointResults.failed++;
                  results.failed++;
                  endpointResults.errors.push(result.error);
                  results.errors.push(result.error);

                  console.log(
                    `   ❌ Request ${requestNumber}/${testConfig.totalRequests} - ${result.error} (${result.duration}ms)`
                  );
                }

                return result;
              }
            )
          );
        }
      }

      // Wait for all requests in this batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches
      if (
        batch <
        Math.ceil(testConfig.totalRequests / testConfig.concurrentRequests) - 1
      ) {
        await delay(testConfig.delayBetweenBatches);
      }
    }

    // Calculate statistics for this endpoint
    const avgDuration =
      endpointResults.durations.length > 0
        ? endpointResults.durations.reduce((a, b) => a + b, 0) /
          endpointResults.durations.length
        : 0;
    const minDuration =
      endpointResults.durations.length > 0
        ? Math.min(...endpointResults.durations)
        : 0;
    const maxDuration =
      endpointResults.durations.length > 0
        ? Math.max(...endpointResults.durations)
        : 0;
    const successRate =
      (endpointResults.successful / endpointResults.total) * 100;

    console.log(`\n📊 ${endpoint.name} Results:`);
    console.log(
      `   - Success Rate: ${endpointResults.successful}/${
        endpointResults.total
      } (${successRate.toFixed(1)}%)`
    );
    console.log(`   - Average Response Time: ${avgDuration.toFixed(2)}ms`);
    console.log(`   - Min Response Time: ${minDuration}ms`);
    console.log(`   - Max Response Time: ${maxDuration}ms`);
    console.log(`   - Failed Requests: ${endpointResults.failed}\n`);
  }

  // Overall statistics
  const overallAvgDuration =
    results.durations.length > 0
      ? results.durations.reduce((a, b) => a + b, 0) / results.durations.length
      : 0;
  const overallMinDuration =
    results.durations.length > 0 ? Math.min(...results.durations) : 0;
  const overallMaxDuration =
    results.durations.length > 0 ? Math.max(...results.durations) : 0;
  const overallSuccessRate = (results.successful / results.total) * 100;

  console.log("🎉 Performance Test Completed!");
  console.log("============================================================");
  console.log("📊 Overall Results Summary:");
  console.log("============================================================");
  console.log(
    `📈 Success Rate: ${results.successful}/${
      results.total
    } (${overallSuccessRate.toFixed(1)}%)`
  );
  console.log(`❌ Failed Requests: ${results.failed}`);
  console.log(`⏱️  Response Time Statistics:`);
  console.log(`   - Average: ${overallAvgDuration.toFixed(2)}ms`);
  console.log(`   - Min: ${overallMinDuration}ms`);
  console.log(`   - Max: ${overallMaxDuration}ms`);
  console.log("============================================================");

  // Performance classification
  let performanceClass = "";
  if (overallAvgDuration < 500) {
    performanceClass = "✅ Excellent (< 500ms)";
  } else if (overallAvgDuration < 2000) {
    performanceClass = "⚠️  Moderate (500ms - 2s)";
  } else {
    performanceClass = "❌ Poor (> 2s)";
  }

  console.log(`🏆 Performance Classification: ${performanceClass}`);
  console.log("============================================================");

  if (results.errors.length > 0) {
    console.log("\n🔍 Error Summary:");
    const errorCounts = {};
    results.errors.forEach((error) => {
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

    Object.entries(errorCounts).forEach(([error, count]) => {
      console.log(`   - ${error}: ${count} times`);
    });
  }

  console.log("\n📈 Next Steps:");
  console.log("1. Check application logs for errors");
  console.log("2. Monitor database performance");
  console.log("3. Check server resources (CPU, Memory)");
  console.log("4. Consider implementing caching if response times are high");

  return {
    success: overallSuccessRate >= 90,
    successRate: overallSuccessRate,
    averageResponseTime: overallAvgDuration,
    performanceClass,
  };
}

// Check if node-fetch is available
try {
  require("node-fetch");
  testPerformance();
} catch (error) {
  console.log("📦 Installing node-fetch...");
  const { execSync } = require("child_process");
  execSync("npm install node-fetch@2", { stdio: "inherit" });
  console.log("✅ node-fetch installed, running performance test...");
  testPerformance();
}
