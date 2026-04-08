import { test, expect } from "@playwright/test";

/**
 * 完整訂購流程測試
 * 流程：訂購頁 → 確認預覽 → 感謝頁
 *
 * 注意：
 * - /order 頁面受 middleware 保護，需要登入才能訪問
 * - 大部分測試需要進行中的活動（active campaign）
 * - 若無活動則顯示「預購尚未開放」
 * - 使用 global setup 儲存的 consumer auth state 避免重複 register 超過速率限制
 */

/**
 * 透過 localStorage 預先關閉 NewsPopup（避免彈窗遮住操作元素）
 * 必須在 page.goto 之後呼叫
 */
async function dismissNewsPopup(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem("news-popup-dismissed", today);
  });
}

async function checkActiveCampaign(page: import("@playwright/test").Page) {
  const res = await page.request.get("/api/campaigns/active");
  const data = await res.json();
  return !!(data.campaign && data.campaign.status !== "out_of_range");
}

test.describe("訂購流程", () => {
  // 使用已儲存的消費者 auth state 以避免重複 register 超過速率限制（3 次/分鐘）
  test.use({ storageState: "e2e/fixtures/consumer-auth-state.json" });

  test("無活動時應顯示「預購尚未開放」", async ({ page }) => {
    const has = await checkActiveCampaign(page);
    if (has) {
      test.skip(true, "目前有進行中活動，略過此測試");
      return;
    }

    await page.goto("/order");
    await expect(
      page.getByRole("heading", { name: "預購尚未開放" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("有活動時應載入訂購表單", async ({ page }) => {
    const has = await checkActiveCampaign(page);
    if (!has) {
      test.skip(true, "無進行中活動，略過");
      return;
    }

    await page.goto("/order");
    await dismissNewsPopup(page);
    await page.reload();

    await page.waitForResponse(
      (r) => r.url().includes("/api/campaigns/active") && r.status() === 200,
      { timeout: 15_000 }
    );
    await expect(page.locator("form")).toBeVisible({ timeout: 15_000 });
    // 表單標題（活動名稱 h1）
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("完整訂購流程：選商品 → 確認頁 → 返回修改 → 再次確認 → 感謝頁", async ({ page }) => {
    const has = await checkActiveCampaign(page);
    if (!has) {
      test.skip(true, "無進行中活動，略過完整訂購測試");
      return;
    }

    await page.goto("/order");
    await dismissNewsPopup(page);
    await page.reload();

    await page.waitForResponse(
      (r) => r.url().includes("/api/campaigns/active") && r.status() === 200,
      { timeout: 15_000 }
    );
    await expect(page.locator("form")).toBeVisible({ timeout: 15_000 });

    // 選第一個「選擇」按鈕
    await page.getByRole("button", { name: "選擇" }).first().click();
    // 確認「+」按鈕出現（已選中）
    await expect(page.getByRole("button", { name: "+" }).first()).toBeVisible({ timeout: 5_000 });

    // 先選取貨方式：選第二個選項（面交，不需填地址）以避免地址欄出現多個 input[type="text"]
    const deliverySelect = page.locator("select").first();
    const optCount = await deliverySelect.locator("option").count();
    if (optCount > 1) {
      await deliverySelect.selectOption({ index: 1 });
    }

    // 填寫顧客資料（label 無 for 屬性，用 input type 定位；名字欄用 .first() 防嚴格模式違規）
    await page.locator('input[type="text"]').first().fill("訂購測試者");
    await page.locator('input[type="tel"]').fill("0912345678");
    await page.locator('input[type="email"]').fill("test@test.com");

    // 選擇「現金」付款
    await page.getByRole("button", { name: /現金/ }).click();

    // 送出表單（進入確認頁）
    await page.locator('form button[type="submit"]').click();

    // ── 確認預覽頁 ──
    await expect(
      page.getByRole("heading", { name: "請確認訂單內容" })
    ).toBeVisible({ timeout: 10_000 });

    // 確認訂單明細區塊
    await expect(page.getByText("訂單明細")).toBeVisible();
    // 確認收件資訊區塊
    await expect(page.getByText("收件資訊")).toBeVisible();
    // 確認付款方式顯示「現金」
    await expect(page.getByText("現金")).toBeVisible();

    // 點擊「返回修改」
    await page.getByRole("button", { name: "返回修改" }).click();
    // 應回到表單
    await expect(page.locator("form")).toBeVisible({ timeout: 5_000 });

    // 再次送出
    await page.locator('form button[type="submit"]').click();
    await expect(
      page.getByRole("heading", { name: "請確認訂單內容" })
    ).toBeVisible({ timeout: 10_000 });

    // 確認送出訂單（真正送出）
    const [orderRes] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/orders") && r.request().method() === "POST"
      ),
      page.getByRole("button", { name: "確認送出訂單" }).click(),
    ]);
    expect(orderRes.status()).toBeLessThan(400);

    // ── 感謝頁 ──
    await expect(
      page.getByRole("heading", { name: "收到你的心意了！" })
    ).toBeVisible({ timeout: 15_000 });
    // 確認顯示訂單編號
    await expect(page.getByText(/訂單編號/)).toBeVisible();

    // 點擊「查看我的訂單」
    await page.getByRole("link", { name: "查看我的訂單" }).click();
    await expect(page).toHaveURL("/my-orders");
  });

  test("確認頁應顯示「匯款」付款方式", async ({ page }) => {
    const has = await checkActiveCampaign(page);
    if (!has) {
      test.skip(true, "無進行中活動，略過");
      return;
    }

    await page.goto("/order");
    await dismissNewsPopup(page);
    await page.reload();

    await page.waitForResponse(
      (r) => r.url().includes("/api/campaigns/active") && r.status() === 200,
      { timeout: 15_000 }
    );
    await expect(page.locator("form")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "選擇" }).first().click();
    // 先選面交（避免地址欄導致 input[type="text"] 嚴格模式違規）
    const deliverySelect = page.locator("select").first();
    const optCount = await deliverySelect.locator("option").count();
    if (optCount > 1) {
      await deliverySelect.selectOption({ index: 1 });
    }
    await page.locator('input[type="text"]').first().fill("測試小美");
    await page.locator('input[type="tel"]').fill("0987654321");

    // 選「匯款」
    await page.getByRole("button", { name: /匯款/ }).click();

    await page.locator('form button[type="submit"]').click();

    await expect(
      page.getByRole("heading", { name: "請確認訂單內容" })
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText("匯款")).toBeVisible();
  });

  test("若有 supporter discount 且勾選「是否支持過」應顯示折扣", async ({ page }) => {
    const checkRes = await page.request.get("/api/campaigns/active");
    const checkData = await checkRes.json();
    const campaign = checkData.campaign;

    if (!campaign || campaign.status === "out_of_range" || !campaign.supporterDiscount) {
      test.skip(true, "無進行中活動或活動無舊朋友折扣，略過");
      return;
    }

    await page.goto("/order");
    await dismissNewsPopup(page);
    await page.reload();

    await page.waitForResponse(
      (r) => r.url().includes("/api/campaigns/active") && r.status() === 200,
      { timeout: 15_000 }
    );
    await expect(page.locator("form")).toBeVisible({ timeout: 15_000 });

    // 找到「是否支持過 Jam for Love」勾選按鈕
    const supporterBtn = page.getByRole("button", {
      name: /是否支持過 Jam for Love/,
    });
    await expect(supporterBtn).toBeVisible({ timeout: 5_000 });
    await supporterBtn.click();

    // 折扣資訊應出現在按鈕內
    await expect(
      page.getByText(new RegExp(`${campaign.supporterDiscount}% 折扣`))
    ).toBeVisible();
  });
});
