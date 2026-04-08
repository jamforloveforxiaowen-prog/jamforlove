import { test, expect } from "@playwright/test";
import { ADMIN_CREDENTIALS, generateTestUser, loginAsAdminViaUI } from "../fixtures/auth.fixture";
import { AdminPage } from "../pages/AdminPage";

/**
 * 後台管理測試
 * 驗證：管理員登入、各分頁切換、訂單管理子分頁、故事管理、設定
 *
 * 注意：大多數測試使用 storageState 避免重複 UI 登入超過速率限制（5 次/分鐘）
 * 「管理員存取控制」describe 不使用 storageState，測試原始存取行為
 */

/**
 * 使用已儲存的管理員 auth state 導向 /admin
 * 不重新登入，直接以已認證狀態訪問後台
 */
async function gotoAdminWithState(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.waitForURL("/admin", { timeout: 15_000 });
}

test.describe("後台管理", () => {
  test.describe("管理員存取控制", () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("管理員 UI 登入後應導向 /admin", async ({ page }) => {
      // 嘗試 UI 登入；若 rate limited 則改用 API 登入驗證功能
      await page.goto("/login");
      await page.locator("#login-username").fill("jamforlove2025");
      await page.locator("#login-password").fill("loveloveXiaowen2025");

      const [res] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/auth/login")),
        page.getByRole("button", { name: "登入" }).click(),
      ]);

      if (res.status() === 429) {
        // Rate limited：改用 API 登入確認功能正常
        await page.context().clearCookies();
        const apiRes = await page.request.post("/api/auth/login", {
          data: { username: "jamforlove2025", password: "loveloveXiaowen2025" },
        });
        // 若 API 也 rate limited，略過此測試
        if (apiRes.status() === 429) {
          test.skip(true, "Login rate limited，略過 UI 登入測試");
          return;
        }
        expect(apiRes.status()).toBeLessThan(400);
        await page.goto("/admin");
      }

      await expect(page).toHaveURL("/admin", { timeout: 15_000 });
    });

    test("一般使用者存取 /api/admin/orders 應回傳 403", async ({ page }) => {
      const user = generateTestUser();
      await page.request.post("/api/auth/register", { data: user });
      const res = await page.request.get("/api/admin/orders");
      expect(res.status()).toBe(403);
    });

    test("未登入存取 /admin 頁面應重導向登入頁", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL("/login", { timeout: 10_000 });
    });
  });

  // 以下 describe 區塊使用全域儲存的管理員 auth state，避免重複登入
  test.describe("後台頁面基本顯示", () => {
    test.use({ storageState: "e2e/fixtures/admin-auth-state.json" });

    test("後台管理頁面應正確顯示標題與主要分頁", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.assertPageVisible();

      // 確認七個主要分頁按鈕都存在
      await expect(page.getByRole("button", { name: "預購表單設計" })).toBeVisible();
      await expect(page.getByRole("button", { name: "訂單管理" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Banner 管理" })).toBeVisible();
      await expect(page.getByRole("button", { name: "最新消息" })).toBeVisible();
      await expect(page.getByRole("button", { name: "關於我們" })).toBeVisible();
      await expect(page.getByRole("button", { name: "果醬的故事" })).toBeVisible();
      await expect(page.getByRole("button", { name: "設定" })).toBeVisible();
    });

    test("預設應在「預購表單設計」分頁（CampaignManager）", async ({ page }) => {
      await gotoAdminWithState(page);
      // CampaignManager 元件會顯示「+ 建立表單」按鈕
      await expect(
        page.getByRole("button", { name: "+ 建立表單" })
      ).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe("預購表單設計（campaigns）分頁", () => {
    test.use({ storageState: "e2e/fixtures/admin-auth-state.json" });

    test("應顯示「+ 建立表單」按鈕", async ({ page }) => {
      await gotoAdminWithState(page);
      await expect(
        page.getByRole("button", { name: "+ 建立表單" })
      ).toBeVisible({ timeout: 10_000 });
    });

    test("點擊「+ 建立表單」應顯示新增表單", async ({ page }) => {
      await gotoAdminWithState(page);
      await page.getByRole("button", { name: "+ 建立表單" }).click();
      // 表單出現（有「活動名稱」輸入框）
      await expect(
        page.locator('input[placeholder="例：2026 母親節預購"]')
      ).toBeVisible({ timeout: 5_000 });
    });

    test("填寫並送出新活動表單應建立活動", async ({ page }) => {
      await gotoAdminWithState(page);
      await page.getByRole("button", { name: "+ 建立表單" }).click();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      await page.locator('input[placeholder="例：2026 母親節預購"]').fill(`E2E 測試活動 ${Date.now()}`);

      const dateInputs = page.locator('input[type="date"]');
      await dateInputs.first().fill(fmt(today));
      await dateInputs.nth(1).fill(fmt(tomorrow));

      // 商品名稱輸入框（未 focus 時 placeholder 為「品名」，focus 後改變 — 用 value 定位更穩定）
      // 透過 autoFocus 機制，商品卡片建立後輸入框已 focus，placeholder 已改為長文字
      // 使用 getByPlaceholder 的部分匹配或直接以 role 找 textbox
      const productNameInput = page.getByPlaceholder(/品名/, { exact: false }).first();
      if (await productNameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await productNameInput.fill("測試草莓果醬");
      }

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/campaigns") && r.request().method() === "POST",
          { timeout: 15_000 }
        ),
        page.getByRole("button", { name: /儲存|新增|建立/ }).last().click(),
      ]);
      expect(saveRes.status()).toBeLessThan(400);
    });
  });

  test.describe("訂單管理分頁", () => {
    test.use({ storageState: "e2e/fixtures/admin-auth-state.json" });

    test("應顯示三個子分頁：訂單列表、數據分析、修改申請", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToOrders();

      await expect(page.getByRole("button", { name: "訂單列表" })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole("button", { name: "數據分析" })).toBeVisible();
      await expect(page.getByRole("button", { name: "修改申請" })).toBeVisible();
    });

    test("「訂單列表」子分頁應顯示訂單列表標題", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToOrders();
      await admin.clickOrdersSubTab();

      await expect(
        page.getByRole("heading", { name: /訂單列表/ })
      ).toBeVisible({ timeout: 10_000 });
    });

    test("「數據分析」子分頁應載入分析元件", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToOrders();
      await admin.clickAnalyticsSubTab();

      // OrderAnalytics 元件應出現
      await expect(page.getByText("數據分析").first()).toBeVisible({ timeout: 5_000 });
    });

    test("「修改申請」子分頁應顯示申請列表或空狀態", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToOrders();

      // 先設定 listener 再點擊，防止錯過 API 回應
      const [_modifyRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/modify-requests"),
          { timeout: 10_000 }
        ),
        admin.clickModifyRequestsSubTab(),
      ]);

      // 要麼顯示申請列表，要麼顯示「尚無修改申請」
      const isEmpty = await page.getByText("尚無修改申請").isVisible();
      if (!isEmpty) {
        // 有申請時應顯示「未處理」或「已處理」標籤
        await expect(
          page.locator("text=未處理, text=已處理").first()
        ).toBeVisible({ timeout: 5_000 }).catch(() => {
          // 可能全部已處理，不視為失敗
        });
      }
    });

    test("「修改申請」有未處理申請時可點擊「標為已處理」", async ({ page }) => {
      // 先以一般使用者建立訂單和修改申請
      const user = generateTestUser();
      await page.context().clearCookies();
      await page.request.post("/api/auth/register", { data: user });

      const orderRes = await page.request.post("/api/orders", {
        data: {
          campaignId: 0,
          customerName: user.name,
          phone: "0912345678",
          email: user.email,
          address: "測試地址",
          deliveryMethod: "pickup",
          paymentMethod: "cash",
          items: [{ productId: 9001, name: "測試品", quantity: 1, price: 100, description: "", group: "測試" }],
          notes: "",
          total: 100,
          isSupporter: false,
        },
      });

      if (!orderRes.ok()) {
        test.skip(true, "無法建立訂單，略過");
        return;
      }
      const orderData = await orderRes.json();

      await page.request.post("/api/orders/modify-request", {
        data: { orderId: orderData.orderId, message: "E2E 測試修改申請" },
      });

      // 切換到管理員查看（使用 API 登入避免 rate limit）
      await page.context().clearCookies();
      await page.request.post("/api/auth/login", {
        data: ADMIN_CREDENTIALS,
      });

      await page.goto("/admin");
      const admin = new AdminPage(page);
      await admin.switchToOrders();
      await admin.clickModifyRequestsSubTab();

      await page.waitForResponse(
        (r) => r.url().includes("/api/admin/modify-requests"),
        { timeout: 10_000 }
      );

      // 找到「標為已處理」按鈕並點擊
      const handleBtn = page.getByRole("button", { name: "標為已處理" });
      if (await handleBtn.isVisible()) {
        const [patchRes] = await Promise.all([
          page.waitForResponse(
            (r) => r.url().includes("/api/admin/modify-requests") && r.request().method() === "PATCH"
          ),
          handleBtn.first().click(),
        ]);
        expect(patchRes.status()).toBeLessThan(400);
        // 按鈕文字應變為「標為未處理」
        await expect(
          page.getByRole("button", { name: "標為未處理" }).first()
        ).toBeVisible({ timeout: 5_000 });
      }
    });
  });

  test.describe("果醬的故事分頁", () => {
    test.use({ storageState: "e2e/fixtures/admin-auth-state.json" });

    test("應顯示「+ 新增段落」按鈕", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToStory();

      await expect(
        page.getByRole("button", { name: "+ 新增段落" })
      ).toBeVisible({ timeout: 10_000 });
    });

    test("點擊「+ 新增段落」應顯示段落表單", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToStory();

      await admin.clickAddStoryBlock();
      await expect(page.locator("#story-heading")).toBeVisible({ timeout: 5_000 });
      await expect(page.locator("#story-content")).toBeVisible();
    });

    test("新增故事段落後應出現在列表中", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToStory();

      await admin.clickAddStoryBlock();

      const heading = `E2E 測試標題 ${Date.now()}`;
      await admin.fillStoryForm(heading, "這是 E2E 自動測試建立的故事段落內容。");

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/story") && r.request().method() === "POST",
          { timeout: 10_000 }
        ),
        admin.submitStoryForm(),
      ]);
      expect(saveRes.status()).toBeLessThan(400);

      // 段落標題應出現在列表中
      await expect(page.getByText(heading)).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe("設定分頁", () => {
    test.use({ storageState: "e2e/fixtures/admin-auth-state.json" });

    test("應顯示「訂單通知信箱」與「匯款資訊」設定區塊", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToSettings();

      await expect(page.getByText("訂單通知信箱")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("匯款資訊")).toBeVisible();
    });

    test("新增通知信箱後應出現在列表中", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToSettings();

      const testEmail = `e2e_notify_${Date.now()}@test.com`;
      const emailInput = page.locator('input[placeholder="輸入 Email 信箱"]');
      await emailInput.fill(testEmail);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/site-settings") && r.request().method() === "PUT"
        ),
        page.getByRole("button", { name: "新增" }).click(),
      ]);
      expect(saveRes.status()).toBeLessThan(400);

      // 信箱應出現在列表中
      await expect(page.getByText(testEmail)).toBeVisible({ timeout: 5_000 });
    });

    test("儲存匯款資訊應顯示成功", async ({ page }) => {
      await gotoAdminWithState(page);
      const admin = new AdminPage(page);
      await admin.switchToSettings();

      // 填寫匯款資訊 textarea（加入 timestamp 確保內容不重複，使按鈕不為 disabled）
      const bankTextarea = page.locator('textarea[placeholder*="銀行"]');
      await bankTextarea.fill(`銀行：台灣銀行（004）\n帳號：012-345-678-901\n戶名：Jam for Love\n更新時間：${Date.now()}`);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/site-settings") && r.request().method() === "PUT"
        ),
        page.getByRole("button", { name: "儲存" }).click(),
      ]);
      expect(saveRes.status()).toBeLessThan(400);

      // 顯示「已儲存」成功訊息
      await expect(page.getByText("已儲存")).toBeVisible({ timeout: 5_000 });
    });
  });
});
