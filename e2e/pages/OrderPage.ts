import { Page, Locator, expect } from "@playwright/test";

/**
 * 訂購頁 Page Object Model
 * 對應路由：/order
 * 三個階段：表單 → 確認預覽 → 送出成功（感謝頁）
 */
export class OrderPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/order");
  }

  async waitForCampaignLoad() {
    // 等待 campaign API 回應完成
    await this.page.waitForResponse(
      (res) => res.url().includes("/api/campaigns/active") && res.status() === 200,
      { timeout: 15_000 }
    );
  }

  // ── 表單階段 ────────────────────────────

  /** 確認活動表單已載入（campaign 名稱標題可見） */
  async assertFormLoaded() {
    // 表單的 form 元素存在且頁面沒有「預購尚未開放」
    await expect(this.page.locator("form")).toBeVisible({ timeout: 15_000 });
  }

  /** 確認「預購尚未開放」訊息 */
  async assertNoActiveCampaign() {
    await expect(
      this.page.getByRole("heading", { name: "預購尚未開放" })
    ).toBeVisible({ timeout: 10_000 });
  }

  /**
   * 點擊「選擇」按鈕加入第一個商品
   * 先找到第一個「選擇」按鈕並點擊
   */
  async selectFirstProduct() {
    const selectBtn = this.page.getByRole("button", { name: "選擇" }).first();
    await selectBtn.click();
  }

  /**
   * 增加已選商品的數量（點擊「+」按鈕）
   */
  async increaseQuantity(index: number = 0) {
    // 「+」按鈕，文字為「+」
    const plusBtns = this.page.getByRole("button", { name: "+" });
    await plusBtns.nth(index).click();
  }

  /**
   * 減少已選商品數量（點擊「−」按鈕）
   */
  async decreaseQuantity(index: number = 0) {
    const minusBtns = this.page.getByRole("button", { name: "−" });
    await minusBtns.nth(index).click();
  }

  /** 填寫顧客資料（姓名、電話、Email） */
  async fillCustomerInfo(name: string, phone: string, email?: string) {
    // 姓名輸入框：label 文字含「姓名」
    const nameInput = this.page.locator('input[type="text"]').filter({
      has: this.page.locator('..'), // 透過 nearby label 找
    });
    // 直接依照 label 文字找最近的 input
    await this.page.getByLabel("姓名 *").fill(name);
    await this.page.getByLabel("電話 *").fill(phone);
    if (email) {
      await this.page.getByLabel("Email").fill(email);
    }
  }

  /** 選擇取貨方式 */
  async selectDeliveryMethod(value: string) {
    // value: "shipping" 或 "pickup:小川阿姨" 等
    await this.page.locator('select').selectOption(value);
  }

  /** 選擇付款方式（現金或匯款） */
  async selectPaymentMethod(method: "cash" | "transfer") {
    const label = method === "cash" ? /現金/ : /匯款/;
    await this.page.getByRole("button", { name: label }).click();
  }

  /** 點擊「前往確認」或送出表單按鈕 */
  async submitForm() {
    // 表單送出按鈕文字包含「確認」或「送出」
    const submitBtn = this.page.getByRole("button", { name: /確認|送出/ }).last();
    await submitBtn.click();
  }

  // ── 確認預覽階段 ──────────────────────────

  /** 確認已進入「確認訂單內容」頁面 */
  async assertConfirmationPageVisible() {
    await expect(
      this.page.getByRole("heading", { name: "請確認訂單內容" })
    ).toBeVisible({ timeout: 10_000 });
  }

  /** 確認頁面顯示付款方式 */
  async assertPaymentMethodShown(method: "cash" | "transfer") {
    const label = method === "cash" ? "現金" : "匯款";
    await expect(this.page.getByText(label)).toBeVisible();
  }

  /** 點擊「返回修改」按鈕 */
  async clickBackToEdit() {
    await this.page.getByRole("button", { name: "返回修改" }).click();
  }

  /** 點擊「確認送出訂單」按鈕（真正送出） */
  async confirmAndSubmit() {
    await this.page.getByRole("button", { name: "確認送出訂單" }).click();
  }

  // ── 感謝頁（送出成功）────────────────────

  /** 確認已進入感謝頁（送出成功） */
  async assertThankYouPageVisible() {
    await expect(
      this.page.getByRole("heading", { name: "收到你的心意了！" })
    ).toBeVisible({ timeout: 15_000 });
  }

  /** 取得訂單編號文字 */
  async getOrderId(): Promise<string> {
    const text = await this.page.locator("text=訂單編號").first().textContent();
    return text ?? "";
  }
}
