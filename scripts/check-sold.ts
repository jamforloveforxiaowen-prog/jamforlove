/**
 * 檢查活動商品的 limit / sold / remaining 計算
 * 用法：npx tsx scripts/check-sold.ts
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
  console.log(
    `\n=== Active 活動 #${campaign.id} ${campaign.name} (${campaign.startDate} ~ ${campaign.endDate}) ===\n`
  );

  const products = await db
    .select()
    .from(campaignProducts)
    .where(
      and(
        eq(campaignProducts.campaignId, campaign.id),
        eq(campaignProducts.isActive, true)
      )
    );

  const allOrders = await db
    .select({ items: fundraiseOrders.items, status: fundraiseOrders.status })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaign.id));

  const soldByName: Record<string, number> = {};
  for (const order of allOrders) {
    const items = JSON.parse(order.items || "[]") as {
      name?: string;
      quantity: number;
    }[];
    for (const item of items) {
      const key = (item.name || "").trim();
      if (!key) continue;
      soldByName[key] = (soldByName[key] || 0) + item.quantity;
    }
  }

  console.log(`此活動的訂單數：${allOrders.length}\n`);
  console.log("商品 (limit / sold / remaining)：");
  for (const p of products) {
    const sold = soldByName[p.name.trim()] || 0;
    const remaining = p.limit != null ? Math.max(0, p.limit - sold) : null;
    const flag =
      remaining !== null && remaining <= 0 ? " [已售完]" : "";
    console.log(
      `  #${p.id} "${p.name}" | limit=${p.limit} | sold=${sold} | remaining=${remaining}${flag}`
    );
  }

  console.log("\n所有 soldByName：");
  for (const [name, qty] of Object.entries(soldByName)) {
    console.log(`  "${name}" -> ${qty}`);
  }

  console.log("\n所有活動：");
  const all = await db
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.startDate));
  for (const c of all) {
    console.log(
      `  #${c.id} [${c.status}] ${c.name} (${c.startDate} ~ ${c.endDate})`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
