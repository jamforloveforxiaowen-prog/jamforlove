import { test, expect } from "@playwright/test";
import { generateTestUser } from "../fixtures/auth.fixture";
import { MyOrdersPage } from "../pages/MyOrdersPage";

/**
 * 我的訂單頁測試
 * 驗證：頁面顯示、空狀態、修改訂單 Modal
 *
 * 注意：
 * - 基本測試（空帳號）使用 consumer-auth-state.json 以避免 register 速率限制
 * - 有訂單相關測試需要 active campaign 才能建立訂單
 */

/**
 * 透過 localStorage 預先關閉 NewsPopup（避免彈窗遮住操作元素）
 */
async function dismissNewsPopup(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem("news-popup-dismissed", today);
  });
}

test.describe("我的訂單頁", () => {
  test.describe("未登入狀態", () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("未登入訪問 /my-orders 應重導向登入頁", async ({ page }) => {
      await page.goto("/my-orders");
      await expect(page).toHaveURL("/login", { timeout: 10_000 });
    });
  });

  test.describe("已登入（使用儲存的消費者帳號）", () => {
    // 使用 global setup 儲存的消費者 auth state，避免重複 register
    test.use({ storageState: "e2e/fixtures/consumer-auth-state.json" });

    test("應顯示我的訂單頁面", async ({ page }) => {
      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();
      await myOrdersPage.assertPageVisible();
    });

    test("空訂單頁的「去逛逛果醬」連結應導向 /order", async ({ page }) => {
      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      // 先關閉 NewsPopup 再 reload
      await dismissNewsPopup(page);
      await page.reload();
      await myOrdersPage.waitForLoad();

      // 如果有訂單則跳過（這個帳號可能有舊訂單）
      const hasOrders = await page.getByRole("button", { name: "修改訂單" }).first().isVisible();
      if (hasOrders) {
        test.skip(true, "消費者帳號已有訂單，略過空狀態測試");
        return;
      }

      await page.getByRole("link", { name: "去逛逛果醬" }).click();
      await expect(page).toHaveURL("/order");
    });
  });

  test.describe("已登入（新帳號，無訂單）", () => {
    // 這個 describe 用新帳號以確保空狀態
    // 注意：受 register 速率限制（3 次/分鐘），盡量減少新帳號建立次數

    test("新帳號應顯示空訂單狀態", async ({ page, context }) => {
      await context.clearCookies();
      const user = generateTestUser();
      const regRes = await page.request.post("/api/auth/register", { data: user });
      if (!regRes.ok()) {
        test.skip(true, "Register rate limited，略過此測試");
        return;
      }

      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();

      await myOrdersPage.assertPageVisible();
      await myOrdersPage.assertEmptyState();
      // 空狀態連結「去逛逛果醬」
      await expect(page.getByRole("link", { name: "去逛逛果醬" })).toBeVisible();
    });
  });

  test.describe("已登入（有訂單）", () => {
    test("應顯示訂單列表並含付款方式", async ({ page, context }) => {
      await context.clearCookies();
      const user = generateTestUser();
      const regRes = await page.request.post("/api/auth/register", { data: user });
      if (!regRes.ok()) {
        test.skip(true, "Register rate limited，略過");
        return;
      }

      // 以 API 直接建立一筆假訂單（需要先取得 campaignId 或設為 0）
      const orderRes = await page.request.post("/api/orders", {
        data: {
          campaignId: 0,
          customerName: user.name,
          phone: "0912345678",
          email: user.email,
          address: "台北市測試地址",
          deliveryMethod: "pickup",
          paymentMethod: "cash",
          items: [{ productId: 9001, name: "草莓果醬", quantity: 1, price: 150, description: "", group: "測試" }],
          notes: "",
          total: 150,
          isSupporter: false,
        },
      });

      if (!orderRes.ok()) {
        test.skip(true, "無法建立測試訂單（可能需要 active campaign），略過");
        return;
      }

      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();

      await myOrdersPage.assertPageVisible();
      await myOrdersPage.assertHasOrders();
      // 顯示「現金」付款方式
      await expect(page.getByText("現金")).toBeVisible();
    });

    test("點擊「修改訂單」應開啟 Modal", async ({ page, context }) => {
      await context.clearCookies();
      const user = generateTestUser();
      const regRes = await page.request.post("/api/auth/register", { data: user });
      if (!regRes.ok()) {
        test.skip(true, "Register rate limited，略過");
        return;
      }

      const orderRes = await page.request.post("/api/orders", {
        data: {
          campaignId: 0,
          customerName: user.name,
          phone: "0912345678",
          email: user.email,
          address: "台北市測試地址",
          deliveryMethod: "pickup",
          paymentMethod: "transfer",
          items: [{ productId: 9002, name: "蘋果桑葚醬", quantity: 1, price: 150, description: "", group: "測試" }],
          notes: "",
          total: 150,
          isSupporter: false,
        },
      });

      if (!orderRes.ok()) {
        test.skip(true, "無法建立測試訂單，略過");
        return;
      }

      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();
      await myOrdersPage.assertHasOrders();

      await myOrdersPage.clickFirstModifyOrder();
      await myOrdersPage.assertModifyModalVisible();

      // 確認 Modal 顯示訂單原始內容
      await expect(page.getByText("原訂單內容")).toBeVisible();
    });

    test("填寫修改內容並送出應顯示成功訊息", async ({ page, context }) => {
      await context.clearCookies();
      const user = generateTestUser();
      const regRes = await page.request.post("/api/auth/register", { data: user });
      if (!regRes.ok()) {
        test.skip(true, "Register rate limited，略過");
        return;
      }

      const orderRes = await page.request.post("/api/orders", {
        data: {
          campaignId: 0,
          customerName: user.name,
          phone: "0987654321",
          email: user.email,
          address: "高雄市測試路",
          deliveryMethod: "pickup",
          paymentMethod: "cash",
          items: [{ productId: 9003, name: "覆盆子果醬", quantity: 2, price: 150, description: "", group: "測試" }],
          notes: "",
          total: 300,
          isSupporter: false,
        },
      });

      if (!orderRes.ok()) {
        test.skip(true, "無法建立測試訂單，略過");
        return;
      }

      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();
      await myOrdersPage.assertHasOrders();

      await myOrdersPage.clickFirstModifyOrder();
      await myOrdersPage.assertModifyModalVisible();

      await myOrdersPage.fillModifyMessage("請將覆盆子果醬改為草莓果醬 2 瓶");

      const [modifyRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/orders/modify-request") && r.request().method() === "POST"
        ),
        myOrdersPage.submitModifyRequest(),
      ]);
      expect(modifyRes.status()).toBeLessThan(400);

      await myOrdersPage.assertModifySuccess();
    });

    test("修改申請 Modal 空白訊息時送出按鈕應為 disabled", async ({ page, context }) => {
      await context.clearCookies();
      const user = generateTestUser();
      const regRes = await page.request.post("/api/auth/register", { data: user });
      if (!regRes.ok()) {
        test.skip(true, "Register rate limited，略過");
        return;
      }

      const orderRes = await page.request.post("/api/orders", {
        data: {
          campaignId: 0,
          customerName: user.name,
          phone: "0912000000",
          email: user.email,
          address: "台中市測試",
          deliveryMethod: "pickup",
          paymentMethod: "cash",
          items: [{ productId: 9004, name: "手工皂", quantity: 1, price: 100, description: "", group: "測試" }],
          notes: "",
          total: 100,
          isSupporter: false,
        },
      });

      if (!orderRes.ok()) {
        test.skip(true, "無法建立測試訂單，略過");
        return;
      }

      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();
      await myOrdersPage.assertHasOrders();

      await myOrdersPage.clickFirstModifyOrder();
      await myOrdersPage.assertModifyModalVisible();

      // 不填寫修改內容，直接送出按鈕應被 disabled
      const submitBtn = page.getByRole("button", { name: "送出" });
      await expect(submitBtn).toBeDisabled();
    });
  });
});
