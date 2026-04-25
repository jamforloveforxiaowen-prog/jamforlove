/**
 * 把當前活動所有商品的 limit / sold 備份到 JSON
 * 用法：npx tsx scripts/backup-product-limits.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
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
    .select({ items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaign.id));

  const validIds = new Set(products.map((p) => p.id));
  const soldById: Record<number, number> = {};
  for (const order of allOrders) {
    const items = JSON.parse(order.items || "[]") as {
      productId: number;
      quantity: number;
    }[];
    for (const item of items) {
      if (item.productId && validIds.has(item.productId)) {
        soldById[item.productId] =
          (soldById[item.productId] || 0) + item.quantity;
      }
    }
  }

  const snapshot = {
    timestamp: new Date().toISOString(),
    campaignId: campaign.id,
    campaignName: campaign.name,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      limit: p.limit,
      sold: soldById[p.id] || 0,
    })),
  };

  const dir = resolve(process.cwd(), "scripts/backups");
  mkdirSync(dir, { recursive: true });
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const file = resolve(dir, `product-limits-${stamp}.json`);
  writeFileSync(file, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`已備份到：${file}`);
  console.log(`商品數：${snapshot.products.length}`);
  console.log("\n商品 limit / sold 一覽：");
  for (const p of snapshot.products) {
    console.log(`  #${p.id} ${p.name} | limit=${p.limit} | sold=${p.sold}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
