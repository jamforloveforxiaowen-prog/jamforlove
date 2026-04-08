import { test, expect } from "@playwright/test";

/**
 * 導覽列與路由測試
 * 驗證：頁面間導覽、導覽連結、手機版選單
 */

test.describe("導覽列與路由", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("首頁應回傳 HTTP 200", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
  });

  test("登入頁應回傳 HTTP 200", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "歡迎回來" })).toBeVisible();
  });

  test("註冊頁應回傳 HTTP 200", async ({ page }) => {
    const res = await page.goto("/register");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "加入我們" })).toBeVisible();
  });

  test("果醬故事頁應回傳 HTTP 200", async ({ page }) => {
    const res = await page.goto("/story");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "果醬的故事" })).toBeVisible();
  });

  test("訂購頁應回傳 HTTP 200", async ({ page }) => {
    const res = await page.goto("/order");
    expect(res?.status()).toBe(200);
  });

  test("不存在的路由應顯示 404", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
  });

  test("未登入時桌面版導覽顯示「登入」與「註冊」", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse(
      (r) => r.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
    // 桌面版（hidden md:flex）
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await expect(desktopNav.getByRole("link", { name: "登入" })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "註冊" })).toBeVisible();
  });

  test("點擊導覽「登入」連結應前往登入頁", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse(
      (r) => r.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await desktopNav.getByRole("link", { name: "登入" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("點擊導覽「註冊」連結應前往註冊頁", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse(
      (r) => r.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await desktopNav.getByRole("link", { name: "註冊" }).click();
    await expect(page).toHaveURL("/register");
  });

  test("首頁點擊 Logo 連結（首頁連結）應留在 /", async ({ page }) => {
    // 從 /login 進入，點 Logo 回首頁
    await page.goto("/login");
    // 登入頁顯示「首頁」連結而非 Logo
    await page.getByRole("link", { name: "首頁" }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("手機版漢堡按鈕應可開啟選單", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForResponse(
      (r) => r.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );

    // 漢堡按鈕 aria-label="選單"
    const hamburger = page.getByRole("button", { name: "選單" });
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    // 手機版選單面板（absolute 定位在 nav 下方）
    // 面板包含「登入」或「果醬的故事」等連結
    await expect(
      page.getByRole("link", { name: "果醬的故事" })
    ).toBeVisible({ timeout: 5_000 });
  });

  test("登入頁的「果醬的故事」不在導覽（auth 頁面只顯示首頁）", async ({ page }) => {
    await page.goto("/login");
    // 登入頁 navbar 只顯示「首頁」CTA，不應有「果醬的故事」
    await expect(page.getByRole("link", { name: "果醬的故事" })).not.toBeVisible();
  });
});
