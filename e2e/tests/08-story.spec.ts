import { test, expect } from "@playwright/test";

/**
 * 果醬的故事頁測試
 * 對應路由：/story
 * 驗證：頁面顯示、故事書翻頁介面
 */

/**
 * 透過 localStorage 預先關閉 NewsPopup（避免彈窗遮住操作元素）
 */
async function dismissNewsPopup(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem("news-popup-dismissed", today);
  });
}

test.describe("果醬的故事頁", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("應顯示頁面標題「果醬的故事」", async ({ page }) => {
    await page.goto("/story");
    await expect(
      page.getByRole("heading", { name: "果醬的故事" })
    ).toBeVisible({ timeout: 10_000 });
    // 英文副標語
    await expect(page.getByText("Our Story")).toBeVisible();
  });

  test("有故事內容時應顯示書本介面", async ({ page }) => {
    // 先檢查 API 有無故事
    const res = await page.request.get("/api/story");
    const blocks = await res.json();

    await page.goto("/story");
    await page.waitForResponse(
      (r) => r.url().includes("/api/story") && r.status() === 200,
      { timeout: 10_000 }
    );

    if (blocks.length > 0) {
      // 有故事：應顯示封面（Jam for Love 書本封面）
      await expect(page.getByText("Jam for Love").first()).toBeVisible({ timeout: 10_000 });
      // 翻頁按鈕應可見
      await expect(page.getByRole("button", { name: "翻開故事" })).toBeVisible();
    } else {
      // 無故事：應顯示「故事正在撰寫中」
      await expect(
        page.getByText("故事正在撰寫中 — 敬請期待")
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test("有故事時點擊「翻開故事」應翻到第一頁", async ({ page }) => {
    const res = await page.request.get("/api/story");
    const blocks = await res.json();

    if (blocks.length === 0) {
      test.skip(true, "無故事內容，略過翻頁測試");
      return;
    }

    await page.goto("/story");
    await page.waitForResponse(
      (r) => r.url().includes("/api/story") && r.status() === 200,
      { timeout: 10_000 }
    );

    // 使用 force:true 因為按鈕有持續的浮動動畫（animate-[float]）導致 Playwright 判斷元素不穩定
    await page.getByRole("button", { name: "翻開故事" }).click({ force: true });

    // 第一個故事頁應包含 Chapter 1
    await expect(page.getByText("Chapter 1")).toBeVisible({ timeout: 5_000 });
  });

  test("有多頁時可以點擊「下一頁」翻頁", async ({ page }) => {
    const res = await page.request.get("/api/story");
    const blocks = await res.json();

    if (blocks.length < 2) {
      test.skip(true, "故事頁數不足，略過翻頁測試");
      return;
    }

    await page.goto("/story");
    // 關閉 NewsPopup 再 reload，避免遮擋翻頁按鈕
    await dismissNewsPopup(page);
    await page.reload();
    await page.waitForResponse(
      (r) => r.url().includes("/api/story") && r.status() === 200,
      { timeout: 10_000 }
    );

    // 先翻到第一頁（force:true 因為按鈕有浮動動畫）
    await page.getByRole("button", { name: "翻開故事" }).click({ force: true });
    await expect(page.getByText("Chapter 1")).toBeVisible({ timeout: 5_000 });

    // 再翻到第二頁（force:true 因為翻頁按鈕可能在 NewsPopup 出現前就被 overlay 遮住）
    await page.getByRole("button", { name: "下一頁" }).click({ force: true });
    await expect(page.getByText("Chapter 2")).toBeVisible({ timeout: 5_000 });
  });

  test("有故事時「上一頁」按鈕在第一頁時應為禁用", async ({ page }) => {
    const res = await page.request.get("/api/story");
    const blocks = await res.json();

    if (blocks.length === 0) {
      test.skip(true, "無故事內容，略過");
      return;
    }

    await page.goto("/story");
    await page.waitForResponse(
      (r) => r.url().includes("/api/story") && r.status() === 200,
      { timeout: 10_000 }
    );

    // 封面（第 0 頁）時「上一頁」應被禁用
    const prevBtn = page.getByRole("button", { name: "上一頁" });
    await expect(prevBtn).toBeDisabled({ timeout: 5_000 });
  });
});
