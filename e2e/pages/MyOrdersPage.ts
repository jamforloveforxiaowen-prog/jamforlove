import { Page, Locator, expect } from "@playwright/test";

/**
 * 我的訂單頁 Page Object Model
 * 對應路由：/my-orders
 */
export class MyOrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly orderCards: Locator;
  readonly emptyState: Locator;
  readonly goShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "我的訂單", level: 1 });
    // 每個訂單卡片有 class bg-white rounded-lg ring-1
    this.orderCards = page.locator("div.bg-white.rounded-lg.ring-1");
    this.emptyState = page.locator("text=還沒有訂單紀錄");
    this.goShoppingButton = page.getByRole("link", { name: "去逛逛果醬" });
  }

  async goto() {
    await this.page.goto("/my-orders");
  }

  async waitForLoad() {
    await this.page.waitForResponse((res) => res.url().includes("/api/orders"));
  }

  async getOrderCount(): Promise<number> {
    return await this.orderCards.count();
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async assertHasOrders() {
    await expect(this.orderCards.first()).toBeVisible();
  }

  async assertEmptyState() {
    await expect(this.emptyState).toBeVisible();
    await expect(this.goShoppingButton).toBeVisible();
  }

  async assertOrderStatus(orderIndex: number, status: string) {
    const statusBadge = this.orderCards.nth(orderIndex).locator("span.rounded-full");
    await expect(statusBadge).toContainText(status);
  }
}
