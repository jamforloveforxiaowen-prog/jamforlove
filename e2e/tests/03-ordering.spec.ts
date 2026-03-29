import { test, expect } from "@playwright/test";
import { OrderPage } from "../pages/OrderPage";
import { MyOrdersPage } from "../pages/MyOrdersPage";

/**
 * 訂購流程測試
 * 驗證：選擇產品、購物車、填寫收件資料、送出訂單
 *
 * 重要：
 * - page.request 和 browser 共用同一個 BrowserContext
 * - 呼叫 /api/auth/register 後，browser 已登入（有 cookie）
 * - 無需再透過 UI 登入，直接訪問受保護頁面即可
 * - 帳號最長 20 字元：od + 10碼 = 12 字元
 */

function makeUser() {
  const ts = Date.now().toString().slice(-10);
  return {
    username: `od${ts}`,
    password: "Order@1234",
    name: "訂購測試員",
    email: `od${ts}@test.com`,
  };
}

const shippingInfo = {
  name: "王小明",
  phone: "0912345678",
  address: "台北市信義區信義路五段7號",
  notes: "請放置門口",
};

test.describe("訂購流程", () => {
  // 每個測試前清除 cookies，然後建立帳號（register API 會自動設 cookie）
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const testUser = makeUser();
    const res = await page.request.post("/api/auth/register", {
      data: { ...testUser },
    });
    if (!res.ok()) {
      throw new Error(`建立測試帳號失敗：${await res.text()}`);
    }
    // 此時 browser 已有登入 cookie，直接訪問受保護頁面即可
  });

  test("應正確顯示訂購頁面", async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.waitForProductsLoad();
    await orderPage.assertPageVisible();
  });

  test("未選擇產品時送出按鈕應為禁用", async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.waitForProductsLoad();
    await orderPage.assertSubmitDisabled();
  });

  test("點擊加號應增加產品數量", async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.waitForProductsLoad();

    const increaseButtons = page.getByRole("button", { name: "+" });
    if ((await increaseButtons.count()) === 0) {
      test.skip(true, "沒有上架產品，略過此測試");
      return;
    }

    await orderPage.increaseProductQuantity(0, 2);
    const qty = await orderPage.getQuantityDisplay(0);
    expect(qty).toBe("2");
  });

  test("增加產品後應顯示購物清單", async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.waitForProductsLoad();

    const increaseButtons = page.getByRole("button", { name: "+" });
    if ((await increaseButtons.count()) === 0) {
      test.skip(true, "沒有上架產品，略過此測試");
      return;
    }

    await orderPage.increaseProductQuantity(0, 1);
    await orderPage.assertCartVisible();
  });

  test("減少數量到 0 應從購物車移除", async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.waitForProductsLoad();

    const increaseButtons = page.getByRole("button", { name: "+" });
    if ((await increaseButtons.count()) === 0) {
      test.skip(true, "沒有上架產品，略過此測試");
      return;
    }

    await orderPage.increaseProductQuantity(0, 1);
    await orderPage.decreaseProductQuantity(0);

    const qty = await orderPage.getQuantityDisplay(0);
    expect(qty).toBe("0");

    const cartSummary = page.getByRole("heading", { name: "購物清單" });
    await expect(cartSummary).not.toBeVisible();
  });

  test("未選產品時 API 拒絕空訂單", async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.waitForProductsLoad();

    await orderPage.assertSubmitDisabled();

    // API 層面也應拒絕
    const res = await page.request.post("/api/orders", {
      data: {
        customerName: shippingInfo.name,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        notes: "",
        items: [],
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("完整下訂流程：選產品、填資料、送出訂單", async ({ page }) => {
    const orderPage = new OrderPage(page);
    const myOrdersPage = new MyOrdersPage(page);

    await orderPage.goto();
    await orderPage.waitForProductsLoad();

    const increaseButtons = page.getByRole("button", { name: "+" });
    if ((await increaseButtons.count()) === 0) {
      test.skip(true, "沒有上架產品，略過此測試");
      return;
    }

    // 選擇第一個產品 1 件
    await orderPage.increaseProductQuantity(0, 1);
    await orderPage.assertCartVisible();

    // 填寫收件資料
    await orderPage.fillShippingInfo(
      shippingInfo.name,
      shippingInfo.phone,
      shippingInfo.address,
      shippingInfo.notes
    );

    // 送出訂單
    const [orderRes] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/orders") && res.request().method() === "POST"
      ),
      orderPage.submitOrder(),
    ]);

    expect(orderRes.status()).toBeLessThan(400);
    await orderPage.assertSuccessVisible();

    await orderPage.clickViewOrders();
    await expect(page).toHaveURL("/my-orders");

    await myOrdersPage.waitForLoad();
    await myOrdersPage.assertHasOrders();
  });
});
