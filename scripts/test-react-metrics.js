const puppeteer = require("puppeteer");

async function testReactMetrics() {
  console.log("🚀 Testing React Component Metrics...");

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Enable performance monitoring
    await page.setViewport({ width: 1280, height: 720 });

    console.log("📊 Navigating to login page...");
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle2",
    });

    // Login
    console.log("🔐 Logging in...");
    await page.type('input[name="username"]', "admin");
    await page.type('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Wait for redirect to users page
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("✅ Logged in successfully");

    // Navigate to users page multiple times to generate metrics
    console.log("📈 Generating React component metrics...");

    for (let i = 1; i <= 10; i++) {
      console.log(`🔄 Visit ${i}/10: Navigating to users page...`);

      // Navigate to users page
      await page.goto("http://localhost:3000/users", {
        waitUntil: "networkidle2",
      });

      // Wait for page to load and render
      await page.waitForSelector("h1", { timeout: 10000 });

      // Scroll to trigger re-renders
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(1000);

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });

      await page.waitForTimeout(1000);

      // Change filters to trigger re-renders
      if (i % 2 === 0) {
        await page.select('select[value="createdAt"]', "fullName");
        await page.waitForTimeout(500);
        await page.select('select[value="fullName"]', "createdAt");
        await page.waitForTimeout(500);
      }

      console.log(`✅ Visit ${i} completed`);
      await page.waitForTimeout(2000); // Wait between visits
    }

    console.log("🎉 React metrics test completed!");
    console.log(
      "📊 Check your Grafana dashboard for React component render time data"
    );
  } catch (error) {
    console.error("❌ Error during test:", error);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  require("puppeteer");
  testReactMetrics();
} catch (error) {
  console.log("📦 Installing puppeteer...");
  const { execSync } = require("child_process");
  execSync("npm install puppeteer", { stdio: "inherit" });
  console.log("✅ Puppeteer installed, running test...");
  testReactMetrics();
}
