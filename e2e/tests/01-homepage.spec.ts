import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

/**
 * 首頁測試
 * 驗證：Hero 區塊、Banner 輪播、導覽功能
 */
test.describe("首頁", () => {
  test("應顯示 Hero 區塊與品牌標語", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    // h1 存在
    await home.assertHeroVisible();
    // 副標語
    await expect(page.getByText("Handmade with Love")).toBeVisible();
    // 品牌描述文字
    await expect(page.getByText(/嚴選當季新鮮水果/)).toBeVisible();
  });

  test("應顯示「立即訂購」連結", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await expect(page.getByRole("link", { name: "立即訂購" })).toBeVisible();
  });

  test("應顯示頁尾", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await home.assertFooterVisible();
  });

  test("未登入時導覽列應顯示「登入」與「註冊」連結", async ({ page }) => {
    await page.goto("/");
    // 等待 auth/me API 回應
    await page.waitForResponse(
      (res) => res.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
    // 未登入狀態：桌面版導覽顯示「登入」
    await expect(page.getByRole("link", { name: "登入" })).toBeVisible();
    await expect(page.getByRole("link", { name: "註冊" })).toBeVisible();
  });

  test("未登入點擊「立即訂購」應重導向登入頁（middleware 保護）", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await home.clickOrderButton();
    // middleware 會將未登入使用者重導向到 /login
    await expect(page).toHaveURL("/login", { timeout: 10_000 });
  });
});
