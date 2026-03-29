import { test, expect } from "@playwright/test";
import { AdminPage } from "../pages/AdminPage";
import { loginViaUI } from "../fixtures/auth.fixture";

/**
 * Admin 後台管理流程測試
 * 驗證：登入 admin、新增產品、編輯產品、上下架、訂單管理
 *
 * 使用已存在的 admin 帳號登入
 */

const ADMIN = {
  username: "jamforlove2025",
  password: "loveloveXiaowen2025",
};

const TEST_PRODUCT = {
  name: `測試草莓果醬_${Date.now()}`,
  price: "350",
  description: "嚴選大湖草莓，手工熬煮，酸甜適中，搭配吐司或優格都很適合。",
  imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
};

test.describe("Admin 後台管理", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    // 以 admin 身份登入
    const loginRes = await page.request.post("/api/auth/login", {
      data: { username: ADMIN.username, password: ADMIN.password },
    });
    if (!loginRes.ok()) {
      // 若 API 登入失敗，嘗試 UI 登入
      await loginViaUI(page, ADMIN.username, ADMIN.password);
    }
  });

  test("admin 可進入後台管理頁面", async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();
    await admin.assertPageVisible();
    // 應預設在產品管理 tab
    await expect(admin.addProductButton).toBeVisible();
  });

  test("非 admin 無法存取後台 API", async ({ page, context }) => {
    await context.clearCookies();
    // 建立一般使用者
    const ts = Date.now().toString().slice(-10);
    await page.request.post("/api/auth/register", {
      data: {
        username: `na${ts}`,
        password: "Test@1234",
        name: "一般使用者",
        email: `na${ts}@test.com`,
      },
    });

    // 嘗試呼叫 admin API
    const res = await page.request.get("/api/admin/products");
    expect(res.status()).toBe(403);
  });

  test("新增產品完整流程", async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();

    // 點擊新增
    await admin.clickAddProduct();
    await admin.assertFormVisible();

    // 填寫產品資料
    await admin.fillProductForm(
      TEST_PRODUCT.name,
      TEST_PRODUCT.price,
      TEST_PRODUCT.description,
      TEST_PRODUCT.imageUrl
    );

    // 送出表單，攔截 API 回應
    const [createRes] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/admin/products") &&
          res.request().method() === "POST"
      ),
      admin.submitForm(),
    ]);

    expect(createRes.status()).toBeLessThan(400);

    // 表單應收起，產品列表應包含新產品
    await admin.assertFormHidden();
    await admin.assertProductExists(TEST_PRODUCT.name);
  });

  test("新增產品缺少名稱應失敗", async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();

    await admin.clickAddProduct();
    // 只填價格，不填名稱
    await admin.fillProductForm("", "200");

    // HTML5 required 驗證應阻止送出
    await admin.submitForm();

    // 表單應該還在
    await admin.assertFormVisible();
  });

  test("編輯產品：透過 API 建立再用 UI 編輯", async ({ page }) => {
    const productName = `編輯測試果醬_${Date.now()}`;
    const updatedName = `${productName}_已修改`;

    // 先透過 API 建立產品
    const createRes = await page.request.post("/api/admin/products", {
      data: {
        name: productName,
        description: "待編輯的測試產品",
        price: 200,
        imageUrl: "",
      },
    });
    expect(createRes.ok()).toBeTruthy();

    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();

    // 點擊編輯
    await admin.clickEditProduct(productName);
    await admin.assertFormVisible();

    // 修改名稱
    await admin.fillProductForm(updatedName, "280");

    const [updateRes] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/admin/products/") &&
          res.request().method() === "PUT"
      ),
      admin.submitForm(),
    ]);

    expect(updateRes.status()).toBeLessThan(400);
    await admin.assertFormHidden();
    await admin.assertProductExists(updatedName);
  });

  test("下架與上架產品", async ({ page }) => {
    const productName = `上下架測試_${Date.now()}`;

    // 建立產品
    await page.request.post("/api/admin/products", {
      data: {
        name: productName,
        description: "上下架測試用",
        price: 150,
        imageUrl: "",
      },
    });

    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();

    // 點擊下架（需處理 confirm dialog）
    page.on("dialog", (dialog) => dialog.accept());
    await admin.clickToggleActive(productName);

    // 等待 API 回應
    await page.waitForResponse(
      (res) =>
        res.url().includes("/api/admin/products/") &&
        res.request().method() === "PUT"
    );

    // 應顯示「已下架」標記
    await expect(page.locator(`h3:has-text("${productName}")`).locator("span:has-text('已下架')")).toBeVisible();

    // 再次點擊上架
    await admin.clickToggleActive(productName);
    await page.waitForResponse(
      (res) =>
        res.url().includes("/api/admin/products/") &&
        res.request().method() === "PUT"
    );

    // 已下架標記應消失
    await expect(
      page.locator(`h3:has-text("${productName}")`).locator("span:has-text('已下架')")
    ).not.toBeVisible();
  });

  test("切換到訂單管理 tab", async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();

    await admin.switchToOrders();
    await admin.assertOrdersVisible();
  });

  test("Admin 完整情境：新增產品後使用者下單，Admin 查看訂單", async ({ page, context }) => {
    const productName = `情境測試果醬_${Date.now()}`;
    const productPrice = 320;

    // Step 1: Admin 新增產品
    const createRes = await page.request.post("/api/admin/products", {
      data: {
        name: productName,
        description: "情境測試用果醬，限量供應",
        price: productPrice,
        imageUrl: "",
      },
    });
    expect(createRes.ok()).toBeTruthy();

    // Step 2: 切換到一般使用者，下一筆訂單
    await context.clearCookies();
    const ts = Date.now().toString().slice(-10);
    const userRes = await page.request.post("/api/auth/register", {
      data: {
        username: `sc${ts}`,
        password: "Test@1234",
        name: "情境測試客人",
        email: `sc${ts}@test.com`,
      },
    });
    expect(userRes.ok()).toBeTruthy();

    // 取得產品列表找到剛建立的產品 ID
    const productsRes = await page.request.get("/api/products");
    const products = await productsRes.json();
    const targetProduct = products.find(
      (p: { name: string }) => p.name === productName
    );
    expect(targetProduct).toBeTruthy();

    // 用 API 下訂單
    const orderRes = await page.request.post("/api/orders", {
      data: {
        customerName: "李小花",
        phone: "0987654321",
        address: "新北市板橋區文化路一段100號",
        notes: "希望盡快出貨",
        items: [
          { productId: targetProduct.id, quantity: 2, price: productPrice },
        ],
      },
    });
    expect(orderRes.ok()).toBeTruthy();

    // Step 3: 切回 Admin 查看訂單
    await context.clearCookies();
    await page.request.post("/api/auth/login", {
      data: { username: ADMIN.username, password: ADMIN.password },
    });

    const admin = new AdminPage(page);
    await admin.goto();
    await admin.waitForLoad();
    await admin.switchToOrders();

    // 等待訂單列表載入
    await page.waitForResponse((res) =>
      res.url().includes("/api/admin/orders")
    );

    // 應看到收件人名稱（可能有多筆同名訂單，確認至少一筆存在）
    await expect(page.getByText("李小花").first()).toBeVisible();
    // 應看到產品名稱
    await expect(page.getByText(productName).first()).toBeVisible();
  });
});
