import { test, expect } from "@playwright/test";

test("Debug: cek server dan API users", async ({ page }) => {
  test.setTimeout(60000); // 1 menit

  console.log("🔍 Checking if server is running...");

  try {
    // Cek apakah server bisa diakses
    await page.goto("http://localhost:3000");
    console.log("✅ Server bisa diakses");

    // Cek halaman users
    await page.goto("http://localhost:3000/users");
    console.log("✅ Halaman /users bisa diakses");

    // Cek API response
    const response = await page.waitForResponse(
      (resp) => resp.url().includes("/api/users"),
      { timeout: 10000 }
    );

    console.log(`✅ API Response status: ${response.status()}`);

    if (response.status() === 200) {
      const data = await response.json();
      console.log(`✅ API Response data: ${JSON.stringify(data, null, 2)}`);
      expect(data.users).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
    } else {
      console.log(`❌ API Response error: ${response.status()}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
});
