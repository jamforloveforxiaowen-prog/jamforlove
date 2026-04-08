import { Page, Locator, expect } from "@playwright/test";

/**
 * 首頁 Page Object Model
 * 對應路由：/
 */
export class HomePage {
  readonly page: Page;
  // Hero 區塊的 h1 包含「Jam」「For Love」兩段文字
  readonly heroHeading: Locator;
  // 「立即訂購」連結
  readonly orderButton: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.getByRole("heading", { level: 1 });
    this.orderButton = page.getByRole("link", { name: "立即訂購" });
    this.footer = page.locator("footer");
  }

  async goto() {
    await this.page.goto("/");
  }

  async waitForLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  async clickOrderButton() {
    await this.orderButton.click();
  }

  async assertHeroVisible() {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.orderButton).toBeVisible();
  }

  async assertFooterVisible() {
    await expect(this.footer).toBeVisible();
  }
}
