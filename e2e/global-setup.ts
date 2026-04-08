import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * 全域測試前置作業
 * 1. 儲存管理員登入狀態，供 admin 相關測試使用（避免重複登入超過速率限制）
 * 2. 建立並儲存一般測試使用者狀態，供 order/my-orders 等測試使用
 */
export default async function globalSetup() {
  const browser = await chromium.launch();

  // ── 1. 管理員 auth state ──
  {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3000" });
    const page = await ctx.newPage();

    const res = await page.request.post("http://localhost:3000/api/auth/login", {
      data: {
        username: "jamforlove2025",
        password: "loveloveXiaowen2025",
      },
    });

    if (!res.ok()) {
      console.error("Global setup: admin login failed", res.status());
    } else {
      await ctx.storageState({ path: "e2e/fixtures/admin-auth-state.json" });
      console.log("Global setup: admin auth state saved");
    }

    await ctx.close();
  }

  // ── 2. 一般測試使用者 auth state ──
  // 建立一個固定的測試帳號，供 ordering / my-orders 測試使用
  {
    const ctx = await browser.newContext({ baseURL: "http://localhost:3000" });
    const page = await ctx.newPage();

    const testUser = {
      username: "e2e_test_consumer",
      password: "Test@1234",
      name: "E2E 測試消費者",
      email: "e2e_test_consumer@test.com",
    };

    // 嘗試先登入（帳號可能已存在）
    const loginRes = await page.request.post("http://localhost:3000/api/auth/login", {
      data: { username: testUser.username, password: testUser.password },
    });

    if (!loginRes.ok()) {
      // 帳號不存在，建立新帳號
      const regRes = await page.request.post("http://localhost:3000/api/auth/register", {
        data: testUser,
      });
      if (!regRes.ok()) {
        console.warn("Global setup: consumer register failed", regRes.status());
      } else {
        console.log("Global setup: consumer user registered");
      }
    } else {
      console.log("Global setup: consumer user logged in (existing account)");
    }

    // 儲存 auth state（無論登入或註冊都已有 cookie）
    await ctx.storageState({ path: "e2e/fixtures/consumer-auth-state.json" });
    console.log("Global setup: consumer auth state saved");

    // 同時把 testUser 資訊存到 JSON 供測試引用
    const fixtureData = { ...testUser };
    fs.writeFileSync(
      path.join("e2e/fixtures/test-consumer.json"),
      JSON.stringify(fixtureData, null, 2)
    );

    await ctx.close();
  }

  await browser.close();
}
