const axios = require("axios");

async function testPerformance() {
  console.log("🧪 Testing API & React Component Performance Monitoring...\n");

  try {
    // Test 1: API Performance
    console.log("1. Testing API Performance...");

    for (let i = 0; i < 20; i++) {
      const start = Date.now();

      try {
        // Simulate API call with varying response times
        const response = await axios.get("http://localhost:3000/api/users");
        const duration = (Date.now() - start) / 1000;

        console.log(`   ✅ API request ${i + 1}/20: ${duration.toFixed(3)}s`);

        // Record API metric
        await axios.post("http://localhost:3000/api/metrics/record", {
          metric: "api_response_duration_seconds",
          value: duration,
          labels: {
            method: "GET",
            route: "/api/users",
            status_code: response.status.toString(),
            endpoint_type: "api",
          },
        });

        await axios.post("http://localhost:3000/api/metrics/record", {
          metric: "api_requests_total",
          value: 1,
          labels: {
            method: "GET",
            route: "/api/users",
            status_code: response.status.toString(),
            endpoint_type: "api",
          },
        });
      } catch (error) {
        const duration = (Date.now() - start) / 1000;
        console.log(
          `   ⚠️  API request ${i + 1}/20 failed: ${duration.toFixed(3)}s`
        );

        // Record error metric
        await axios.post("http://localhost:3000/api/metrics/record", {
          metric: "api_response_duration_seconds",
          value: duration,
          labels: {
            method: "GET",
            route: "/api/users",
            status_code: "500",
            endpoint_type: "api",
          },
        });
      }

      // Random delay between requests
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500)
      );
    }

    // Test 2: React Component Performance (simulated)
    console.log("\n2. Testing React Component Performance (simulated)...");

    for (let i = 0; i < 15; i++) {
      // Simulate component render time (0.1ms to 2s)
      const renderTime = Math.random() * 2 + 0.001;

      console.log(
        `   ✅ Component render ${i + 1}/15: ${renderTime.toFixed(3)}s`
      );

      // Record React component metric
      await axios.post("http://localhost:3000/api/metrics/record", {
        metric: "react_component_render_duration_seconds",
        value: renderTime,
        labels: {
          component_name: i % 2 === 0 ? "UserList" : "UserProfile",
          page: i % 3 === 0 ? "users" : i % 3 === 1 ? "profile" : "dashboard",
        },
      });

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 500 + 200)
      );
    }

    // Test 3: Check metrics endpoint
    console.log("\n3. Checking metrics endpoint...");
    const metricsResponse = await axios.get(
      "http://localhost:3000/api/metrics"
    );
    const metrics = metricsResponse.data;

    // Check for new metrics
    const hasApiResponseTime = metrics.includes(
      "api_response_duration_seconds"
    );
    const hasApiRequestsTotal = metrics.includes("api_requests_total");
    const hasReactRenderTime = metrics.includes(
      "react_component_render_duration_seconds"
    );

    console.log(
      `   API response time metric: ${hasApiResponseTime ? "✅" : "❌"}`
    );
    console.log(
      `   API requests total metric: ${hasApiRequestsTotal ? "✅" : "❌"}`
    );
    console.log(
      `   React render time metric: ${hasReactRenderTime ? "✅" : "❌"}`
    );

    console.log("\n✅ Performance testing completed successfully!");
    console.log("\n📊 Next steps:");
    console.log("1. Check Grafana dashboard for new metrics");
    console.log("2. Verify API response time panels");
    console.log("3. Verify React component render time panels");
    console.log(
      "4. Test with real React components using usePerformanceMonitor hook"
    );
  } catch (error) {
    console.error("❌ Error testing performance:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure Next.js app is running: npm run dev");
    console.log("2. Check if metrics recording endpoint is working");
    console.log("3. Verify Prometheus is scraping metrics");
  }
}

// Run the test
testPerformance();
