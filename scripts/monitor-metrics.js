const axios = require("axios");

async function checkMetrics() {
  console.log("\n🔍 Checking Metrics Status...\n");

  try {
    // Check Next.js metrics endpoint
    console.log("1. Checking Next.js metrics endpoint...");
    const metrics = await axios.get("http://localhost:3000/api/metrics");
    console.log("✅ Next.js metrics endpoint OK");
    console.log(`   Response length: ${metrics.data.length} characters`);

    // Check if metrics contain expected data
    const hasHttpRequests = metrics.data.includes("http_requests_total");
    const hasHttpDuration = metrics.data.includes(
      "http_request_duration_seconds"
    );
    const hasProcessMetrics = metrics.data.includes(
      "process_resident_memory_bytes"
    );

    console.log(`   HTTP requests metric: ${hasHttpRequests ? "✅" : "❌"}`);
    console.log(`   HTTP duration metric: ${hasHttpDuration ? "✅" : "❌"}`);
    console.log(`   Process metrics: ${hasProcessMetrics ? "✅" : "❌"}`);
  } catch (error) {
    console.log("❌ Next.js metrics endpoint ERROR:", error.message);
  }

  try {
    // Check Prometheus targets
    console.log("\n2. Checking Prometheus targets...");
    const targets = await axios.get("http://localhost:9090/api/v1/targets");
    const nextjsTarget = targets.data.data.activeTargets.find(
      (t) => t.labels.job === "nextjs-app"
    );

    if (nextjsTarget) {
      console.log(`✅ Prometheus target found: ${nextjsTarget.labels.job}`);
      console.log(`   Health: ${nextjsTarget.health}`);
      console.log(`   Last scrape: ${nextjsTarget.lastScrape}`);
      console.log(`   Last error: ${nextjsTarget.lastError || "None"}`);
    } else {
      console.log("❌ Prometheus target not found");
    }
  } catch (error) {
    console.log("❌ Prometheus targets ERROR:", error.message);
    console.log("   Make sure Prometheus is running on http://localhost:9090");
  }

  try {
    // Check Prometheus metrics
    console.log("\n3. Checking Prometheus metrics...");
    const promMetrics = await axios.get(
      "http://localhost:9090/api/v1/query?query=http_requests_total"
    );

    if (promMetrics.data.data.result.length > 0) {
      console.log("✅ Prometheus has metrics data");
      console.log(
        `   Found ${promMetrics.data.data.result.length} metric series`
      );
    } else {
      console.log("❌ No metrics data in Prometheus");
    }
  } catch (error) {
    console.log("❌ Prometheus metrics ERROR:", error.message);
  }

  try {
    // Check remote write status
    console.log("\n4. Checking remote write status...");
    const config = await axios.get(
      "http://localhost:9090/api/v1/status/config"
    );
    const configText = config.data.data.yaml;

    if (configText.includes("remote_write")) {
      console.log("✅ Remote write configured");

      // Check if credentials are placeholder
      if (
        configText.includes("YOUR_INSTANCE_ID") ||
        configText.includes("YOUR_API_KEY")
      ) {
        console.log("❌ Grafana Cloud credentials not configured");
        console.log(
          "   Update prometheus.yml with your Grafana Cloud credentials"
        );
      } else {
        console.log("✅ Grafana Cloud credentials configured");
      }
    } else {
      console.log("❌ Remote write not configured");
    }
  } catch (error) {
    console.log("❌ Remote write check ERROR:", error.message);
  }

  console.log("\n📋 Summary:");
  console.log("If you see ❌ errors above, follow these steps:");
  console.log("1. Make sure Next.js app is running on port 3000");
  console.log("2. Make sure Prometheus is running on port 9090");
  console.log("3. Update prometheus.yml with your Grafana Cloud credentials");
  console.log("4. Check Grafana Cloud dashboard and data source configuration");
  console.log("\nFor detailed setup guide, see PROMETHEUS_SETUP.md");
}

// Run immediately
checkMetrics();

// Run every 30 seconds
setInterval(checkMetrics, 30000);

console.log("🚀 Metrics monitoring started. Press Ctrl+C to stop.");
