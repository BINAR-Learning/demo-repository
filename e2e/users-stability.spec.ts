import { test, expect } from "@playwright/test";

test("Stability: buka halaman /users 5x dan cek API", async ({ page }) => {
  // Set timeout lebih lama untuk test ini
  test.setTimeout(3600000); // 1 jam

  for (let i = 1; i <= 5; i++) {
    // Listen for the /api/users response dengan timeout yang lebih lama
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/users") && resp.status() === 200,
      { timeout: 300000 } // 5 menit timeout untuk response
    );
    await page.goto("http://localhost:3000/users");
    const response = await responsePromise;
    
    // Tunggu sebentar sebelum parse JSON untuk memastikan response selesai
    await page.waitForTimeout(2000);
    
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.log(`❌ Error parsing JSON pada iterasi ${i}:`, error);
      // Coba ambil response text sebagai fallback
      const text = await response.text();
      console.log(`Response text: ${text.substring(0, 200)}...`);
      throw error;
    }
    expect(response.status()).toBe(200);
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.users.length).toBeGreaterThan(0);
    // Log setiap iterasi karena hanya 5 kali
    console.log(`✅ Iterasi ke-${i}: users = ${data.users.length}`);
  }
});
