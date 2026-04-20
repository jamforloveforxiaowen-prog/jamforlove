import { test, expect } from "@playwright/test";
import { ADMIN_CREDENTIALS } from "../fixtures/auth.fixture";

/**
 * 登入頁細節測試
 * 驗證：登入頁 UI 細節、Navbar 行為（auth 頁面專屬）
 */

test.describe("登入頁細節", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("登入頁 Navbar 不顯示「登入/註冊」連結（isAuthPage = true）", async ({ page }) => {
    await page.goto("/login");
    await page.waitForResponse(
      (r) => r.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
    // auth 頁面的桌面版 nav 只顯示「首頁」
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await expect(desktopNav.getByRole("link", { name: "首頁" })).toBeVisible();
    // 不顯示登入/註冊連結
    await expect(desktopNav.getByRole("link", { name: "登入" })).not.toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "註冊" })).not.toBeVisible();
  });

  test("登入頁手機版不顯示漢堡選單", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    // auth 頁面不渲染漢堡選單
    await expect(page.getByRole("button", { name: "選單" })).not.toBeVisible();
  });

  test("桌面版登入頁顯示左側品牌文案", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    await expect(page.getByText(/為愛而捐/)).toBeVisible();
    await expect(page.getByText(/每一瓶果醬/)).toBeVisible();
  });

  test("「忘記密碼？」連結應指向 /forgot-password", async ({ page }) => {
    await page.goto("/login");
    const link = page.getByRole("link", { name: "忘記密碼？" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/forgot-password");
  });

  test("「顯示/隱藏密碼」切換按鈕可運作", async ({ page }) => {
    await page.goto("/login");
    const pwInput = page.locator("#login-password");
    await expect(pwInput).toHaveAttribute("type", "password");

    // 點擊眼睛按鈕
    await page.locator('button[aria-label="顯示密碼"]').click();
    await expect(pwInput).toHaveAttribute("type", "text");

    // 再點擊隱藏
    await page.locator('button[aria-label="隱藏密碼"]').click();
    await expect(pwInput).toHaveAttribute("type", "password");
  });

  test("管理員已登入時 Navbar 顯示「後台管理」連結（使用 storageState）", async ({ browser }) => {
    // 使用儲存的管理員 auth state 建立新 context，避免 beforeEach clearCookies 的影響
    const adminContext = await browser.newContext({
      storageState: "e2e/fixtures/admin-auth-state.json",
      baseURL: "http://localhost:3000",
    });
    const page = await adminContext.newPage();
    await page.goto("/admin");
    await page.waitForURL("/admin", { timeout: 15_000 });

    // 確認顯示後台管理連結
    await expect(page.getByRole("link", { name: "後台管理" })).toBeVisible({ timeout: 8_000 });
    await adminContext.close();
  });
});
