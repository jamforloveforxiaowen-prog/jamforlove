/**
 * 清除資料庫中所有品項名稱裡的「【】」空括號
 * 用法：npx tsx scripts/clean-empty-brackets.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv(p: string) {
  const c = readFileSync(p, "utf8");
  for (const line of c.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
loadEnv(resolve(process.cwd(), ".env.local"));

// 【】或 【 】（內含空白）都清掉
const EMPTY_BRACKET_RE = /【\s*】/g;

function clean(name: string | undefined | null): string {
  if (!name) return "";
  return name.replace(EMPTY_BRACKET_RE, "").trim();
}

(async () => {
  const { db } = await import("../src/lib/db");
  const { fundraiseOrders, campaignProducts } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  // ── 1. campaignProducts ──
  const products = await db.select().from(campaignProducts).all();
  let productUpdated = 0;
  for (const p of products) {
    const newName = clean(p.name);
    if (newName !== p.name) {
      await db.update(campaignProducts).set({ name: newName }).where(eq(campaignProducts.id, p.id));
      console.log(`  product #${p.id}: "${p.name}" → "${newName}"`);
      productUpdated++;
    }
  }
  console.log(`campaignProducts 更新 ${productUpdated} 筆`);

  // ── 2. fundraiseOrders.items / combos / addons ──
  const orders = await db.select().from(fundraiseOrders).all();
  let orderUpdated = 0;
  for (const o of orders) {
    const items = JSON.parse(o.items || "[]") as Array<{ name?: string; [k: string]: unknown }>;
    const combos = JSON.parse(o.combos || "[]") as Array<{ name?: string; [k: string]: unknown }>;
    const addons = JSON.parse(o.addons || "[]") as Array<{ name?: string; [k: string]: unknown }>;

    let changed = false;
    const newItems = items.map((i) => {
      const newName = clean(i.name);
      if (newName !== i.name) { changed = true; return { ...i, name: newName }; }
      return i;
    });
    const newCombos = combos.map((i) => {
      const newName = clean(i.name);
      if (newName !== i.name) { changed = true; return { ...i, name: newName }; }
      return i;
    });
    const newAddons = addons.map((i) => {
      const newName = clean(i.name);
      if (newName !== i.name) { changed = true; return { ...i, name: newName }; }
      return i;
    });

    if (changed) {
      await db.update(fundraiseOrders).set({
        items: JSON.stringify(newItems),
        combos: JSON.stringify(newCombos),
        addons: JSON.stringify(newAddons),
      }).where(eq(fundraiseOrders.id, o.id));
      console.log(`  order #${o.id} updated`);
      orderUpdated++;
    }
  }
  console.log(`fundraiseOrders 更新 ${orderUpdated} 筆`);
})();
