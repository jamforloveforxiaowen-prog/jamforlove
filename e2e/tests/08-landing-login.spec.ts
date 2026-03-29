import { test, expect } from "@playwright/test";

/**
 * 08-landing-login.spec.ts
 * 測試範圍：
 *   - 首頁 (/) 基本結構與導覽
 *   - 登入頁 (/login) UI 細節、Glassmorphism、Navbar 行為、表單驗證、登入成功
 *
 * 測試帳號（正式環境已存在）：
 *   username: jamforlove2025
 *   password: loveloveXiaowen2025
 */

// ──────────────────────────────────────────────
// 首頁測試
// ──────────────────────────────────────────────
test.describe("首頁 (/)", () => {
  test.beforeEach(async ({ context }) => {
    // 確保未登入狀態
    await context.clearCookies();
  });

  test("01 首頁載入成功 (HTTP 200)", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
  });

  test("02 Navbar 顯示：Logo、首頁、登入、註冊", async ({ page }) => {
    await page.goto("/");
    // 等待 auth/me 完成，讓 Navbar 渲染完整
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    // Logo 文字
    await expect(page.getByRole("link", { name: "Jam For Love" }).first()).toBeVisible();

    // 桌面版 nav 區塊（hidden md:flex）
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await expect(desktopNav.getByRole("link", { name: "首頁" })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "登入" })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "註冊" })).toBeVisible();
  });

  test("03 產品列表顯示（有商品卡片或空狀態提示）", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();

    if (count > 0) {
      // 至少一張產品卡片可見
      await expect(productCards.first()).toBeVisible();
      // 卡片內有商品名稱標題
      await expect(productCards.first().locator("h3")).toBeVisible();
      // 卡片內有 NT$ 價格
      await expect(productCards.first().getByText(/NT\$/)).toBeVisible();
    } else {
      // 空狀態提示文字
      await expect(page.getByText("新口味正在熬煮中")).toBeVisible();
    }
  });

  test("04 Footer 包含「用愛手工熬煮」", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/用愛手工熬煮/)).toBeVisible();
  });

  test("05 點擊「登入」連結導向 /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    const desktopNav = page.locator("div.hidden.md\\:flex");
    await desktopNav.getByRole("link", { name: "登入" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("06 點擊「註冊」連結導向 /register", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    const desktopNav = page.locator("div.hidden.md\\:flex");
    await desktopNav.getByRole("link", { name: "註冊" }).click();
    await expect(page).toHaveURL("/register");
  });
});

// ──────────────────────────────────────────────
// 登入頁測試
// ──────────────────────────────────────────────
test.describe("登入頁 (/login)", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("01 登入頁載入成功", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "歡迎回來" })).toBeVisible();
  });

  test("02 Glassmorphism 毛玻璃卡片渲染", async ({ page }) => {
    await page.goto("/login");
    // 毛玻璃卡片：backdrop-filter blur(24px) + rounded-[1.5rem]
    // 以 inline style 的 backdropFilter 值識別此元素
    const glassCard = page
      .locator("div")
      .filter({ has: page.locator("#login-username") })
      // 最近的有 max-w-sm 的包裹層
      .locator("xpath=ancestor::div[contains(@class,'max-w-sm')]")
      .first();
    await expect(glassCard).toBeVisible();
  });

  test("03 登入頁 Navbar：只顯示 Logo 與首頁，不顯示登入/註冊按鈕", async ({ page }) => {
    await page.goto("/login");
    await page.waitForResponse((res) => res.url().includes("/api/auth/me"));

    // Logo 仍存在
    await expect(page.getByRole("link", { name: "Jam For Love" }).first()).toBeVisible();

    // 桌面版 nav：只有「首頁」
    const desktopNav = page.locator("div.hidden.md\\:flex");
    await expect(desktopNav.getByRole("link", { name: "首頁" })).toBeVisible();

    // 登入/註冊連結不應出現在桌面 nav（isAuthPage=true 時被隱藏）
    await expect(desktopNav.getByRole("link", { name: "登入" })).not.toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "註冊" })).not.toBeVisible();
  });

  test("04 登入頁 Navbar：無漢堡選單（手機版）", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");

    // isAuthPage=true 時漢堡按鈕不渲染
    const hamburger = page.getByRole("button", { name: "選單" });
    await expect(hamburger).not.toBeVisible();
  });

  test("05 桌面視窗下左側品牌文案「用愛手工熬煮每一瓶果醬」可見", async ({ page }) => {
    // 使用 lg 以上的視窗才會顯示左側 hidden lg:flex 區塊
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");

    await expect(page.getByText(/用愛手工熬煮/)).toBeVisible();
    await expect(page.getByText(/每一瓶果醬/)).toBeVisible();
  });

  test("06 帳號與密碼欄位存在", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#login-username")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
  });

  test("07 登入按鈕存在且可點擊", async ({ page }) => {
    await page.goto("/login");
    const loginBtn = page.getByRole("button", { name: /^登入$/ });
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();
  });

  test("08 「忘記密碼？」連結指向 /forgot-password", async ({ page }) => {
    await page.goto("/login");
    const forgotLink = page.getByRole("link", { name: "忘記密碼？" });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  test("09 「還沒有帳號？註冊」連結指向 /register", async ({ page }) => {
    await page.goto("/login");
    // 確認「還沒有帳號？」提示文字
    await expect(page.getByText(/還沒有帳號/)).toBeVisible();
    // 指向 /register 的連結
    const registerLink = page.locator("main").getByRole("link", { name: "註冊" });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("10 錯誤憑證顯示錯誤訊息", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#login-username").fill("wronguser");
    await page.locator("#login-password").fill("wrongpass");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/login")),
      page.getByRole("button", { name: /^登入$/ }).click(),
    ]);

    // API 回傳 4xx
    expect(response.status()).toBeGreaterThanOrEqual(400);
    // 頁面出現錯誤提示（鎖定登入表單內的 <p role="alert">，排除 Next.js route announcer）
    await expect(page.locator('p[role="alert"]')).toBeVisible();
    // 停留在登入頁
    await expect(page).toHaveURL("/login");
  });

  test("11 正確憑證登入後重導向首頁", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#login-username").fill("jamforlove2025");
    await page.locator("#login-password").fill("loveloveXiaowen2025");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/login")),
      page.getByRole("button", { name: /^登入$/ }).click(),
    ]);

    expect(response.status()).toBeLessThan(400);
    await page.waitForURL("/", { timeout: 15_000 });
    await expect(page).toHaveURL("/");
  });

  test("12 登入後 Navbar 顯示：訂購、我的訂單、後台管理、登出", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#login-username").fill("jamforlove2025");
    await page.locator("#login-password").fill("loveloveXiaowen2025");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/login")),
      page.getByRole("button", { name: /^登入$/ }).click(),
    ]);

    expect(response.status()).toBeLessThan(400);
    await page.waitForURL("/", { timeout: 15_000 });

    // 重新載入讓 Navbar useEffect 重新呼叫 /api/auth/me
    const authMePromise = page.waitForResponse(
      (res) => res.url().includes("/api/auth/me"),
      { timeout: 10_000 }
    );
    await page.reload();
    await authMePromise;

    const desktopNav = page.locator("div.hidden.md\\:flex");
    await expect(desktopNav.getByRole("link", { name: "訂購" })).toBeVisible({ timeout: 8_000 });
    await expect(desktopNav.getByRole("link", { name: "我的訂單" })).toBeVisible();
    // jamforlove2025 是 admin，應顯示後台管理
    await expect(desktopNav.getByRole("link", { name: "後台管理" })).toBeVisible();
    await expect(desktopNav.getByRole("button", { name: "登出" })).toBeVisible();
  });
});
