import { Page, Locator, expect } from "@playwright/test";

/**
 * 首頁 Page Object Model
 * 對應路由：/
 */
export class HomePage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly orderButton: Locator;
  readonly productCards: Locator;
  readonly brandStorySection: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.getByRole("heading", { name: "Jam For Love", level: 1 });
    this.orderButton = page.getByRole("link", { name: "立即訂購" });
    this.productCards = page.locator('a[href^="/products/"]');
    this.brandStorySection = page.getByRole("heading", { name: "用愛製作，用心傳遞" });
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

  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  async clickFirstProduct() {
    await this.productCards.first().click();
  }

  async assertHeroVisible() {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.orderButton).toBeVisible();
  }

  async assertBrandStoryVisible() {
    await expect(this.brandStorySection).toBeVisible();
  }

  async assertFooterVisible() {
    await expect(this.footer).toBeVisible();
  }
}
