import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { NavbarPage } from "../pages/NavbarPage";

/**
 * 首頁測試
 * 驗證：Hero 區塊、品牌故事、產品列表、頁尾
 */
test.describe("首頁", () => {
  test("應顯示 Hero 區塊與品牌標語", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await home.assertHeroVisible();
    // 驗證副標題
    await expect(page.getByText("Handmade with Love")).toBeVisible();
    // 驗證品牌描述文字
    await expect(page.getByText(/嚴選當季新鮮水果/)).toBeVisible();
  });

  test("應顯示品牌故事區塊", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await home.assertBrandStoryVisible();
    await expect(page.getByText(/我們相信，最好的果醬/)).toBeVisible();
  });

  test("應顯示頁尾", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await home.assertFooterVisible();
    await expect(page.getByText("用愛手工熬煮")).toBeVisible();
  });

  test("點擊「立即訂購」未登入應重導向登入頁", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    await home.clickOrderButton();
    // 未登入時 middleware 會重導向到 /login
    await expect(page).toHaveURL("/login");
  });

  test("導覽列應有登入與註冊連結（未登入狀態）", async ({ page }) => {
    const home = new HomePage(page);
    const navbar = new NavbarPage(page);

    await home.goto();
    await navbar.waitForAuthReady();

    await navbar.assertLoggedOut();
  });

  test("Logo 連結應回到首頁", async ({ page }) => {
    const navbar = new NavbarPage(page);
    // 先進入其他頁面
    await page.goto("/login");
    await navbar.clickLogo();
    await expect(page).toHaveURL("/");
  });

  test("產品列表：若有產品應顯示商品卡片", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    const count = await home.getProductCount();
    if (count > 0) {
      // 有產品時驗證結構
      const firstCard = page.locator('a[href^="/products/"]').first();
      await expect(firstCard).toBeVisible();
      // 應含有產品名稱（font-serif font-bold）
      await expect(firstCard.locator("h3")).toBeVisible();
      // 應含有價格
      await expect(firstCard.getByText(/NT\$/)).toBeVisible();
    } else {
      // 無產品時應顯示提示文字
      await expect(page.getByText("新口味正在熬煮中")).toBeVisible();
    }
  });

  test("點擊產品卡片應導向產品詳情頁", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    const count = await home.getProductCount();
    if (count === 0) {
      test.skip(count === 0, "沒有上架產品，略過此測試");
      return;
    }

    await home.clickFirstProduct();
    await expect(page).toHaveURL(/\/products\/\d+/);
  });
});
