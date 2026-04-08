import { Page } from "@playwright/test";

/**
 * 管理員帳號（用於後台測試）
 */
export const ADMIN_CREDENTIALS = {
  username: "jamforlove2025",
  password: "loveloveXiaowen2025",
};

/**
 * 測試用消費者帳號（動態產生，每次執行唯一）
 */
export function generateTestUser() {
  const ts = Date.now();
  return {
    username: `e2e_${ts}`,
    password: "Test@1234",
    name: "E2E 測試者",
    email: `e2e_${ts}@test.com`,
  };
}

/**
 * 透過 UI 流程完成註冊，並等待導向首頁
 */
export async function registerViaUI(
  page: Page,
  user: { username: string; password: string; name: string; email: string }
): Promise<void> {
  await page.goto("/register");
  await page.locator("#reg-username").fill(user.username);
  await page.locator("#reg-password").fill(user.password);
  await page.locator("#reg-name").fill(user.name);
  await page.locator("#reg-email").fill(user.email);
  await page.getByRole("button", { name: "註冊" }).click();
  await page.waitForURL("/", { timeout: 15_000 });
}

/**
 * 透過 UI 流程登入，預期為一般使用者（導向首頁）
 */
export async function loginViaUI(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.locator("#login-username").fill(username);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "登入" }).click();
  await page.waitForURL("/", { timeout: 15_000 });
}

/**
 * 透過 API 以管理員身份登入（不走 UI，避免 login rate limit），然後導向 /admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const res = await page.request.post("/api/auth/login", {
    data: ADMIN_CREDENTIALS,
  });
  if (!res.ok()) {
    throw new Error(`Admin login failed: ${res.status()}`);
  }
  await page.goto("/admin");
  await page.waitForURL("/admin", { timeout: 15_000 });
}

/**
 * 透過 UI 流程以管理員身份登入（用於測試 UI 登入行為本身）
 */
export async function loginAsAdminViaUI(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#login-username").fill(ADMIN_CREDENTIALS.username);
  await page.locator("#login-password").fill(ADMIN_CREDENTIALS.password);
  await page.getByRole("button", { name: "登入" }).click();
  await page.waitForURL("/admin", { timeout: 15_000 });
}

/**
 * 透過 API 登出（不走 UI，不重導頁面）
 */
export async function logoutViaAPI(page: Page): Promise<void> {
  await page.request.post("/api/auth/logout");
}
