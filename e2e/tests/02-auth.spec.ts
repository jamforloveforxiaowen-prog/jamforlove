import { test, expect } from "@playwright/test";

/**
 * 認證流程測試：註冊、登入、登出
 * 帳號規則：username 3-20 字元
 *
 * 注意：/api/auth/register 有速率限制（3 次/分鐘）
 * 因此每個需要新帳號的測試都使用唯一 timestamp 避免碰撞
 * 相互獨立的 API 呼叫盡量合批，減少呼叫次數
 */

// 共用的測試帳號（在 describe 層級建立，避免重複呼叫 register API）
// 每個 describe 區塊只建立一次帳號

test.describe("使用者認證", () => {
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
      await expect(page.locator("#reg-email")).toBeVisible();
    });

    test("成功註冊後應重導向首頁", async ({ page }) => {
      const ts = Date.now();
      const user = {
        username: `rg_${ts}`,
        password: "Test@1234",
        name: "註冊測試者",
        email: `rg_${ts}@test.com`,
      };

      await page.goto("/register");
      await page.locator("#reg-username").fill(user.username);
      await page.locator("#reg-password").fill(user.password);
      await page.locator("#reg-name").fill(user.name);
      await page.locator("#reg-email").fill(user.email);

      const [res] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/auth/register")),
        page.getByRole("button", { name: "註冊" }).click(),
      ]);

      expect(res.status()).toBeLessThan(400);
      await page.waitForURL("/", { timeout: 15_000 });
      await expect(page).toHaveURL("/");
    });

    test("帳號不足 3 字元時 HTML5 驗證應阻止送出", async ({ page }) => {
      await page.goto("/register");
      await page.locator("#reg-username").fill("ab");
      await page.locator("#reg-password").fill("Test@1234");
      await page.locator("#reg-name").fill("測試");
      await page.locator("#reg-email").fill("ab@test.com");
      await page.getByRole("button", { name: "註冊" }).click();
      // HTML5 minLength 驗證阻擋，頁面停留在 /register
      await expect(page).toHaveURL("/register");
    });

    test("「已有帳號」連結應指向登入頁", async ({ page }) => {
      await page.goto("/register");
      await expect(page.getByRole("link", { name: "登入" })).toHaveAttribute("href", "/login");
    });
  });

  test.describe("登入流程", () => {
    test("應正確顯示登入頁面", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByRole("heading", { name: "歡迎回來" })).toBeVisible();
      await expect(page.locator("#login-username")).toBeVisible();
      await expect(page.locator("#login-password")).toBeVisible();
    });

    test("使用管理員帳號登入後應重導向 /admin", async ({ page }) => {
      await page.goto("/login");
      await page.locator("#login-username").fill("jamforlove2025");
      await page.locator("#login-password").fill("loveloveXiaowen2025");

      const [res] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/auth/login")),
        page.getByRole("button", { name: "登入" }).click(),
      ]);
      expect(res.status()).toBeLessThan(400);
      await page.waitForURL("/admin", { timeout: 15_000 });
      await expect(page).toHaveURL("/admin");
    });

    test("錯誤密碼應顯示錯誤訊息", async ({ page }) => {
      await page.goto("/login");
      await page.locator("#login-username").fill("jamforlove2025");
      await page.locator("#login-password").fill("WrongPass999");

      const [res] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/auth/login")),
        page.getByRole("button", { name: "登入" }).click(),
      ]);
      expect(res.status()).toBeGreaterThanOrEqual(400);
      // 使用 p[role="alert"] 排除 Next.js route announcer div
      await expect(page.locator('p[role="alert"]')).toBeVisible();
    });

    test("不存在的帳號應顯示錯誤訊息", async ({ page }) => {
      await page.goto("/login");
      await page.locator("#login-username").fill("nobody_xyz_e2e");
      await page.locator("#login-password").fill("anypass123");

      const [res] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/auth/login")),
        page.getByRole("button", { name: "登入" }).click(),
      ]);
      expect(res.status()).toBeGreaterThanOrEqual(400);
      await expect(page.locator('p[role="alert"]')).toBeVisible();
    });

    test("「還沒帳號」連結應指向註冊頁", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByRole("link", { name: "註冊" })).toHaveAttribute("href", "/register");
    });
  });

  test.describe("登出流程", () => {
    test("登出後應顯示未登入狀態並回到首頁", async ({ page }) => {
      // 使用管理員帳號登入（不消耗 register rate limit）
      await page.goto("/login");
      await page.locator("#login-username").fill("jamforlove2025");
      await page.locator("#login-password").fill("loveloveXiaowen2025");

      const [loginRes] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/auth/login")),
        page.getByRole("button", { name: "登入" }).click(),
      ]);
      expect(loginRes.status()).toBeLessThan(400);
      await page.waitForURL("/admin", { timeout: 15_000 });

      // 確認已登入（顯示後台管理）
      await expect(page.getByRole("link", { name: "後台管理" })).toBeVisible({ timeout: 5_000 });

      // 執行登出（點擊用戶名按鈕開啟下拉，再點擊登出）
      const userMenuBtn = page.locator('button:has(span.w-\\[6px\\].h-\\[6px\\])').first();
      await userMenuBtn.click();
      await page.getByRole("button", { name: "登出" }).click();

      await page.waitForURL("/", { timeout: 10_000 });
      // 確認已未登入（顯示「登入」連結）
      await expect(page.getByRole("link", { name: "登入" })).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe("重複帳號與 API 錯誤", () => {
    test("POST /api/auth/register 重複帳號應回傳 400", async ({ page }) => {
      const ts = Date.now();
      const user = {
        username: `dup_${ts}`,
        password: "Test@1234",
        name: "重複帳號測試",
        email: `dup_${ts}@test.com`,
      };
      // 第一次建立
      const first = await page.request.post("/api/auth/register", { data: user });
      expect(first.status()).toBeLessThan(400);

      // 第二次相同帳號（清除 cookie 讓 rate limit 以 IP 計算，不是 session）
      await page.context().clearCookies();
      const second = await page.request.post("/api/auth/register", { data: user });
      expect(second.status()).toBe(400);

      const data = await second.json();
      expect(data).toHaveProperty("error");
    });
  });
});
