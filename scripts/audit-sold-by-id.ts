/**
 * 對比 sold 用 name 彙總 vs 用 productId 彙總的差異
 * 確認改成 productId 彙總是否安全
 * 用法：npx tsx scripts/audit-sold-by-id.ts
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
  const { db } = await import("../src/lib/db");
  const { campaigns, campaignProducts, fundraiseOrders } = await import(
    "../src/lib/db/schema"
  );
  const { eq, and, desc, lte, gte } = await import("drizzle-orm");

  const now = new Date().toISOString().slice(0, 10);
  let campaign = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, "active"),
        lte(campaigns.startDate, now),
        gte(campaigns.endDate, now)
      )
    )
    .orderBy(desc(campaigns.startDate))
    .get();
  if (!campaign) {
    campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "active"))
      .orderBy(desc(campaigns.startDate))
      .get();
  }
  if (!campaign) {
    console.log("找不到 active 活動");
    return;
  }

  const allProducts = await db
    .select()
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaign.id));
  const productById = new Map(allProducts.map((p) => [p.id, p]));

  const allOrders = await db
    .select({ id: fundraiseOrders.id, items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaign.id));

  const soldById: Record<number, number> = {};
  const soldByName: Record<string, number> = {};
  const orphanItems: { orderId: number; productId: number; name: string; quantity: number }[] = [];

  for (const order of allOrders) {
    const items = JSON.parse(order.items || "[]") as {
      productId: number;
      name?: string;
      quantity: number;
    }[];
    for (const item of items) {
      const name = (item.name || "").trim();
      if (item.productId && productById.has(item.productId)) {
        soldById[item.productId] = (soldById[item.productId] || 0) + item.quantity;
      } else {
        orphanItems.push({
          orderId: order.id,
          productId: item.productId,
          name,
          quantity: item.quantity,
        });
      }
      if (name) soldByName[name] = (soldByName[name] || 0) + item.quantity;
    }
  }

  console.log(`\n活動 #${campaign.id} ${campaign.name}`);
  console.log(`訂單數：${allOrders.length}`);
  console.log(
    `孤兒項目（productId 找不到對應 campaignProduct）：${orphanItems.length} 筆\n`
  );

  console.log("=== 啟用中商品 sold 對比 ===");
  console.log(
    "ID  | 商品名稱 | by-id sold | by-name sold | 差異".padEnd(80)
  );
  for (const p of allProducts.filter((p) => p.isActive)) {
    const byId = soldById[p.id] || 0;
    const byName = soldByName[p.name.trim()] || 0;
    const diff = byName - byId;
    const flag = diff !== 0 ? " ←(差異)" : "";
    console.log(
      `  #${p.id} "${p.name.slice(0, 40)}..." | by-id=${byId} | by-name=${byName} | diff=${diff}${flag}`
    );
  }

  console.log("\n=== 已軟刪除商品（isActive=false）的銷量 ===");
  for (const p of allProducts.filter((p) => !p.isActive)) {
    const byId = soldById[p.id] || 0;
    if (byId > 0) {
      console.log(`  [已下架] #${p.id} "${p.name}" by-id=${byId}`);
    }
  }

  if (orphanItems.length > 0) {
    console.log("\n=== 孤兒項目（前 30 筆）===");
    for (const o of orphanItems.slice(0, 30)) {
      console.log(
        `  order #${o.orderId} | productId=${o.productId} | name="${o.name}" | qty=${o.quantity}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
