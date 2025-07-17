const axios = require("axios");

async function verifyGrafanaData() {
  console.log("🔍 Verifying Grafana Cloud Data Flow...\n");

  try {
    // Step 1: Check Next.js metrics
    console.log("1. Checking Next.js metrics endpoint...");
    const metricsResponse = await axios.get(
      "http://localhost:3000/api/metrics"
    );
    console.log("✅ Next.js metrics endpoint OK");

    // Check for specific metrics
    const metrics = metricsResponse.data;
    const hasHttpRequests = metrics.includes("http_requests_total");
    const hasHttpDuration = metrics.includes("http_request_duration_seconds");
    const hasDbDuration = metrics.includes("database_query_duration_seconds");

    console.log(`   HTTP requests metric: ${hasHttpRequests ? "✅" : "❌"}`);
    console.log(`   HTTP duration metric: ${hasHttpDuration ? "✅" : "❌"}`);
    console.log(`   Database duration metric: ${hasDbDuration ? "✅" : "❌"}`);
  } catch (error) {
    console.log("❌ Next.js metrics endpoint ERROR:", error.message);
    return;
  }

  try {
    // Step 2: Check Prometheus targets
    console.log("\n2. Checking Prometheus targets...");
    const targetsResponse = await axios.get(
      "http://localhost:9090/api/v1/targets"
    );
    const nextjsTarget = targetsResponse.data.data.activeTargets.find(
      (t) => t.labels.job === "nextjs-app"
    );

    if (nextjsTarget && nextjsTarget.health === "up") {
      console.log("✅ Prometheus target UP");
      console.log(`   Last scrape: ${nextjsTarget.lastScrape}`);
      console.log(`   Last error: ${nextjsTarget.lastError || "None"}`);
    } else {
      console.log("❌ Prometheus target DOWN or not found");
      console.log("   Please check Prometheus configuration");
      return;
    }
  } catch (error) {
    console.log("❌ Prometheus targets ERROR:", error.message);
    console.log("   Make sure Prometheus is running on http://localhost:9090");
    return;
  }

  try {
    // Step 3: Check Prometheus metrics
    console.log("\n3. Checking Prometheus metrics data...");
    const promMetricsResponse = await axios.get(
      "http://localhost:9090/api/v1/query?query=http_requests_total"
    );

    if (promMetricsResponse.data.data.result.length > 0) {
      console.log("✅ Prometheus has metrics data");
      console.log(
        `   Found ${promMetricsResponse.data.data.result.length} metric series`
      );

      // Show some sample data
      promMetricsResponse.data.data.result
        .slice(0, 3)
        .forEach((metric, index) => {
          console.log(
            `   ${index + 1}. ${metric.metric.__name__}${JSON.stringify(
              metric.metric
            )} = ${metric.value[1]}`
          );
        });
    } else {
      console.log("❌ No metrics data in Prometheus");
      console.log("   Generating test traffic...");

      // Generate some test traffic
      for (let i = 0; i < 10; i++) {
        try {
          await axios.get("http://localhost:3000/api/users");
          console.log(`   ✅ Generated request ${i + 1}/10`);
        } catch (error) {
          console.log(`   ⚠️  Request ${i + 1} failed (expected)`);
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Check again after generating traffic
      console.log("\n   Checking metrics again...");
      const newMetricsResponse = await axios.get(
        "http://localhost:9090/api/v1/query?query=http_requests_total"
      );
      if (newMetricsResponse.data.data.result.length > 0) {
        console.log("✅ Metrics now available in Prometheus");
      } else {
        console.log("❌ Still no metrics in Prometheus");
      }
    }
  } catch (error) {
    console.log("❌ Prometheus metrics ERROR:", error.message);
  }

  try {
    // Step 4: Check remote write configuration
    console.log("\n4. Checking remote write configuration...");
    const configResponse = await axios.get(
      "http://localhost:9090/api/v1/status/config"
    );
    const configText = configResponse.data.data.yaml;

    if (configText.includes("remote_write")) {
      console.log("✅ Remote write configured");

      if (
        configText.includes("YOUR_INSTANCE_ID") ||
        configText.includes("YOUR_API_KEY")
      ) {
        console.log("❌ Grafana Cloud credentials not configured");
        console.log("   Please update prometheus.yml with your credentials");
        console.log("   Then restart Prometheus");
      } else {
        console.log("✅ Grafana Cloud credentials configured");
      }
    } else {
      console.log("❌ Remote write not configured");
    }
  } catch (error) {
    console.log("❌ Remote write check ERROR:", error.message);
  }

  console.log("\n📋 Next Steps for Grafana Dashboard:");
  console.log("1. Make sure Prometheus is sending data to Grafana Cloud");
  console.log("2. In Grafana Cloud, create a new dashboard");
  console.log("3. Add panel with query: rate(http_requests_total[5m])");
  console.log('4. Set time range to "Last 1 hour" or "Last 6 hours"');
  console.log(
    '5. If still "No data", check Grafana Cloud data source connection'
  );

  console.log("\n🔧 Quick Test Queries for Grafana:");
  console.log("- Basic: up");
  console.log("- HTTP requests: http_requests_total");
  console.log("- Request rate: rate(http_requests_total[5m])");
  console.log("- Response time: http_request_duration_seconds");
  console.log("- Memory: process_resident_memory_bytes");
  console.log("- CPU: rate(process_cpu_seconds_total[5m])");
}

// Run the verification
verifyGrafanaData();
