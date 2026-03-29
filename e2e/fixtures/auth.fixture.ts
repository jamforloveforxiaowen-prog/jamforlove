import { Page } from "@playwright/test";

/**
 * 測試帳號資料（使用固定的測試帳號，不污染正式資料庫）
 * 注意：需要在測試環境的 Turso DB 存在這些帳號
 */
export const TEST_USER = {
  username: `e2e_test_${Date.now()}`,
  password: "Test@1234",
  name: "E2E 測試使用者",
  email: `e2e_test_${Date.now()}@test.com`,
};

/**
 * 透過 UI 註冊並登入，回傳已認證的 Page
 */
export async function registerAndLogin(
  page: Page,
  username: string = TEST_USER.username,
  password: string = TEST_USER.password,
  name: string = TEST_USER.name
): Promise<void> {
  await page.goto("/register");
  await page.locator("#reg-username").fill(username);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-name").fill(name);
  await page.locator("#reg-email").fill(`${username}@test.com`);
  await page.getByRole("button", { name: /註冊/ }).click();
  await page.waitForURL("/");
}

/**
 * 透過 UI 登入
 */
export async function loginViaUI(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.locator("#login-username").fill(username);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /登入/ }).click();
  await page.waitForURL("/");
}

/**
 * 登出
 */
export async function logout(page: Page): Promise<void> {
  await page.request.post("/api/auth/logout");
}
