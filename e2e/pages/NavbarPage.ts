import { Page, Locator, expect } from "@playwright/test";

/**
 * 導覽列 Page Object Model
 * 出現在所有頁面頂部
 */
export class NavbarPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly orderLink: Locator;
  readonly myOrdersLink: Locator;
  readonly logoutButton: Locator;
  readonly adminLink: Locator;
  readonly userNameDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("link", { name: "Jam For Love" }).first();
    // 桌面版導覽連結（hidden md:flex 區塊內）
    const desktopNav = page.locator("div.hidden.md\\:flex");
    this.homeLink = desktopNav.getByRole("link", { name: "首頁" });
    this.loginLink = desktopNav.getByRole("link", { name: "登入" });
    this.registerLink = desktopNav.getByRole("link", { name: "註冊" });
    this.orderLink = desktopNav.getByRole("link", { name: "訂購" });
    this.myOrdersLink = desktopNav.getByRole("link", { name: "我的訂單" });
    this.adminLink = desktopNav.getByRole("link", { name: "後台管理" });
    this.logoutButton = desktopNav.getByRole("button", { name: "登出" });
    this.userNameDisplay = desktopNav.locator("span.text-warm-brown\\/60");
  }

  async waitForAuthReady() {
    // 等待 /api/auth/me 回應，確保 navbar 狀態正確
    await this.page.waitForResponse((res) => res.url().includes("/api/auth/me"));
  }

  async clickLogo() {
    await this.logo.click();
  }

  async clickLogin() {
    await this.loginLink.click();
  }

  async clickLogout() {
    await this.logoutButton.click();
    await this.page.waitForURL("/");
  }

  async assertLoggedIn(userName?: string) {
    await expect(this.logoutButton).toBeVisible();
    await expect(this.orderLink).toBeVisible();
    await expect(this.myOrdersLink).toBeVisible();
    if (userName) {
      await expect(this.userNameDisplay).toContainText(userName);
    }
  }

  async assertLoggedOut() {
    await expect(this.loginLink).toBeVisible();
    await expect(this.registerLink).toBeVisible();
  }

  async assertAdminLinkVisible() {
    await expect(this.adminLink).toBeVisible();
  }
}
