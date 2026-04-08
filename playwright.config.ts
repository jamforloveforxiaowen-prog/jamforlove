import { defineConfig, devices } from "@playwright/test";

/**
 * Jam For Love E2E 測試設定
 * 文件：https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/tests",
  globalSetup: "./e2e/global-setup.ts",
  // 每個測試最長執行時間
  timeout: 30_000,
  // 全域測試期望 timeout
  expect: {
    timeout: 10_000,
  },
  // 所有測試都跑一遍，不並行（避免資料競爭）
  fullyParallel: false,
  workers: 1,
  // CI 環境下不允許 test.only
  forbidOnly: !!process.env.CI,
  // 重試次數：CI 重試 2 次，本地不重試
  retries: process.env.CI ? 2 : 0,
  // 測試報告
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  // 全域設定：每個測試共用的選項
  use: {
    baseURL: "http://localhost:3000",
    // 失敗時保留追蹤記錄
    trace: "on-first-retry",
    // 截圖只在失敗時
    screenshot: "only-on-failure",
    // 影片只在重試時錄製
    video: "on-first-retry",
    // headless 模式
    headless: true,
  },
  // 測試瀏覽器：只用 Chromium 加快速度
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // 測試前啟動 Next.js dev server（若未在執行中）
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
