import { test, expect } from "@playwright/test";

async function sendMetric(
  baseUrl: string,
  metricName: string,
  value: number,
  labels: Record<string, string> = {}
) {
  try {
    const response = await fetch(`${baseUrl}/api/metrics/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: metricName,
        value: value,
        labels: labels,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error(`Error sending metric ${metricName}:`, error);
    return false;
  }
}

test("Performance Test with Metrics: buka halaman /users 20x dan kirim metrics ke Prometheus", async ({
  page,
}) => {
  test.setTimeout(3600000); // 1 jam

  const baseUrl = "http://localhost:3000";
  const results: Array<{
    iteration: number;
    loadTime: number;
    userCount: number;
    status: "success" | "error";
    error?: string;
  }> = [];

  console.log("🚀 Starting Performance Test with Metrics - 20 iterations");
  console.log("📊 Metrics will be sent to Prometheus/Grafana");
  console.log("=".repeat(60));

  for (let i = 1; i <= 20; i++) {
    console.log(`🔄 Iterasi ke-${i}: Loading halaman /users...`);

    const startTime = Date.now();

    try {
      // Buka halaman users dan ukur waktu
      await page.goto("http://localhost:3000/users", {
        waitUntil: "domcontentloaded", // Tunggu sampai DOM selesai load (tidak tunggu network)
        timeout: 300000, // 5 menit timeout
      });

      const loadTime = Date.now() - startTime;

      // Tunggu sampai ada konten users di halaman
      const selectors = [
        "table tbody tr", // Table rows
        '[data-testid="user-item"]', // Test ID
        ".user-item", // CSS class
        '[class*="user"]', // Partial class
        "li", // List items
        'div[class*="card"]', // Card elements
      ];

      let userElements = 0;
      let usedSelector = "";

      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
          userElements = await page.locator(selector).count();
          if (userElements > 0) {
            usedSelector = selector;
            break;
          }
        } catch {
          // Continue to next selector
        }
      }

      // Fallback: cek apakah ada text yang menunjukkan ada users
      if (userElements === 0) {
        const pageText = await page.textContent("body");
        if (
          pageText &&
          (pageText.includes("user") ||
            pageText.includes("User") ||
            pageText.includes("@"))
        ) {
          userElements = 1; // At least some user data is present
          usedSelector = "text-content";
        }
      }

      // Send metrics to Prometheus
      const loadTimeSeconds = loadTime / 1000; // Convert to seconds

      // Send page load time metric
      await sendMetric(
        baseUrl,
        "e2e_page_load_duration_seconds",
        loadTimeSeconds,
        {
          page: "users",
          test_type: "playwright",
          iteration: i.toString(),
        }
      );

      // Send user count metric
      await sendMetric(baseUrl, "e2e_user_count", userElements, {
        page: "users",
        test_type: "playwright",
        iteration: i.toString(),
      });

      // Send test iteration metric
      await sendMetric(baseUrl, "e2e_test_iteration_total", 1, {
        page: "users",
        test_type: "playwright",
        status: "success",
      });

      // Log progress setiap 10 iterasi
      if (i % 10 === 0) {
        console.log(
          `✅ Iterasi ke-${i}: Load time: ${loadTime}ms, Users: ${userElements} (selector: ${usedSelector}) - Metrics sent to Prometheus`
        );
      } else {
        console.log(
          `✅ Iterasi ke-${i}: Load time: ${loadTime}ms, Users: ${userElements} - Metrics sent`
        );
      }

      results.push({
        iteration: i,
        loadTime,
        userCount: userElements,
        status: "success",
      });

      // Validasi minimal ada data
      expect(userElements).toBeGreaterThan(0);

      // Tunggu sebentar sebelum iterasi berikutnya
      await page.waitForTimeout(2000);
    } catch (error: unknown) {
      const loadTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Send error metrics
      const loadTimeSeconds = loadTime / 1000;

      await sendMetric(
        baseUrl,
        "e2e_page_load_duration_seconds",
        loadTimeSeconds,
        {
          page: "users",
          test_type: "playwright",
          iteration: i.toString(),
          status: "error",
        }
      );

      await sendMetric(baseUrl, "e2e_test_iteration_total", 1, {
        page: "users",
        test_type: "playwright",
        status: "error",
        error: errorMessage,
      });

      console.log(
        `❌ Iterasi ke-${i}: Error after ${loadTime}ms - ${errorMessage} - Error metrics sent`
      );

      results.push({
        iteration: i,
        loadTime,
        userCount: 0,
        status: "error",
        error: errorMessage,
      });

      throw error;
    }
  }

  // Analisis hasil
  console.log("=".repeat(60));
  console.log("📊 Performance Test Results:");
  console.log("=".repeat(60));

  const successfulResults = results.filter((r) => r.status === "success");
  const failedResults = results.filter((r) => r.status === "error");

  if (successfulResults.length > 0) {
    const loadTimes = successfulResults.map((r) => r.loadTime);
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    const minLoadTime = Math.min(...loadTimes);
    const maxLoadTime = Math.max(...loadTimes);

    // Send summary metrics
    await sendMetric(
      baseUrl,
      "e2e_test_summary_avg_load_time_seconds",
      avgLoadTime / 1000,
      {
        page: "users",
        test_type: "playwright",
        metric_type: "average",
      }
    );

    await sendMetric(
      baseUrl,
      "e2e_test_summary_min_load_time_seconds",
      minLoadTime / 1000,
      {
        page: "users",
        test_type: "playwright",
        metric_type: "minimum",
      }
    );

    await sendMetric(
      baseUrl,
      "e2e_test_summary_max_load_time_seconds",
      maxLoadTime / 1000,
      {
        page: "users",
        test_type: "playwright",
        metric_type: "maximum",
      }
    );

    await sendMetric(
      baseUrl,
      "e2e_test_summary_success_rate",
      (successfulResults.length / 20) * 100,
      {
        page: "users",
        test_type: "playwright",
        metric_type: "success_rate",
      }
    );

    console.log(
      `📈 Success Rate: ${successfulResults.length}/20 (${(
        (successfulResults.length / 20) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`⏱️  Load Time Statistics:`);
    console.log(`   - Average: ${avgLoadTime.toFixed(0)}ms`);
    console.log(`   - Min: ${minLoadTime}ms`);
    console.log(`   - Max: ${maxLoadTime}ms`);

    // Performance thresholds untuk before/after comparison
    console.log(`🎯 Performance Analysis:`);
    if (avgLoadTime < 5000) {
      console.log(`   - ✅ Excellent performance (< 5s average)`);
    } else if (avgLoadTime < 15000) {
      console.log(
        `   - ⚠️  Moderate performance (5-15s average) - needs optimization`
      );
    } else {
      console.log(
        `   - ❌ Poor performance (> 15s average) - requires refactoring`
      );
    }
  }

  if (failedResults.length > 0) {
    console.log(`❌ Failed iterations: ${failedResults.length}`);
    failedResults.forEach((r) => {
      console.log(`   - Iteration ${r.iteration}: ${r.error}`);
    });
  }

  console.log("=".repeat(60));
  console.log("🎉 Performance test with metrics completed!");
  console.log("📊 Metrics sent to Prometheus/Grafana:");
  console.log("   - e2e_page_load_duration_seconds");
  console.log("   - e2e_user_count");
  console.log("   - e2e_test_iteration_total");
  console.log("   - e2e_test_summary_*");
  console.log("💡 Check Grafana dashboard for E2E test metrics");

  // Test assertions
  expect(successfulResults.length).toBeGreaterThan(0);
  expect(successfulResults.every((r) => r.userCount > 0)).toBe(true);
});
