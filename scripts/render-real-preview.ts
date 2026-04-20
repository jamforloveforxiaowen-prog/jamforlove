/**
 * 用真實訂單資料渲染一封更正信。
 * 用法：npx tsx scripts/render-real-preview.ts <orderId>
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnvOverride(path: string) {
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[m[1]] = val;
  }
}
loadEnvOverride(resolve(process.cwd(), ".env.local"));

interface OrderItemRow {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

async function main() {
  const { db } = await import("../src/lib/db");
  const { fundraiseOrders, siteSettings } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { renderOrderConfirmationHtml } = await import("../src/lib/email");

  const bankRow = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "bank_transfer_info"))
    .get();
  const bankTransferInfo = bankRow?.value || "";
  const orderId = Number(process.argv[2]);
  if (!orderId) {
    console.error("請指定 orderId");
    process.exit(1);
  }

  const order = await db
    .select()
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.id, orderId))
    .get();

  if (!order) {
    console.error("找不到訂單");
    process.exit(1);
  }

  const items = JSON.parse(order.items || "[]") as OrderItemRow[];
  const combos = items.map((i) => ({
    name: i.name,
    items: [i.description || ""],
    quantity: i.quantity,
    price: i.price,
  }));

  const html = renderOrderConfirmationHtml(
    {
      customerName: order.customerName,
      email: order.email,
      combos,
      addons: [],
      total: order.total,
      discountAmount: order.discountAmount,
      shippingFee: order.shippingFee,
      deliveryMethod: order.deliveryMethod,
      paymentMethod: order.paymentMethod,
      address: order.address,
      notes: order.notes,
      orderId: order.id,
      bankTransferInfo,
    },
    { isCorrection: true }
  );

  const path = `/tmp/correction-order-${orderId}.html`;
  writeFileSync(path, html);
  console.log(`HTML 寫入：${path}\n`);

  console.log("─".repeat(60));
  console.log("【信件標題】");
  console.log(`【更正版】收到你的心意了！— 訂單 #${order.id} 確認`);
  console.log("─".repeat(60));
  console.log("【信件內容（純文字版）】\n");

  console.log("                  Jam for Love");
  console.log("                ~ 用愛手工熬煮 ~");
  console.log("                    — ♥ —\n");
  console.log("┌────────────────────────────────────────────────┐");
  console.log("│ 訂單資訊更正通知                                 │");
  console.log("│                                                │");
  console.log("│ 先前寄出的訂單確認信,「取貨方式」欄位固定       │");
  console.log("│ 顯示為「面交 / 暨大取貨」,未呈現您實際選擇的    │");
  console.log("│ 地點。在此為您補上完整、正確的訂單資訊。         │");
  console.log("│ 造成困擾,非常抱歉!                             │");
  console.log("│                                                │");
  console.log("│ 此信為系統自動寄送,請勿直接回覆本信件。         │");
  console.log("│ 如需聯繫,請來信 jam.for.love.wny@gmail.com。    │");
  console.log("└────────────────────────────────────────────────┘\n");
  console.log(`${order.customerName},你好!`);
  console.log("收到你的心意了!謝謝你支持 Jam for Love,");
  console.log("你的每一份溫暖,都是學生們繼續手作的最大動力。\n");
  console.log("── 訂單明細 ─────────────────────");
  console.log(`訂單編號 #${order.id}\n`);
  console.log("品項                               數量    小計");
  for (const i of items) {
    const line = `${i.name}${i.description ? ` (${i.description})` : ""}`;
    const qty = `×${i.quantity}`;
    const sub = `NT$ ${i.price * i.quantity}`;
    console.log(`${line.padEnd(35)} ${qty.padEnd(7)} ${sub}`);
  }
  console.log("─────────────────────────────");
  const subtotal = order.total - (order.shippingFee || 0) + (order.discountAmount || 0);
  if (order.discountAmount > 0 || order.shippingFee > 0) {
    console.log(`小計                                   NT$ ${subtotal}`);
  }
  if (order.discountAmount > 0) {
    console.log(`♥ 支持者折扣                          -NT$ ${order.discountAmount}`);
  }
  if (order.shippingFee > 0) {
    console.log(`運費                                   NT$ ${order.shippingFee}`);
  }
  console.log(`合計                                   NT$ ${order.total}\n`);
  console.log("── 收件資訊 ─────────────────────");
  console.log(`姓名         ${order.customerName}`);
  console.log(
    `取貨方式     ${
      order.deliveryMethod === "shipping" ? "郵寄" : `面交 — ${order.address}`
    }`
  );
  console.log(`付款方式     ${order.paymentMethod === "transfer" ? "匯款" : "現金"}`);
  if (order.deliveryMethod === "shipping") {
    console.log(`寄送地址     ${order.address}`);
  }
  if (order.notes) {
    console.log(`備註         ${order.notes}`);
  }
  if (order.paymentMethod === "transfer" && bankTransferInfo) {
    console.log("\n── 匯款資訊 ─────────────────────");
    console.log(bankTransferInfo);
  }
  console.log("\n我們會用心為你準備每一份商品,");
  console.log("有任何問題都歡迎隨時聯繫我們!");
  console.log("                  ♥\n");
  console.log("─────────────────────────────");
  console.log("Jam for Love — 用愛手工熬煮");
  console.log("此為系統自動發送的訂單確認信,請勿直接回覆");
  console.log("─".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
