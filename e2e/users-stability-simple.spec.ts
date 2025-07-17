import { test, expect } from "@playwright/test";

test("Stability: buka halaman /users 5x dan cek API (Simple)", async ({
  page,
}) => {
  test.setTimeout(3600000); // 1 jam

  for (let i = 1; i <= 5; i++) {
    console.log(`🔄 Iterasi ke-${i}: Membuka halaman /users...`);

    try {
      // Buka halaman users
      await page.goto("http://localhost:3000/users");

      // Tunggu sampai ada data users di halaman (misal: table atau list)
      await page.waitForSelector(
        '[data-testid="users-table"], table, .users-list, [class*="user"]',
        {
          timeout: 300000, // 5 menit
        }
      );

      // Cek apakah ada data users di halaman
      const userElements = await page
        .locator('[data-testid="user-item"], tr, .user-item, [class*="user"]')
        .count();

      console.log(
        `✅ Iterasi ke-${i}: Ditemukan ${userElements} user elements di halaman`
      );

      // Validasi minimal ada 1 user
      expect(userElements).toBeGreaterThan(0);

      // Tunggu sebentar sebelum iterasi berikutnya
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log(`❌ Error pada iterasi ${i}:`, error);
      throw error;
    }
  }

  console.log("🎉 Test selesai! Semua iterasi berhasil.");
});
