import { Page, Locator, expect } from "@playwright/test";

/**
 * 後台管理頁 Page Object Model
 * 對應路由：/admin
 */
export class AdminPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly productsTab: Locator;
  readonly ordersTab: Locator;
  readonly addProductButton: Locator;
  readonly productNameInput: Locator;
  readonly productPriceInput: Locator;
  readonly productImageInput: Locator;
  readonly productDescriptionInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly formTitle: Locator;
  readonly errorMessage: Locator;
  readonly productList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "後台管理", level: 1 });
    this.productsTab = page.getByRole("button", { name: "產品管理" });
    this.ordersTab = page.getByRole("button", { name: "訂單管理" });
    this.addProductButton = page.getByRole("button", { name: "+ 新增產品" });
    // 表單內欄位：用 form 內的 input type 定位
    this.productNameInput = page.locator('form input[type="text"]');
    this.productPriceInput = page.locator('form input[type="number"]');
    this.productImageInput = page.locator('form input[type="url"]');
    this.productDescriptionInput = page.locator("form textarea");
    this.submitButton = page.locator('form button[type="submit"]');
    this.cancelButton = page.locator('form button[type="button"]');
    this.formTitle = page.getByRole("heading", { name: /新增產品|編輯產品/ });
    this.errorMessage = page.locator('[role="alert"]');
    this.productList = page.locator("div.space-y-3");
  }

  async goto() {
    await this.page.goto("/admin");
  }

  async waitForLoad() {
    await this.page.waitForResponse((res) =>
      res.url().includes("/api/admin/products")
    );
  }

  async clickAddProduct() {
    await this.addProductButton.click();
  }

  async fillProductForm(
    name: string,
    price: string,
    description?: string,
    imageUrl?: string
  ) {
    await this.productNameInput.fill(name);
    await this.productPriceInput.fill(price);
    if (description) {
      await this.productDescriptionInput.fill(description);
    }
    if (imageUrl) {
      await this.productImageInput.fill(imageUrl);
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async switchToOrders() {
    await this.ordersTab.click();
  }

  async switchToProducts() {
    await this.productsTab.click();
  }

  async getProductCount(): Promise<number> {
    return await this.productList
      .locator("> div")
      .count();
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async assertFormVisible() {
    await expect(this.formTitle).toBeVisible();
  }

  async assertFormHidden() {
    await expect(this.formTitle).not.toBeVisible();
  }

  async assertProductExists(productName: string) {
    await expect(
      this.page.locator(`h3:has-text("${productName}")`)
    ).toBeVisible();
  }

  async clickEditProduct(productName: string) {
    const productRow = this.page
      .locator("div.bg-white")
      .filter({ has: this.page.locator(`h3:has-text("${productName}")`) });
    await productRow.getByRole("button", { name: "編輯" }).click();
  }

  async clickToggleActive(productName: string) {
    const productRow = this.page
      .locator("div.bg-white")
      .filter({ has: this.page.locator(`h3:has-text("${productName}")`) });
    await productRow.getByRole("button", { name: /上架|下架/ }).click();
  }

  async assertOrdersVisible() {
    await expect(
      this.page.getByRole("heading", { name: "訂單列表" })
    ).toBeVisible();
  }
}
