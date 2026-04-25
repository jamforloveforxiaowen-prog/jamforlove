/**
 * 回填 migrate-limits-to-reopen 的歷史變動為 log entries
 * 用法：
 *   npx tsx scripts/backfill-limit-logs.ts          # dry-run
 *   npx tsx scripts/backfill-limit-logs.ts --apply  # 寫入
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

// migrate-limits-to-reopen 跑出來的 8 筆
const HISTORICAL_CHANGES: {
  productId: number;
  prevLimit: number;
  newLimit: number;
  note: string;
}[] = [
  { productId: 891, prevLimit: 12, newLimit: 42, note: "回填：原先填的「12」改解讀為再開放" },
  { productId: 892, prevLimit: 19, newLimit: 38, note: "回填：原先填的「19」改解讀為再開放" },
  { productId: 893, prevLimit: 4, newLimit: 17, note: "回填：原先填的「4」改解讀為再開放" },
  { productId: 894, prevLimit: 4, newLimit: 17, note: "回填：原先填的「4」改解讀為再開放" },
  { productId: 895, prevLimit: 6, newLimit: 17, note: "回填：原先填的「6」改解讀為再開放" },
  { productId: 896, prevLimit: 7, newLimit: 16, note: "回填：原先填的「7」改解讀為再開放" },
  { productId: 897, prevLimit: 20, newLimit: 40, note: "回填：原先填的「20」改解讀為再開放" },
  { productId: 904, prevLimit: 10, newLimit: 26, note: "回填：原先填的「10」改解讀為再開放" },
];

const CAMPAIGN_ID = 1;

async function main() {
  const apply = process.argv.includes("--apply");

  const { db } = await import("../src/lib/db");
  const { campaignProductLimitLogs } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  // 先檢查是否已經回填過（避免重複）
  const existing = await db
    .select()
    .from(campaignProductLimitLogs)
    .where(eq(campaignProductLimitLogs.campaignId, CAMPAIGN_ID));

  console.log(`目前活動 #${CAMPAIGN_ID} 已有 ${existing.length} 筆 log`);

  const alreadyBackfilled = existing.some((l) =>
    l.note.startsWith("回填：")
  );
  if (alreadyBackfilled) {
    console.log("已經回填過，略過。");
    return;
  }

  console.log(`\n要回填 ${HISTORICAL_CHANGES.length} 筆：`);
  for (const c of HISTORICAL_CHANGES) {
    console.log(
      `  product #${c.productId}: ${c.prevLimit} → ${c.newLimit} (delta=${c.newLimit - c.prevLimit})`
    );
  }

  if (!apply) {
    console.log("\n[DRY-RUN] 沒有寫入，加 --apply 重跑。");
    return;
  }

  for (const c of HISTORICAL_CHANGES) {
    await db.insert(campaignProductLimitLogs).values({
      campaignId: CAMPAIGN_ID,
      productId: c.productId,
      delta: c.newLimit - c.prevLimit,
      prevLimit: c.prevLimit,
      newLimit: c.newLimit,
      note: c.note,
    });
  }

  console.log(`\n[APPLIED] 已回填 ${HISTORICAL_CHANGES.length} 筆 log。`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
