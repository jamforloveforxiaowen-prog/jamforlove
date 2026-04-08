import { Page, Locator, expect } from "@playwright/test";

/**
 * 我的訂單頁 Page Object Model
 * 對應路由：/my-orders
 */
export class MyOrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  // 每個訂單卡片
  readonly orderCards: Locator;
  // 空狀態文字
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "我的訂單" });
    this.orderCards = page.locator("div.bg-white.rounded-lg.ring-1");
    this.emptyState = page.getByText("還沒有訂單紀錄");
  }

  async goto() {
    await this.page.goto("/my-orders");
  }

  async waitForLoad() {
    // 等待頁面標題出現（比等待 API response 更可靠，避免 race condition）
    await expect(this.pageTitle).toBeVisible({ timeout: 15_000 });
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10_000 });
  }

  async assertHasOrders() {
    await expect(this.orderCards.first()).toBeVisible({ timeout: 10_000 });
  }

  async assertEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10_000 });
  }

  async getOrderCount(): Promise<number> {
    return await this.orderCards.count();
  }

  /**
   * 點擊第一個「修改訂單」按鈕
   */
  async clickFirstModifyOrder() {
    await this.page.getByRole("button", { name: "修改訂單" }).first().click();
  }

  /** 確認修改訂單 Modal 已開啟 */
  async assertModifyModalVisible() {
    await expect(
      this.page.getByRole("heading", { name: /修改訂單/ })
    ).toBeVisible({ timeout: 5_000 });
  }

  /** 填寫修改內容文字區 */
  async fillModifyMessage(message: string) {
    await this.page.locator("textarea").fill(message);
  }

  /** 點擊 Modal 中的「送出」按鈕 */
  async submitModifyRequest() {
    await this.page.getByRole("button", { name: "送出" }).click();
  }

  /** 確認修改送出成功訊息 */
  async assertModifySuccess() {
    await expect(
      this.page.getByText("已送出修改需求")
    ).toBeVisible({ timeout: 10_000 });
  }

  /** 關閉 Modal */
  async closeModal() {
    await this.page.getByRole("button", { name: "關閉" }).click();
  }
}
