const fetch = require("node-fetch");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testEndpoint(url, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return {
      success: response.ok,
      status: response.status,
      data: await response.text(),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function fullReactMetricsTest() {
  console.log("🚀 Starting Full React Metrics Test...\n");

  const baseUrl = "http://localhost:3000";
  const prometheusUrl = "http://localhost:9090";

  // Step 1: Test application is running
  console.log("📋 Step 1: Testing application availability...");
  const appTest = await testEndpoint(`${baseUrl}/api/metrics`);
  if (appTest.success) {
    console.log("✅ Application is running");
  } else {
    console.log(
      "❌ Application is not running. Please start with: npm run dev"
    );
    return;
  }

  // Step 2: Test metrics record endpoint
  console.log("\n📋 Step 2: Testing metrics record endpoint...");
  const recordTest = await testEndpoint(
    `${baseUrl}/api/metrics/record`,
    "POST",
    {
      metric: "react_component_render_duration_seconds",
      value: 0.05,
      labels: {
        component_name: "TestComponent",
        page: "test",
      },
    }
  );

  if (recordTest.success) {
    console.log("✅ Metrics record endpoint is working");
  } else {
    console.log(
      "❌ Metrics record endpoint failed:",
      recordTest.error || recordTest.status
    );
  }

  // Step 3: Generate test data
  console.log("\n📋 Step 3: Generating test data...");
  const testData = [
    { component: "UsersPage", page: "users", count: 20 },
    { component: "UserCard", page: "users", count: 30 },
    { component: "TestComponent", page: "test", count: 10 },
  ];

  let totalSent = 0;
  for (const data of testData) {
    console.log(`📊 Sending ${data.count} metrics for ${data.component}...`);

    for (let i = 0; i < data.count; i++) {
      const renderTime = Math.random() * 0.1 + 0.01;

      const result = await testEndpoint(
        `${baseUrl}/api/metrics/record`,
        "POST",
        {
          metric: "react_component_render_duration_seconds",
          value: renderTime,
          labels: {
            component_name: data.component,
            page: data.page,
          },
        }
      );

      if (result.success) {
        totalSent++;
      }

      await delay(100); // Small delay between requests
    }
  }

  console.log(`✅ Sent ${totalSent} metrics successfully`);

  // Step 4: Test Prometheus availability
  console.log("\n📋 Step 4: Testing Prometheus availability...");
  const prometheusTest = await testEndpoint(
    `${prometheusUrl}/api/v1/query?query=up`
  );

  if (prometheusTest.success) {
    console.log("✅ Prometheus is running");
  } else {
    console.log("❌ Prometheus is not running. Please start Prometheus");
    return;
  }

  // Step 5: Test PromQL queries
  console.log("\n📋 Step 5: Testing PromQL queries...");
  const queries = [
    "react_component_render_duration_seconds",
    "react_component_render_duration_seconds_sum",
    "react_component_render_duration_seconds_count",
    "rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])",
  ];

  for (const query of queries) {
    console.log(`🔍 Testing query: ${query}`);
    const result = await testEndpoint(
      `${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`
    );

    if (result.success) {
      try {
        const data = JSON.parse(result.data);
        if (
          data.status === "success" &&
          data.data.result &&
          data.data.result.length > 0
        ) {
          console.log(
            `✅ Query successful - Found ${data.data.result.length} results`
          );
        } else {
          console.log(`⚠️  Query successful but no data found`);
        }
      } catch (e) {
        console.log(`❌ Failed to parse response`);
      }
    } else {
      console.log(`❌ Query failed: ${result.error || result.status}`);
    }

    await delay(500);
  }

  // Step 6: Test specific component queries
  console.log("\n📋 Step 6: Testing component-specific queries...");
  const componentQueries = [
    'react_component_render_duration_seconds{component_name="UsersPage"}',
    'react_component_render_duration_seconds{component_name="UserCard"}',
    'rate(react_component_render_duration_seconds_sum{component_name="UsersPage"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UsersPage"}[5m])',
  ];

  for (const query of componentQueries) {
    console.log(`🔍 Testing component query: ${query}`);
    const result = await testEndpoint(
      `${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`
    );

    if (result.success) {
      try {
        const data = JSON.parse(result.data);
        if (
          data.status === "success" &&
          data.data.result &&
          data.data.result.length > 0
        ) {
          console.log(
            `✅ Component query successful - Found ${data.data.result.length} results`
          );
          data.data.result.forEach((r, idx) => {
            console.log(`   Result ${idx + 1}: ${JSON.stringify(r.metric)}`);
          });
        } else {
          console.log(`⚠️  Component query successful but no data found`);
        }
      } catch (e) {
        console.log(`❌ Failed to parse component query response`);
      }
    } else {
      console.log(
        `❌ Component query failed: ${result.error || result.status}`
      );
    }

    await delay(500);
  }

  // Step 7: Final verification
  console.log("\n📋 Step 7: Final verification...");
  console.log("🔍 Checking metrics endpoint for React metrics...");

  const metricsResponse = await testEndpoint(`${baseUrl}/api/metrics`);
  if (metricsResponse.success) {
    const hasReactMetrics = metricsResponse.data.includes(
      "react_component_render_duration_seconds"
    );
    if (hasReactMetrics) {
      console.log("✅ React metrics found in metrics endpoint");
    } else {
      console.log("❌ React metrics not found in metrics endpoint");
    }
  }

  console.log("\n🎉 Full React Metrics Test Completed!");
  console.log("\n📊 Next Steps:");
  console.log(
    "1. Check Grafana dashboard for React component render time data"
  );
  console.log(
    "2. If no data appears, try the queries from the troubleshooting guide"
  );
  console.log(
    '3. Verify time range in Grafana is set to "Last 1 hour" or longer'
  );
  console.log("4. Check if Prometheus remote write is configured correctly");

  console.log("\n🔗 Useful URLs:");
  console.log(`- Application: ${baseUrl}`);
  console.log(`- Metrics: ${baseUrl}/api/metrics`);
  console.log(`- Prometheus: ${prometheusUrl}`);
  console.log(`- Users Page: ${baseUrl}/users`);
}

// Check if node-fetch is available
try {
  require("node-fetch");
  fullReactMetricsTest();
} catch (error) {
  console.log("📦 Installing node-fetch...");
  const { execSync } = require("child_process");
  execSync("npm install node-fetch@2", { stdio: "inherit" });
  console.log("✅ node-fetch installed, running full test...");
  fullReactMetricsTest();
}
