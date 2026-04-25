/**
 * 修正歷史訂單裡 productId 對不到當前商品的孤兒項目
 *
 * 處理邏輯：
 *   1. 對每個 campaign，找出所有訂單 items 裡 productId 不存在於該 campaign 的 campaignProducts 表的孤兒
 *   2. 嘗試依 item.name 對應到當前 active 商品（exact match）或下方的人工 mapping
 *   3. 預設 dry-run，不寫入 DB；加 --apply 才實際寫入
 *
 * 用法：
 *   npx tsx scripts/migrate-orphan-product-ids.ts          # dry-run，列出要改的內容
 *   npx tsx scripts/migrate-orphan-product-ids.ts --apply  # 實際寫入
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

// 人工確認過的「舊 name → 當前 product.id」mapping（只給名字差異的歷史孤兒用）
// active 商品名稱完全相同的會自動 fallback，不用列在這裡
const MANUAL_NAME_MAPPING: Record<string, number> = {
  "草莓果醬（限量）": 902,
  "草莓果醬（50）": 902,
  "蘋果桑葚醬（限量）": 903,
  "堅果蔓越莓雪Q餅：10塊/180元（限量10盒，限面交&暨大取貨）": 904,
  "燈籠果果醬：150元（30）": 905,
  "梅子果醬：150元（25）": 906,
  "手工洗頭皂（限量20塊）": 901,
};

interface OrderItem {
  productId: number;
  name?: string;
  description?: string;
  group?: string;
  quantity: number;
  price: number;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const { db } = await import("../src/lib/db");
  const { campaigns, campaignProducts, fundraiseOrders } = await import(
    "../src/lib/db/schema"
  );
  const { eq } = await import("drizzle-orm");

  const allCampaigns = await db.select().from(campaigns);

  let totalOrdersScanned = 0;
  let totalOrdersToUpdate = 0;
  let totalItemsRemapped = 0;
  let totalItemsUnmapped = 0;
  const unmappedSamples: { orderId: number; productId: number; name: string }[] = [];

  for (const campaign of allCampaigns) {
    const products = await db
      .select()
      .from(campaignProducts)
      .where(eq(campaignProducts.campaignId, campaign.id));
    const validProductIds = new Set(products.map((p) => p.id));
    const activeNameToId = new Map<string, number>();
    for (const p of products) {
      if (p.isActive) activeNameToId.set(p.name.trim(), p.id);
    }

    const orders = await db
      .select()
      .from(fundraiseOrders)
      .where(eq(fundraiseOrders.campaignId, campaign.id));

    for (const order of orders) {
      totalOrdersScanned++;
      const items = JSON.parse(order.items || "[]") as OrderItem[];
      let dirty = false;
      const updated = items.map((item) => {
        if (item.productId && validProductIds.has(item.productId)) return item;
        const name = (item.name || "").trim();
        const fromActive = name ? activeNameToId.get(name) : undefined;
        const fromManual = name ? MANUAL_NAME_MAPPING[name] : undefined;
        const newId = fromActive ?? fromManual;
        if (newId && validProductIds.has(newId)) {
          dirty = true;
          totalItemsRemapped++;
          console.log(
            `  [campaign #${campaign.id}] order #${order.id}: productId ${item.productId} ("${name}") → ${newId}`
          );
          return { ...item, productId: newId };
        }
        totalItemsUnmapped++;
        if (unmappedSamples.length < 30) {
          unmappedSamples.push({
            orderId: order.id,
            productId: item.productId,
            name,
          });
        }
        return item;
      });

      if (dirty) {
        totalOrdersToUpdate++;
        if (apply) {
          await db
            .update(fundraiseOrders)
            .set({ items: JSON.stringify(updated) })
            .where(eq(fundraiseOrders.id, order.id));
        }
      }
    }
  }

  console.log("\n=== 統計 ===");
  console.log(`掃描訂單數：${totalOrdersScanned}`);
  console.log(`要更新的訂單數：${totalOrdersToUpdate}`);
  console.log(`重新對應的 item 數：${totalItemsRemapped}`);
  console.log(`仍對不到的 item 數：${totalItemsUnmapped}`);

  if (unmappedSamples.length > 0) {
    console.log("\n仍對不到的 item（請補進 MANUAL_NAME_MAPPING 後重跑）：");
    for (const s of unmappedSamples) {
      console.log(
        `  order #${s.orderId} | productId=${s.productId} | name="${s.name}"`
      );
    }
  }

  if (!apply) {
    console.log("\n[DRY-RUN] 沒有實際寫入 DB。確認上面內容無誤後，加 --apply 重跑。");
  } else {
    console.log("\n[APPLIED] 已寫入 DB。");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
