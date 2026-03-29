import { Page, Locator, expect } from "@playwright/test";

/**
 * 登入頁 Page Object Model
 * 對應路由：/login
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("#login-username");
    this.passwordInput = page.locator("#login-password");
    this.submitButton = page.getByRole("button", { name: /登入/ });
    this.errorMessage = page.locator("p.text-berry");
    this.registerLink = page.getByRole("link", { name: "註冊" });
    this.pageTitle = page.getByRole("heading", { name: "歡迎回來" });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async assertPageVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async assertErrorVisible(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async waitForNavigation() {
    await this.page.waitForURL("/");
  }
}
