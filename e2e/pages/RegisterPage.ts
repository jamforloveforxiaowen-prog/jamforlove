import { Page, Locator, expect } from "@playwright/test";

/**
 * 註冊頁 Page Object Model
 * 對應路由：/register
 */
export class RegisterPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("#reg-username");
    this.passwordInput = page.locator("#reg-password");
    this.nameInput = page.locator("#reg-name");
    this.emailInput = page.locator("#reg-email");
    this.submitButton = page.getByRole("button", { name: "註冊" });
    this.errorMessage = page.locator('[role="alert"]');
    this.loginLink = page.getByRole("link", { name: "登入" });
    this.pageTitle = page.getByRole("heading", { name: "加入我們" });
  }

  async goto() {
    await this.page.goto("/register");
  }

  async register(username: string, password: string, name: string, email: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.nameInput).toBeVisible();
  }

  async assertErrorVisible(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
}
