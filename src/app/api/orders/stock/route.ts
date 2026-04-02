import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 各組合/加購的限量數
const COMBO_LIMITS: Record<number, number> = {
  1: 25, 2: 25, 3: 25, 4: 25, 5: 25, 6: 25, 7: 20,
};
const ADDON_LIMITS: Record<number, number | null> = {
  1: null, 2: null, 3: null, 4: null, 5: 20, 6: null, 7: 10,
};

export async function GET() {
  // 統計所有訂單中各品項已售數量
  const allOrders = await db.select({
    combos: fundraiseOrders.combos,
    addons: fundraiseOrders.addons,
  }).from(fundraiseOrders);

  const comboSold: Record<number, number> = {};
  const addonSold: Record<number, number> = {};

  for (const order of allOrders) {
    const combos = JSON.parse(order.combos) as { id: number; quantity: number }[];
    const addons = JSON.parse(order.addons) as { id: number; quantity: number }[];
    for (const c of combos) {
      comboSold[c.id] = (comboSold[c.id] || 0) + c.quantity;
    }
    for (const a of addons) {
      addonSold[a.id] = (addonSold[a.id] || 0) + a.quantity;
    }
  }

  // 計算剩餘庫存
  const comboStock: Record<number, number | null> = {};
  for (const [id, limit] of Object.entries(COMBO_LIMITS)) {
    comboStock[Number(id)] = limit - (comboSold[Number(id)] || 0);
  }
  const addonStock: Record<number, number | null> = {};
  for (const [id, limit] of Object.entries(ADDON_LIMITS)) {
    if (limit === null) {
      addonStock[Number(id)] = null; // 無限量
    } else {
      addonStock[Number(id)] = (limit as number) - (addonSold[Number(id)] || 0);
    }
  }

  // 訂單上限
  const maxRow = await db.select().from(siteSettings).where(eq(siteSettings.key, "fundraise_max_orders")).get();
  const maxOrders = maxRow?.value ? Number(maxRow.value) : null;
  const totalOrders = allOrders.length;

  return NextResponse.json({
    comboStock,
    addonStock,
    totalOrders,
    maxOrders,
  });
}
