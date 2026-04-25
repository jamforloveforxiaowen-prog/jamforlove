import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignGroups, campaignProducts } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { loadSoldByProductId, type DraftPayload } from "@/lib/campaign-publish";

// 公開預覽端點：用 previewToken 取得活動資料
// - 若有 draftPayload，回傳草稿合併後的商品結構（讓人看到「未發佈」變更後的樣子）
// - 若無，回傳目前 live 商品結構
// - 形狀比照 /api/campaigns/active 回傳的 campaign，方便 order page 共用
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.previewToken, token))
    .get();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const liveGroups = await db
    .select()
    .from(campaignGroups)
    .where(eq(campaignGroups.campaignId, campaign.id))
    .orderBy(asc(campaignGroups.sortOrder));

  const liveProducts = await db
    .select()
    .from(campaignProducts)
    .where(
      and(
        eq(campaignProducts.campaignId, campaign.id),
        eq(campaignProducts.isActive, true)
      )
    )
    .orderBy(asc(campaignProducts.sortOrder));

  const soldById = await loadSoldByProductId(campaign.id);

  const draft: DraftPayload | null = campaign.draftPayload
    ? JSON.parse(campaign.draftPayload)
    : null;

  let groupsWithProducts;

  if (draft) {
    const liveById = new Map(liveProducts.map((p) => [p.id, p]));
    groupsWithProducts = (draft.groups || []).map((g, gi) => {
      const products = (g.products || []).map((p, pi) => {
        const live = typeof p.id === "number" ? liveById.get(p.id) : undefined;
        const sold = live ? soldById[live.id] || 0 : 0;
        const limit = p.limit ?? null;
        return {
          id: p.id ?? -(pi + 1),
          campaignId: campaign.id,
          groupId: live?.groupId ?? -1,
          name: p.name,
          description: p.description || "",
          imageUrl: p.imageUrl || "",
          price: p.price,
          limit,
          unit: p.unit || "份",
          sortOrder: p.sortOrder ?? pi,
          note: p.note || "",
          isActive: true,
          createdAt: live?.createdAt ?? null,
          sold,
          remaining: limit != null ? Math.max(0, limit - sold) : null,
        };
      });
      return {
        id: -(gi + 1),
        campaignId: campaign.id,
        name: g.name,
        description: g.description || "",
        sortOrder: g.sortOrder ?? gi,
        isRequired: g.isRequired ?? false,
        createdAt: null,
        products,
      };
    });
  } else {
    groupsWithProducts = liveGroups.map((g) => ({
      ...g,
      products: liveProducts
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
  }

  return NextResponse.json({
    campaign: {
      ...campaign,
      pickupOptions: JSON.parse(campaign.pickupOptions || "[]"),
      supportOptions: JSON.parse(campaign.supportOptions || "[]"),
      groups: groupsWithProducts,
      totalOrders: 0,
      isPreview: true,
      hasDraft: draft != null,
    },
  });
}
