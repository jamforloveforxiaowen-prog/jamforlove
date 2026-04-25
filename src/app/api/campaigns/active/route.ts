import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignGroups, campaignProducts, fundraiseOrders } from "@/lib/db/schema";
import { eq, asc, desc, sql, and, lte, gte } from "drizzle-orm";

export async function GET() {
  const now = new Date().toISOString().slice(0, 10);

  // 優先找 active 且在日期範圍內的活動（最新的優先）
  let campaign = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.status, "active"), lte(campaigns.startDate, now), gte(campaigns.endDate, now)))
    .orderBy(desc(campaigns.startDate))
    .get();

  // 如果沒有在範圍內的，找任何 active 活動（顯示 out_of_range）
  if (!campaign) {
    campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "active"))
      .orderBy(desc(campaigns.startDate))
      .get();
  }

  if (!campaign) {
    return NextResponse.json({ campaign: null });
  }

  // 檢查日期
  if (now < campaign.startDate || now > campaign.endDate) {
    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: "out_of_range",
      },
    });
  }

  // 載入分組和品項
  const groups = await db
    .select()
    .from(campaignGroups)
    .where(eq(campaignGroups.campaignId, campaign.id))
    .orderBy(asc(campaignGroups.sortOrder));

  const products = await db
    .select()
    .from(campaignProducts)
    .where(and(eq(campaignProducts.campaignId, campaign.id), eq(campaignProducts.isActive, true)))
    .orderBy(asc(campaignProducts.sortOrder));

  // 統計已售數量：以 productId 為主（同商品改名不分裂），name fallback 救歷史孤兒
  const allOrders = await db
    .select({ items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaign.id));

  // 載入此活動所有商品（含已軟刪除）做為合法 productId 集合
  const allCampaignProducts = await db
    .select()
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaign.id));
  const validProductIds = new Set(allCampaignProducts.map((p) => p.id));

  // 當前 active 商品的 name → id 對應，用於 productId 對不到時的 fallback
  const activeNameToId = new Map<string, number>();
  for (const p of products) {
    activeNameToId.set(p.name.trim(), p.id);
  }

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
      if (pid != null) {
        soldById[pid] = (soldById[pid] || 0) + item.quantity;
      }
    }
  }

  const totalOrders = allOrders.length;

  const groupsWithProducts = groups.map((g) => ({
    ...g,
    products: products
      .filter((p) => p.groupId === g.id)
      .map((p) => {
        const sold = soldById[p.id] || 0;
        return {
          ...p,
          sold,
          remaining: p.limit != null ? Math.max(0, p.limit - sold) : null,
        };
      }),
  }));

  return NextResponse.json({
    campaign: {
      ...campaign,
      pickupOptions: JSON.parse(campaign.pickupOptions || "[]"),
      supportOptions: JSON.parse(campaign.supportOptions || "[]"),
      groups: groupsWithProducts,
      totalOrders,
    },
  });
}
