/**
 * 把 limit <= sold 的商品 limit 改成「目前 limit + sold」
 * 視同 admin 之前填的數字其實是「想再開放 N」，重新計算總數
 *
 * 用法：
 *   npx tsx scripts/migrate-limits-to-reopen.ts          # dry-run
 *   npx tsx scripts/migrate-limits-to-reopen.ts --apply  # 寫入
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
  const apply = process.argv.includes("--apply");

  const { db } = await import("../src/lib/db");
  const { campaigns, campaignProducts, fundraiseOrders } = await import(
    "../src/lib/db/schema"
  );
  const { eq, and, desc, lte, gte, sql } = await import("drizzle-orm");

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
  console.log(`活動 #${campaign.id} ${campaign.name}\n`);

  const products = await db
    .select()
    .from(campaignProducts)
    .where(
      and(
        eq(campaignProducts.campaignId, campaign.id),
        eq(campaignProducts.isActive, true)
      )
    );
  const allCampaignProducts = await db
    .select()
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaign.id));
  const validProductIds = new Set(allCampaignProducts.map((p) => p.id));
  const activeNameToId = new Map<string, number>();
  for (const p of products) activeNameToId.set(p.name.trim(), p.id);

  const allOrders = await db
    .select({ items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaign.id));

  const soldById: Record<number, number> = {};
  for (const order of allOrders) {
    const items = JSON.parse(order.items || "[]") as {
      productId: number;
      name?: string;
      quantity: number;
    }[];
    for (const item of items) {
      let pid: number | undefined;
      if (item.productId && validProductIds.has(item.productId)) {
        pid = item.productId;
      } else {
        const trimmed = (item.name || "").trim();
        const fallback = trimmed ? activeNameToId.get(trimmed) : undefined;
        if (fallback) pid = fallback;
      }
      if (pid != null) soldById[pid] = (soldById[pid] || 0) + item.quantity;
    }
  }

  const toUpdate: { id: number; name: string; oldLimit: number; sold: number; newLimit: number }[] = [];
  for (const p of products) {
    if (p.limit == null) continue; // 不限的不動
    const sold = soldById[p.id] || 0;
    if (p.limit <= sold) {
      // 把目前 limit 視為 "再開放 N"，新 limit = limit + sold
      toUpdate.push({
        id: p.id,
        name: p.name,
        oldLimit: p.limit,
        sold,
        newLimit: p.limit + sold,
      });
    }
  }

  console.log("=== 將被更新的商品 ===");
  console.log(
    "ID  | 商品                                          | 舊 limit | sold | 新 limit (= 舊 + sold)"
  );
  for (const u of toUpdate) {
    console.log(
      `  #${u.id} | ${u.name.slice(0, 35).padEnd(35, " ")} | ${String(u.oldLimit).padStart(8)} | ${String(u.sold).padStart(4)} | ${u.newLimit}`
    );
  }
  if (toUpdate.length === 0) {
    console.log("  （無）");
  }

  console.log("\n=== 不動的商品（limit > sold 或 limit=null）===");
  for (const p of products) {
    const sold = soldById[p.id] || 0;
    if (p.limit == null || p.limit > sold) {
      console.log(
        `  #${p.id} ${p.name.slice(0, 35)} | limit=${p.limit} | sold=${sold}`
      );
    }
  }

  if (apply) {
    for (const u of toUpdate) {
      await db
        .update(campaignProducts)
        .set({ limit: u.newLimit, updatedAt: sql`(datetime('now'))` })
        .where(eq(campaignProducts.id, u.id));
    }
    console.log(`\n[APPLIED] 已更新 ${toUpdate.length} 個商品的 limit。`);
  } else {
    console.log(`\n[DRY-RUN] 沒有寫入。確認後加 --apply 重跑。`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
