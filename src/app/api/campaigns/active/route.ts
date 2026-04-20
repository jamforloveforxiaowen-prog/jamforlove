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

  // 統計已售數量（依商品名稱彙總，避免歷史 productId 分裂造成的誤算）
  const allOrders = await db
    .select({ items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaign.id));

  const soldByName: Record<string, number> = {};
  for (const order of allOrders) {
    const items = JSON.parse(order.items || "[]") as { productId: number; name?: string; quantity: number }[];
    for (const item of items) {
      const key = (item.name || "").trim();
      if (!key) continue;
      soldByName[key] = (soldByName[key] || 0) + item.quantity;
    }
  }

  const totalOrders = allOrders.length;

  const groupsWithProducts = groups.map((g) => ({
    ...g,
    products: products
      .filter((p) => p.groupId === g.id)
      .map((p) => {
        const sold = soldByName[p.name.trim()] || 0;
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
