#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Starting API Stability Test Suite");
console.log("=".repeat(60));
console.log("This test will simulate 20 requests to /api/users");
console.log("and validate response stability and performance.");
console.log("=".repeat(60));

try {
  // Run the API stability test
  const testCommand = "npm run test:api-stability";
  console.log(`Executing: ${testCommand}`);
  console.log("");

  execSync(testCommand, {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("");
  console.log("✅ API Stability Test completed successfully!");
} catch (error) {
  console.error("");
  console.error("❌ API Stability Test failed!");
  console.error("Check the output above for details.");
  process.exit(1);
}
