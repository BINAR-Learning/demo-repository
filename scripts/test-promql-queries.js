const fetch = require("node-fetch");

async function testPromQLQueries() {
  console.log("🔍 Testing PromQL Queries...");

  const prometheusUrl = "http://localhost:9090";

  const queries = [
    // Basic metric query
    "react_component_render_duration_seconds",

    // Sum and count queries
    "react_component_render_duration_seconds_sum",
    "react_component_render_duration_seconds_count",

    // Rate queries
    "rate(react_component_render_duration_seconds_sum[5m])",
    "rate(react_component_render_duration_seconds_count[5m])",

    // Average query (same as Grafana)
    "rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])",

    // Filtered queries
    'react_component_render_duration_seconds{component_name="UsersPage"}',
    'react_component_render_duration_seconds{component_name="UserCard"}',

    // Filtered average queries
    'rate(react_component_render_duration_seconds_sum{component_name="UsersPage"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UsersPage"}[5m])',
    'rate(react_component_render_duration_seconds_sum{component_name="UserCard"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UserCard"}[5m])',

    // 95th percentile
    "histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m]))",

    // Total renders per second
    "rate(react_component_render_duration_seconds_count[5m])",
  ];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n📊 Testing Query ${i + 1}: ${query}`);

    try {
      const response = await fetch(
        `${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.status === "success") {
        if (data.data.result && data.data.result.length > 0) {
          console.log(
            `✅ Query successful - Found ${data.data.result.length} results`
          );
          data.data.result.forEach((result, idx) => {
            console.log(
              `   Result ${idx + 1}: ${JSON.stringify(result.metric)} = ${
                result.value[1]
              }`
            );
          });
        } else {
          console.log(`⚠️  Query successful but no data found`);
        }
      } else {
        console.log(`❌ Query failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.log(`❌ Error executing query: ${error.message}`);
    }

    // Wait between queries
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n🎉 PromQL query testing completed!");
  console.log("\n📋 Summary:");
  console.log(
    "- If basic metric queries return no data, metrics are not being sent"
  );
  console.log(
    "- If basic queries work but rate queries don't, there might be timing issues"
  );
  console.log("- If filtered queries don't work, check label names and values");
}

// Check if node-fetch is available
try {
  require("node-fetch");
  testPromQLQueries();
} catch (error) {
  console.log("📦 Installing node-fetch...");
  const { execSync } = require("child_process");
  execSync("npm install node-fetch@2", { stdio: "inherit" });
  console.log("✅ node-fetch installed, running test...");
  testPromQLQueries();
}
