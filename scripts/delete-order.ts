/**
 * 刪除訂單（含關聯的 modify requests）
 * 用法：npx tsx scripts/delete-order.ts <orderId>
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

async function main() {
  const orderId = Number(process.argv[2]);
  if (!orderId) {
    console.error("請指定 orderId");
    process.exit(1);
  }

  const { db } = await import("../src/lib/db");
  const { fundraiseOrders, orderModifyRequests } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const order = await db.select().from(fundraiseOrders).where(eq(fundraiseOrders.id, orderId)).get();
  if (!order) {
    console.error(`找不到訂單 #${orderId}`);
    process.exit(1);
  }

  console.log(`準備刪除訂單 #${order.id}`);
  console.log(`  客戶: ${order.customerName}`);
  console.log(`  電話: ${order.phone}`);
  console.log(`  Email: ${order.email || "(無)"}`);
  console.log(`  金額: NT$ ${order.total}`);
  console.log(`  建立: ${order.createdAt}`);

  await db.delete(orderModifyRequests).where(eq(orderModifyRequests.orderId, orderId));
  await db.delete(fundraiseOrders).where(eq(fundraiseOrders.id, orderId));

  console.log(`\n✓ 已刪除訂單 #${orderId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
