import { Page, Locator, expect } from "@playwright/test";

/**
 * 訂購頁 Page Object Model
 * 對應路由：/order
 */
export class OrderPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly customerNameInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly cartSummary: Locator;
  readonly totalDisplay: Locator;
  readonly successMessage: Locator;
  readonly viewOrdersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "訂購果醬", level: 1 });
    this.customerNameInput = page.locator("#order-name");
    this.phoneInput = page.locator("#order-phone");
    this.addressInput = page.locator("#order-address");
    this.notesInput = page.locator("#order-notes");
    this.submitButton = page.getByRole("button", { name: /確認訂購/ });
    this.errorMessage = page.locator("p.text-berry");
    this.cartSummary = page.getByRole("heading", { name: "購物清單" });
    this.totalDisplay = page.locator("text=NT$").last();
    this.successMessage = page.getByRole("heading", { name: "訂單已送出！" });
    this.viewOrdersButton = page.getByRole("button", { name: "查看我的訂單" });
  }

  async goto() {
    await this.page.goto("/order");
  }

  async waitForProductsLoad() {
    // 等待產品清單出現（API 載入完成）
    await this.page.waitForResponse((res) => res.url().includes("/api/products"));
  }

  /**
   * 對指定產品按下增加數量按鈕
   * @param productIndex 產品索引（從 0 開始）
   * @param times 點擊次數
   */
  async increaseProductQuantity(productIndex: number, times: number = 1) {
    // 每個產品卡片中的「+」按鈕
    const increaseButtons = this.page.getByRole("button", { name: "+" });
    const button = increaseButtons.nth(productIndex);
    for (let i = 0; i < times; i++) {
      await button.click();
    }
  }

  /**
   * 對指定產品按下減少數量按鈕
   */
  async decreaseProductQuantity(productIndex: number) {
    const decreaseButtons = this.page.getByRole("button", { name: "−" });
    await decreaseButtons.nth(productIndex).click();
  }

  async getQuantityDisplay(productIndex: number): Promise<string> {
    // 數量顯示 span（夾在 − 和 + 之間）
    const quantities = this.page.locator("span.tabular-nums");
    return (await quantities.nth(productIndex).textContent()) ?? "0";
  }

  async fillShippingInfo(name: string, phone: string, address: string, notes?: string) {
    await this.customerNameInput.fill(name);
    await this.phoneInput.fill(phone);
    await this.addressInput.fill(address);
    if (notes) {
      await this.notesInput.fill(notes);
    }
  }

  async submitOrder() {
    await this.submitButton.click();
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async assertSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  async assertCartVisible() {
    await expect(this.cartSummary).toBeVisible();
  }

  async assertSuccessVisible() {
    await expect(this.successMessage).toBeVisible();
  }

  async assertErrorVisible(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async clickViewOrders() {
    await this.viewOrdersButton.click();
  }
}
