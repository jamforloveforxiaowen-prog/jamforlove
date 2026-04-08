import { Page, Locator, expect } from "@playwright/test";

/**
 * 導覽列 Page Object Model
 * 出現在所有頁面頂部
 * 未登入：顯示「登入」「註冊」連結
 * 一般用戶登入後：顯示使用者名稱下拉選單（含「登出」按鈕）
 * 管理員登入後：顯示「後台管理」連結
 */
export class NavbarPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** 等待 Navbar 完成認證狀態載入 */
  async waitForAuthReady() {
    await this.page.waitForResponse(
      (res) => res.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
  }

  /** 確認已登入（顯示使用者名稱按鈕） */
  async assertLoggedIn(userName?: string) {
    if (userName) {
      await expect(
        this.page.getByRole("button", { name: new RegExp(userName) })
      ).toBeVisible({ timeout: 5_000 });
    } else {
      // 任何使用者名稱按鈕（user menu trigger）
      await expect(
        this.page.locator("button").filter({ has: this.page.locator("span.w-\\[6px\\]") })
      ).toBeVisible({ timeout: 5_000 });
    }
  }

  /** 確認未登入（顯示「登入」連結） */
  async assertLoggedOut() {
    await expect(this.page.getByRole("link", { name: "登入" })).toBeVisible({ timeout: 5_000 });
  }

  /** 確認顯示「後台管理」（管理員） */
  async assertAdminLinkVisible() {
    await expect(this.page.getByRole("link", { name: "後台管理" })).toBeVisible({ timeout: 5_000 });
  }

  /**
   * 開啟使用者下拉選單並點擊登出
   * 需先觸發 user name 按鈕才能看到下拉
   */
  async logout() {
    // 點擊使用者名稱觸發下拉
    const userBtn = this.page.locator("nav button").filter({
      hasText: /./,
    }).first();
    // 找到含有小點 span 的按鈕（user menu trigger）
    await this.page
      .locator('button:has(span.w-\\[6px\\].h-\\[6px\\])')
      .first()
      .click();
    // 點擊下拉中的「登出」
    await this.page.getByRole("button", { name: "登出" }).click();
    await this.page.waitForURL("/");
  }
}
