import { test, expect } from "@playwright/test";
import { NavbarPage } from "../pages/NavbarPage";

/**
 * 導覽列與路由測試
 * 驗證：頁面間導覽、Logo 連結、響應式選單
 */
test.describe("導覽列與路由", () => {
  test("Logo 點擊應回到首頁", async ({ page }) => {
    const navbar = new NavbarPage(page);
    // 從登入頁點 Logo 回首頁
    await page.goto("/login");
    // Logo 有兩個連結（「Jam For Love」），點第一個
    const logoLink = page.locator('a[href="/"]').first();
    await logoLink.click();
    await expect(page).toHaveURL("/");
  });

  test("未登入時導覽列顯示登入與註冊連結", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    // 桌面版 navbar
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await expect(desktopNav.getByRole("link", { name: "登入" })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "註冊" })).toBeVisible();
  });

  test("登入連結應導向登入頁", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    const desktopNav = page.locator("div.hidden.md\\:flex");
    await desktopNav.getByRole("link", { name: "登入" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("註冊連結應導向註冊頁", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    const desktopNav = page.locator("div.hidden.md\\:flex");
    await desktopNav.getByRole("link", { name: "註冊" }).click();
    await expect(page).toHaveURL("/register");
  });

  test("不存在的路由應顯示 404", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist-xyz");
    // Next.js 回傳 404 狀態
    expect(res?.status()).toBe(404);
  });

  test("手機版漢堡選單應可以開啟", async ({ page }) => {
    // 設定手機視窗大小
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    const hamburger = page.getByRole("button", { name: "選單" });
    await expect(hamburger).toBeVisible();

    // 點擊開啟
    await hamburger.click();

    // 手機版選單展開後，border-t 區塊應出現
    // 且有「首頁」連結
    const mobileFirstLink = page.locator("div.md\\:hidden.border-t");
    await expect(mobileFirstLink).toBeVisible();
  });

  test("手機版選單開啟後再點擊應關閉", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    const hamburger = page.getByRole("button", { name: "選單" });
    // 開啟
    await hamburger.click();
    const mobileMenu = page.locator("div.md\\:hidden.border-t");
    await expect(mobileMenu).toBeVisible();

    // 關閉
    await hamburger.click();
    await expect(mobileMenu).not.toBeVisible();
  });

  test("首頁應可正常渲染（HTTP 200）", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    // 確保 Jam For Love 標題存在
    await expect(
      page.getByRole("heading", { name: "Jam For Love", level: 1 })
    ).toBeVisible();
  });

  test("登入頁應可正常渲染（HTTP 200）", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "歡迎回來" })).toBeVisible();
  });

  test("註冊頁應可正常渲染（HTTP 200）", async ({ page }) => {
    const res = await page.goto("/register");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "加入我們" })).toBeVisible();
  });
});
