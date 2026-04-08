import { Page, Locator, expect } from "@playwright/test";

/**
 * 後台管理頁 Page Object Model
 * 對應路由：/admin
 * 主要分頁：預購表單設計 / 訂單管理 / Banner 管理 / 最新消息 / 關於我們 / 果醬的故事 / 設定
 */
export class AdminPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  // 主要分頁按鈕
  readonly campaignsTab: Locator;
  readonly ordersTab: Locator;
  readonly storyTab: Locator;
  readonly settingsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "後台管理" });
    this.campaignsTab = page.getByRole("button", { name: "預購表單設計" });
    this.ordersTab = page.getByRole("button", { name: "訂單管理" });
    this.storyTab = page.getByRole("button", { name: "果醬的故事" });
    this.settingsTab = page.getByRole("button", { name: "設定" });
  }

  async goto() {
    await this.page.goto("/admin");
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10_000 });
  }

  // ── 預購表單設計（campaigns）────────────────

  async switchToCampaigns() {
    await this.campaignsTab.click();
  }

  /** 點擊「新增預購活動」按鈕 */
  async clickAddCampaign() {
    await this.page.getByRole("button", { name: "+ 新增預購活動" }).click();
  }

  /**
   * 填寫活動表單基本資料
   */
  async fillCampaignForm(opts: {
    name: string;
    startDate: string;
    endDate: string;
    supporterDiscount?: number;
  }) {
    // 活動名稱
    await this.page.locator('input[placeholder="例：2025 春季預購"]').fill(opts.name);
    // 開始日期
    const dateInputs = this.page.locator('input[type="date"]');
    await dateInputs.first().fill(opts.startDate);
    await dateInputs.nth(1).fill(opts.endDate);
    // 舊朋友折扣
    if (opts.supporterDiscount !== undefined) {
      const discountInput = this.page.locator('input[type="number"]').first();
      await discountInput.fill(String(opts.supporterDiscount));
    }
  }

  /** 送出活動表單 */
  async submitCampaignForm() {
    await this.page.getByRole("button", { name: /儲存|新增/ }).click();
  }

  /** 確認預覽 modal 出現 */
  async assertPreviewModalVisible() {
    await expect(
      this.page.getByRole("button", { name: /發佈|關閉/ }).first()
    ).toBeVisible({ timeout: 10_000 });
  }

  /** 關閉預覽 modal */
  async closePreviewModal() {
    await this.page.getByRole("button", { name: "關閉" }).click();
  }

  // ── 訂單管理（orders）────────────────────

  async switchToOrders() {
    await this.ordersTab.click();
    // 等待訂單資料載入
    await this.page.waitForResponse(
      (res) => res.url().includes("/api/admin/orders") && res.status() === 200,
      { timeout: 10_000 }
    );
  }

  /** 切換到「訂單列表」子分頁 */
  async clickOrdersSubTab() {
    await this.page.getByRole("button", { name: "訂單列表" }).click();
  }

  /** 切換到「數據分析」子分頁 */
  async clickAnalyticsSubTab() {
    await this.page.getByRole("button", { name: "數據分析" }).click();
  }

  /** 切換到「修改申請」子分頁 */
  async clickModifyRequestsSubTab() {
    await this.page.getByRole("button", { name: "修改申請" }).click();
  }

  /** 確認訂單列表區塊可見 */
  async assertOrderListVisible() {
    await expect(
      this.page.getByRole("heading", { name: /訂單列表/ })
    ).toBeVisible({ timeout: 10_000 });
  }

  /** 確認數據分析區塊可見 */
  async assertAnalyticsVisible() {
    // OrderAnalytics 元件會顯示統計數據
    await expect(
      this.page.locator("text=數據分析").first()
    ).toBeVisible({ timeout: 5_000 });
  }

  /**
   * 點擊「標為已處理」按鈕（第一個未處理申請）
   */
  async markFirstRequestHandled() {
    await this.page.getByRole("button", { name: "標為已處理" }).first().click();
  }

  // ── 果醬的故事（story）────────────────────

  async switchToStory() {
    await this.storyTab.click();
  }

  /** 點擊「+ 新增段落」 */
  async clickAddStoryBlock() {
    await this.page.getByRole("button", { name: "+ 新增段落" }).click();
  }

  /** 填寫故事段落表單 */
  async fillStoryForm(heading: string, content: string) {
    await this.page.locator("#story-heading").fill(heading);
    await this.page.locator("#story-content").fill(content);
  }

  /** 送出故事段落表單 */
  async submitStoryForm() {
    await this.page.locator('form button[type="submit"]').click();
  }

  // ── 設定（settings）──────────────────────

  async switchToSettings() {
    await this.settingsTab.click();
  }

  /** 新增通知信箱 */
  async addNotifyEmail(email: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.getByRole("button", { name: "新增" }).click();
  }

  /** 儲存匯款資訊 */
  async saveBankInfo(info: string) {
    // 匯款資訊 textarea（第二個 textarea 或找 placeholder）
    const textarea = this.page.locator('textarea[placeholder*="銀行"]');
    await textarea.fill(info);
    await this.page.getByRole("button", { name: "儲存" }).last().click();
  }

  /** 確認成功訊息 */
  async assertSuccessMessage() {
    await expect(
      this.page.getByText("已儲存")
    ).toBeVisible({ timeout: 5_000 });
  }
}
