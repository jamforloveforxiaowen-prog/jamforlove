import { test, expect } from "@playwright/test";
import { NavbarPage } from "../pages/NavbarPage";

/**
 * 認證流程測試
 * 驗證：註冊、登入、登出、表單驗證
 *
 * 重要發現：
 * - page.request 和 page 共用同一個 BrowserContext，所以 API 設的 cookie 會立即生效
 * - 呼叫 /api/auth/register 成功後，browser 已處於登入狀態
 * - 訪問 /login 或 /register 時 middleware 會重導向已登入用戶到首頁
 * - 因此，測試需要先 clearCookies 再進行 UI 操作
 *
 * 帳號規則：3-20 字元，使用 prefix + 10碼時間戳
 */

function makeUser(prefix: string) {
  const ts = Date.now().toString().slice(-10);
  return {
    username: `${prefix}${ts}`,   // e.g. "re1234567890" = 12 chars
    password: "Test@1234",
    name: `${prefix}測試員`,
    email: `${prefix}${ts}@test.com`,
  };
}

test.describe("使用者認證", () => {
  // 每個測試前清除 cookies（讓瀏覽器處於未登入狀態）
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test.describe("註冊流程", () => {
    test("應正確顯示註冊頁面", async ({ page }) => {
      await page.goto("/register");
      await expect(page.getByRole("heading", { name: "加入我們" })).toBeVisible();
      await expect(page.locator("#reg-username")).toBeVisible();
      await expect(page.locator("#reg-password")).toBeVisible();
      await expect(page.locator("#reg-name")).toBeVisible();
    });

    test("成功註冊後應重導向首頁並顯示已登入", async ({ page }) => {
      // cookies 已清除，可正常訪問 /register
      const testUser = makeUser("re");
      const navbar = new NavbarPage(page);

      await page.goto("/register");
      await page.locator("#reg-username").fill(testUser.username);
      await page.locator("#reg-password").fill(testUser.password);
      await page.locator("#reg-name").fill(testUser.name);
      await page.locator("#reg-email").fill(testUser.email);

      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/register")),
        page.getByRole("button", { name: /註冊/ }).click(),
      ]);

      expect(response.status()).toBeLessThan(400);
      await page.waitForURL("/", { timeout: 15_000 });
      await expect(page).toHaveURL("/");

      // 重新載入頁面，確保 navbar 的 useEffect 重新執行 /api/auth/me
      // （Next.js router.refresh() 不會 remount Client Components，所以 useEffect 不會重新觸發）
      const authMePromise = page.waitForResponse(
        (res) => res.url().includes("/api/auth/me"),
        { timeout: 10_000 }
      );
      await page.reload();
      await authMePromise;
      await expect(navbar.logoutButton).toBeVisible({ timeout: 5_000 });
    });

    test("重複帳號應顯示錯誤訊息", async ({ page, context }) => {
      const testUser = makeUser("re");
      // 用 API 建立帳號（此時 browser 已登入）
      await page.request.post("/api/auth/register", {
        data: { ...testUser },
      });

      // 清除 cookie 後才能再訪問 /register
      await context.clearCookies();

      await page.goto("/register");
      await page.locator("#reg-username").fill(testUser.username);
      await page.locator("#reg-password").fill(testUser.password);
      await page.locator("#reg-name").fill(testUser.name);
      await page.locator("#reg-email").fill(testUser.email);

      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/register")),
        page.getByRole("button", { name: /註冊/ }).click(),
      ]);

      expect(response.status()).toBe(400);
      await expect(page.locator('p[role="alert"]')).toBeVisible();
    });

    test("帳號不足 3 個字元應被瀏覽器驗證阻擋", async ({ page }) => {
      await page.goto("/register");
      await page.locator("#reg-username").fill("ab");
      await page.locator("#reg-password").fill("Test@1234");
      await page.locator("#reg-name").fill("測試");
      await page.locator("#reg-email").fill("ab@test.com");

      await page.getByRole("button", { name: /註冊/ }).click();

      // minLength=3 的 HTML5 驗證會阻止送出，頁面應該還在 /register
      await expect(page).toHaveURL("/register");
    });

    test("已有帳號連結應指向登入頁", async ({ page }) => {
      await page.goto("/register");
      const loginLink = page.locator("main").getByRole("link", { name: "登入" });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  test.describe("登入流程", () => {
    test("應正確顯示登入頁面", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByRole("heading", { name: "歡迎回來" })).toBeVisible();
      await expect(page.locator("#login-username")).toBeVisible();
      await expect(page.locator("#login-password")).toBeVisible();
    });

    test("使用正確憑證登入後應重導向首頁", async ({ page, context }) => {
      const testUser = makeUser("li");
      const navbar = new NavbarPage(page);

      // 建立帳號（此時 browser 已登入）
      await page.request.post("/api/auth/register", { data: { ...testUser } });
      // 清除 cookie 後才能訪問 /login
      await context.clearCookies();

      await page.goto("/login");
      await page.locator("#login-username").fill(testUser.username);
      await page.locator("#login-password").fill(testUser.password);

      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/login")),
        page.getByRole("button", { name: /登入/ }).click(),
      ]);

      expect(response.status()).toBeLessThan(400);
      await page.waitForURL("/", { timeout: 15_000 });
      await expect(page).toHaveURL("/");

      // 重新載入確保 navbar useEffect 執行
      const authMePromise2 = page.waitForResponse(
        (res) => res.url().includes("/api/auth/me"),
        { timeout: 10_000 }
      );
      await page.reload();
      await authMePromise2;
      await expect(navbar.logoutButton).toBeVisible({ timeout: 5_000 });
    });

    test("錯誤密碼應顯示錯誤訊息", async ({ page, context }) => {
      const testUser = makeUser("li");
      await page.request.post("/api/auth/register", { data: { ...testUser } });
      await context.clearCookies();

      await page.goto("/login");
      await page.locator("#login-username").fill(testUser.username);
      await page.locator("#login-password").fill("WrongPass999");

      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/login")),
        page.getByRole("button", { name: /登入/ }).click(),
      ]);

      expect(response.status()).toBeGreaterThanOrEqual(400);
      await expect(page.locator('p[role="alert"]')).toBeVisible();
    });

    test("不存在的帳號應顯示錯誤訊息", async ({ page }) => {
      await page.goto("/login");
      await page.locator("#login-username").fill("nobody_xyz_9999");
      await page.locator("#login-password").fill("anypass");

      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/login")),
        page.getByRole("button", { name: /登入/ }).click(),
      ]);

      expect(response.status()).toBeGreaterThanOrEqual(400);
      await expect(page.locator('p[role="alert"]')).toBeVisible();
    });

    test("還沒帳號連結應指向註冊頁", async ({ page }) => {
      await page.goto("/login");
      const registerLink = page.locator("main").getByRole("link", { name: "註冊" });
      await expect(registerLink).toBeVisible();
      await expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  test.describe("登出流程", () => {
    test("登出後應回到首頁且顯示未登入狀態", async ({ page, context }) => {
      const testUser = makeUser("lo");
      const navbar = new NavbarPage(page);

      // 建立帳號並先用 API 登入（browser 自動獲得 cookie）
      await page.request.post("/api/auth/register", { data: { ...testUser } });

      // 清除 cookie 後用 UI 登入
      await context.clearCookies();
      await page.goto("/login");
      await page.locator("#login-username").fill(testUser.username);
      await page.locator("#login-password").fill(testUser.password);

      const [loginRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/login")),
        page.getByRole("button", { name: /登入/ }).click(),
      ]);
      expect(loginRes.status()).toBeLessThan(400);

      await page.waitForURL("/", { timeout: 15_000 });

      // 重新載入確保 navbar 顯示已登入狀態
      const authMePromise3 = page.waitForResponse(
        (res) => res.url().includes("/api/auth/me"),
        { timeout: 10_000 }
      );
      await page.reload();
      await authMePromise3;
      await expect(navbar.logoutButton).toBeVisible({ timeout: 5_000 });

      // 執行登出
      const [logoutRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/auth/logout")),
        navbar.logoutButton.click(),
      ]);
      expect(logoutRes.status()).toBeLessThan(400);

      // 登出後 navbar 更新（直接等 link 出現，不等 auth/me）
      const desktopNav = page.locator("div.hidden.md\\:flex");
      await expect(desktopNav.getByRole("link", { name: "登入" })).toBeVisible({ timeout: 10_000 });
    });
  });
});
