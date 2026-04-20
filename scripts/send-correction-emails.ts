/**
 * 面交訂單確認信補寄腳本
 *
 * 用法：
 *   npx tsx scripts/send-correction-emails.ts --dry-run
 *   npx tsx scripts/send-correction-emails.ts --send
 *
 * 會強制從 .env.local 讀取並覆蓋 process.env，避免 shell 層 export 的
 * 同名變數（例如其他 Gmail 專案設的 GMAIL_APP_PASSWORD）污染本專案。
 */
import { readFileSync } from "fs";
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
  group?: string;
}

async function main() {
  // 動態 import,確保在 loadEnvOverride 之後才載入(否則 db/email 模組會先讀到舊的 env)
  const { db } = await import("../src/lib/db");
  const { fundraiseOrders, siteSettings } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { sendOrderConfirmationEmail } = await import("../src/lib/email");

  // 讀匯款資訊(匯款訂單信中會顯示)
  const bankRow = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "bank_transfer_info"))
    .get();
  const bankTransferInfo = bankRow?.value || "";

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const send = args.includes("--send");

  if (!dryRun && !send) {
    console.error("請指定 --dry-run 或 --send");
    process.exit(1);
  }

  const orders = await db
    .select({
      id: fundraiseOrders.id,
      customerName: fundraiseOrders.customerName,
      email: fundraiseOrders.email,
      address: fundraiseOrders.address,
      deliveryMethod: fundraiseOrders.deliveryMethod,
      paymentMethod: fundraiseOrders.paymentMethod,
      items: fundraiseOrders.items,
      discountAmount: fundraiseOrders.discountAmount,
      shippingFee: fundraiseOrders.shippingFee,
      notes: fundraiseOrders.notes,
      total: fundraiseOrders.total,
      createdAt: fundraiseOrders.createdAt,
    })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.deliveryMethod, "pickup"));

  console.log(`\n共 ${orders.length} 筆面交訂單`);
  const withEmail = orders.filter((o) => o.email);
  console.log(`其中 ${withEmail.length} 筆有 Email（會寄出）\n`);

  console.log("─".repeat(100));
  console.log(
    "#".padEnd(6) +
      "姓名".padEnd(14) +
      "Email".padEnd(36) +
      "面交地點".padEnd(18) +
      "金額".padEnd(10) +
      "建立時間"
  );
  console.log("─".repeat(100));
  for (const o of orders) {
    const emailCol = o.email || "(無)";
    console.log(
      String(o.id).padEnd(6) +
        (o.customerName || "").padEnd(14) +
        emailCol.padEnd(36) +
        (o.address || "").padEnd(18) +
        `NT$${o.total}`.padEnd(10) +
        o.createdAt
    );
  }
  console.log("─".repeat(100));

  if (dryRun) {
    console.log("\n[DRY RUN] 不會實際寄信。");
    process.exit(0);
  }

  console.log("\n開始寄送…\n");
  let ok = 0;
  let fail = 0;
  for (const o of orders) {
    if (!o.email) {
      console.log(`⊘  #${o.id} ${o.customerName} — 無 email，跳過`);
      continue;
    }
    try {
      const items = JSON.parse(o.items || "[]") as OrderItemRow[];
      const combos = items
        .filter((i) => i.group !== "加購商品")
        .map((i) => ({
          name: i.name,
          items: [i.description || ""],
          quantity: i.quantity,
          price: i.price,
        }));
      const addons = items
        .filter((i) => i.group === "加購商品")
        .map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }));
      await sendOrderConfirmationEmail(
        {
          customerName: o.customerName,
          email: o.email,
          combos,
          addons,
          total: o.total,
          discountAmount: o.discountAmount,
          shippingFee: o.shippingFee,
          deliveryMethod: o.deliveryMethod,
          paymentMethod: o.paymentMethod,
          address: o.address,
          notes: o.notes,
          orderId: o.id,
          bankTransferInfo,
        },
        { isCorrection: true, bypassRateLimit: true }
      );
      console.log(`✓  #${o.id} ${o.customerName} → ${o.email}`);
      ok += 1;
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗  #${o.id} ${o.customerName} → ${o.email} — ${msg}`);
      fail += 1;
    }
  }

  console.log(`\n完成：成功 ${ok} 封，失敗 ${fail} 封`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
