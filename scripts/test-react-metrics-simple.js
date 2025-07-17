const fetch = require("node-fetch");

async function testReactMetrics() {
  console.log("🚀 Testing React Component Metrics...");

  const baseUrl = "http://localhost:3000";

  try {
    // Test 1: Send direct metrics to the record endpoint
    console.log("📊 Sending direct React component metrics...");

    for (let i = 1; i <= 20; i++) {
      const renderTime = Math.random() * 0.1 + 0.01; // Random render time between 0.01-0.11 seconds

      const metricData = {
        metric: "react_component_render_duration_seconds",
        value: renderTime,
        labels: {
          component_name: "UsersPage",
          page: "users",
        },
      };

      try {
        const response = await fetch(`${baseUrl}/api/metrics/record`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metricData),
        });

        if (response.ok) {
          console.log(
            `✅ Metric ${i}/20 sent successfully (render time: ${renderTime.toFixed(
              3
            )}s)`
          );
        } else {
          console.log(`❌ Failed to send metric ${i}: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error sending metric ${i}: ${error.message}`);
      }

      // Wait between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Test 2: Send UserCard component metrics
    console.log("📊 Sending UserCard component metrics...");

    for (let i = 1; i <= 30; i++) {
      const renderTime = Math.random() * 0.05 + 0.005; // Random render time between 0.005-0.055 seconds

      const metricData = {
        metric: "react_component_render_duration_seconds",
        value: renderTime,
        labels: {
          component_name: "UserCard",
          page: "users",
        },
      };

      try {
        const response = await fetch(`${baseUrl}/api/metrics/record`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metricData),
        });

        if (response.ok) {
          console.log(
            `✅ UserCard metric ${i}/30 sent successfully (render time: ${renderTime.toFixed(
              3
            )}s)`
          );
        } else {
          console.log(
            `❌ Failed to send UserCard metric ${i}: ${response.status}`
          );
        }
      } catch (error) {
        console.log(`❌ Error sending UserCard metric ${i}: ${error.message}`);
      }

      // Wait between requests
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log("🎉 React metrics test completed!");
    console.log(
      "📊 Check your Grafana dashboard for React component render time data"
    );
    console.log("🔍 You can also check Prometheus at: http://localhost:9090");
    console.log("📈 Query: react_component_render_duration_seconds");
  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

// Check if node-fetch is available
try {
  require("node-fetch");
  testReactMetrics();
} catch (error) {
  console.log("📦 Installing node-fetch...");
  const { execSync } = require("child_process");
  execSync("npm install node-fetch@2", { stdio: "inherit" });
  console.log("✅ node-fetch installed, running test...");
  testReactMetrics();
}
