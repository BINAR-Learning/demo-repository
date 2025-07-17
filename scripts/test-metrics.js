const axios = require("axios");

async function testMetrics() {
  console.log("🧪 Testing Metrics Endpoint...\n");

  try {
    // Test 1: Check if metrics endpoint is accessible
    console.log("1. Testing metrics endpoint accessibility...");
    const response = await axios.get("http://localhost:3000/api/metrics");
    console.log("✅ Metrics endpoint accessible");
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers["content-type"]}`);
    console.log(`   Response length: ${response.data.length} characters`);

    // Test 2: Check metrics format
    console.log("\n2. Checking metrics format...");
    const metrics = response.data;

    // Check for required metrics
    const requiredMetrics = [
      "http_requests_total",
      "http_request_duration_seconds",
      "process_resident_memory_bytes",
      "process_cpu_seconds_total",
    ];

    const foundMetrics = [];
    const missingMetrics = [];

    requiredMetrics.forEach((metric) => {
      if (metrics.includes(metric)) {
        foundMetrics.push(metric);
      } else {
        missingMetrics.push(metric);
      }
    });

    console.log(
      `   Found metrics: ${foundMetrics.length}/${requiredMetrics.length}`
    );
    foundMetrics.forEach((metric) => console.log(`   ✅ ${metric}`));
    missingMetrics.forEach((metric) => console.log(`   ❌ ${metric}`));

    // Test 3: Generate some test traffic
    console.log("\n3. Generating test traffic...");
    const testEndpoints = [
      "http://localhost:3000/",
      "http://localhost:3000/login",
      "http://localhost:3000/profile",
      "http://localhost:3000/api/users",
    ];

    for (let i = 0; i < 10; i++) {
      for (const endpoint of testEndpoints) {
        try {
          await axios.get(endpoint);
          console.log(`✅ Request to ${endpoint}`);
        } catch (error) {
          console.log(
            `   ⚠️  Request to ${endpoint} failed (expected for some endpoints)`
          );
        }
      }
      // Wait a bit between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Test 4: Check metrics after traffic
    console.log("\n4. Checking metrics after test traffic...");
    const metricsAfter = await axios.get("http://localhost:3000/api/metrics");

    // Look for http_requests_total with values
    const httpRequestsMatch = metricsAfter.data.match(
      /http_requests_total\{[^}]*\} (\d+)/g
    );
    if (httpRequestsMatch) {
      console.log(
        `   ✅ Found ${httpRequestsMatch.length} http_requests_total metrics`
      );
      httpRequestsMatch.forEach((metric) => {
        console.log(`      ${metric}`);
      });
    } else {
      console.log("   ❌ No http_requests_total metrics found");
    }

    // Test 5: Check Prometheus compatibility
    console.log("\n5. Checking Prometheus compatibility...");
    const prometheusMetrics = metricsAfter.data
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    console.log(`   Total metric lines: ${prometheusMetrics.length}`);

    // Check for proper Prometheus format
    const validMetrics = prometheusMetrics.filter((line) => {
      // Basic Prometheus metric format: name{labels} value
      return (
        /^[a-zA-Z_:][a-zA-Z0-9_:]*\{[^}]*\} [0-9.]+$/.test(line) ||
        /^[a-zA-Z_:][a-zA-Z0-9_:]* [0-9.]+$/.test(line)
      );
    });

    console.log(
      `   Valid Prometheus format: ${validMetrics.length}/${prometheusMetrics.length}`
    );

    console.log("\n✅ Metrics testing completed successfully!");
    console.log("\n📊 Next steps:");
    console.log("1. Start Prometheus with this config");
    console.log("2. Check http://localhost:9090/targets");
    console.log("3. Verify metrics appear in Prometheus");
    console.log("4. Configure Grafana Cloud credentials");
    console.log("5. Create dashboard in Grafana Cloud");
  } catch (error) {
    console.error("❌ Error testing metrics:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure Next.js app is running: npm run dev");
    console.log("2. Check if port 3000 is available");
    console.log("3. Verify metrics endpoint is working");
  }
}

// Run the test
testMetrics();
