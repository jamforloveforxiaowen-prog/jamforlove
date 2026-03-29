import { test, expect } from "@playwright/test";
import { MyOrdersPage } from "../pages/MyOrdersPage";

/**
 * 我的訂單頁測試
 * 驗證：訂單列表顯示、空狀態、需要認證
 *
 * 重要：
 * - page.request 和 browser 共用 BrowserContext
 * - 呼叫 register API 後，browser 自動已登入
 */

function makeUser() {
  const ts = Date.now().toString().slice(-10);
  return {
    username: `mo${ts}`,   // mo + 10碼 = 12 字元
    password: "Orders@1234",
    name: "訂單測試員",
    email: `mo${ts}@test.com`,
  };
}

test.describe("我的訂單頁", () => {
  // 每個測試前清除 cookies
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test.describe("未登入狀態", () => {
    test("未登入訪問應重導向登入頁", async ({ page }) => {
      // cookies 已清除，確保未登入
      await page.goto("/my-orders");
      await expect(page).toHaveURL("/login", { timeout: 10_000 });
    });
  });

  test.describe("已登入狀態（新帳號，無訂單）", () => {
    test.beforeEach(async ({ page }) => {
      // 建立帳號後 browser 自動已登入
      const testUser = makeUser();
      const res = await page.request.post("/api/auth/register", {
        data: { ...testUser },
      });
      if (!res.ok()) {
        throw new Error(`建立測試帳號失敗：${await res.text()}`);
      }
    });

    test("新帳號應顯示空訂單狀態", async ({ page }) => {
      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();

      await myOrdersPage.assertPageVisible();
      await myOrdersPage.assertEmptyState();
    });

    test("空訂單頁的「去逛逛果醬」按鈕應導向訂購頁", async ({ page }) => {
      const myOrdersPage = new MyOrdersPage(page);
      await myOrdersPage.goto();
      await myOrdersPage.waitForLoad();

      await myOrdersPage.goShoppingButton.click();
      await expect(page).toHaveURL("/order");
    });
  });
});
