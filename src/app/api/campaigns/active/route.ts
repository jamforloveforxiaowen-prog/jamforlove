import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignGroups, campaignProducts, fundraiseOrders } from "@/lib/db/schema";
import { eq, asc, desc, sql, and, lte, gte } from "drizzle-orm";

// 用台灣時區計算現在的 YYYY-MM-DDTHH:MM 字串
function nowTaiwanIso(): string {
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // sv-SE 格式：YYYY-MM-DD HH:MM
  return fmt.format(new Date()).replace(" ", "T");
}

function isWithinDateTime(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  nowIso: string
): boolean {
  const startIso = `${startDate}T${(startTime || "00:00").slice(0, 5)}`;
  const endIso = `${endDate}T${(endTime || "23:59").slice(0, 5)}`;
  return nowIso >= startIso && nowIso <= endIso;
}

export async function GET() {
  const nowIso = nowTaiwanIso(); // "2026-04-25T14:30"
  const today = nowIso.slice(0, 10);

  // 候選：所有日期範圍內的 campaigns（含 active / draft / closed）
  const candidates = await db
    .select()
    .from(campaigns)
    .where(and(lte(campaigns.startDate, today), gte(campaigns.endDate, today)))
    .orderBy(desc(campaigns.startDate));

  // 在 datetime 範圍內 + active 的活動
  const activeInRange = candidates.find(
    (c) =>
      c.status === "active" &&
      isWithinDateTime(c.startDate, c.startTime, c.endDate, c.endTime, nowIso)
  );

  let campaign = activeInRange;

  // 沒有 active in range，但有「日期範圍內但暫停」→ 回傳 paused
  if (!campaign) {
    const pausedCampaign = candidates[0];
    if (pausedCampaign && pausedCampaign.status !== "active") {
      return NextResponse.json({
        campaign: {
          id: pausedCampaign.id,
          name: pausedCampaign.name,
          startDate: pausedCampaign.startDate,
          endDate: pausedCampaign.endDate,
          startTime: pausedCampaign.startTime,
          endTime: pausedCampaign.endTime,
          status: "paused",
        },
      });
    }
    // 日期範圍內但 active 還沒到時間（太早）或已過時間（太晚）→ out_of_range
    const outOfTimeActive = candidates.find((c) => c.status === "active");
    if (outOfTimeActive) {
      return NextResponse.json({
        campaign: {
          id: outOfTimeActive.id,
          name: outOfTimeActive.name,
          startDate: outOfTimeActive.startDate,
          endDate: outOfTimeActive.endDate,
          startTime: outOfTimeActive.startTime,
          endTime: outOfTimeActive.endTime,
          status: "out_of_range",
        },
      });
    }
  }

  // 沒有日期範圍內的活動 → 找任何 active 活動（顯示 out_of_range）
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

  // 範圍外（雖然極少發生 —— 上面 isWithinDateTime 已處理）
  if (
    !isWithinDateTime(
      campaign.startDate,
      campaign.startTime,
      campaign.endDate,
      campaign.endTime,
      nowIso
    )
  ) {
    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
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
