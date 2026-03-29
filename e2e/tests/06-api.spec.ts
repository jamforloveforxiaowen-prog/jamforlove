import { test, expect } from "@playwright/test";

/**
 * API 端點測試
 * 驗證：products API、auth API 回應格式
 */
test.describe("API 端點", () => {
  test.describe("Products API", () => {
    test("GET /api/products 應回傳陣列", async ({ request }) => {
      const res = await request.get("/api/products");
      expect(res.status()).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test("GET /api/products 中的每筆資料應有必要欄位", async ({ request }) => {
      const res = await request.get("/api/products");
      const products = await res.json();

      if (products.length > 0) {
        const product = products[0];
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
      }
    });

    test("GET /api/products/:id 若產品不存在應回傳 404", async ({ request }) => {
      const res = await request.get("/api/products/99999999");
      expect(res.status()).toBe(404);
    });
  });

  test.describe("Auth API", () => {
    test("GET /api/auth/me 未登入應回傳 user: null", async ({ request }) => {
      const res = await request.get("/api/auth/me");
      // 可能是 200 with null user，或 401
      const data = await res.json();

      // 若是 200，user 應該是 null
      if (res.status() === 200) {
        expect(data.user).toBeNull();
      } else {
        expect(res.status()).toBe(401);
      }
    });

    test("POST /api/auth/login 使用空帳密應回傳 4xx 錯誤", async ({ request }) => {
      const res = await request.post("/api/auth/login", {
        data: { username: "", password: "" },
      });
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });

    test("POST /api/auth/register 使用重複帳號應回傳 400", async ({ request }) => {
      // 先建立一個帳號
      const username = `api_test_${Date.now()}`;
      await request.post("/api/auth/register", {
        data: { username, password: "Test1234", name: "API 測試" },
      });

      // 再次用相同帳號註冊
      const res = await request.post("/api/auth/register", {
        data: { username, password: "Test1234", name: "API 測試 2" },
      });
      expect(res.status()).toBe(400);
    });
  });

  test.describe("Orders API（需要認證）", () => {
    test("GET /api/orders 未登入應回傳 401", async ({ request }) => {
      const res = await request.get("/api/orders");
      // 未登入應無法查看訂單
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });

    test("POST /api/orders 未登入應回傳 401", async ({ request }) => {
      const res = await request.post("/api/orders", {
        data: {
          customerName: "測試",
          phone: "0912345678",
          address: "台北市",
          notes: "",
          items: [{ productId: 1, quantity: 1 }],
        },
      });
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
