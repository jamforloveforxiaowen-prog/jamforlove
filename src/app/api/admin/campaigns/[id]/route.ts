import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  campaigns,
  campaignGroups,
  campaignProducts,
  campaignProductLimitLogs,
} from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, asc, desc, sql, and } from "drizzle-orm";
import {
  computeDiff,
  generatePreviewToken,
  loadSoldByProductId,
  type DraftPayload,
} from "@/lib/campaign-publish";

// 取得單一活動完整資料（含分組和品項；有草稿時回傳草稿合併後的結構）
// 加上 ?source=live 可強制回傳目前已發佈版本（用於訂單匯出等需要 live 商品順序的場合）
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, Number(id)))
    .get();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 舊活動沒有 previewToken，補上一個讓預覽連結可用
  if (!campaign.previewToken) {
    const newToken = generatePreviewToken();
    await db
      .update(campaigns)
      .set({ previewToken: newToken })
      .where(eq(campaigns.id, campaign.id));
    campaign = { ...campaign, previewToken: newToken };
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

  const allLogs = await db
    .select()
    .from(campaignProductLimitLogs)
    .where(eq(campaignProductLimitLogs.campaignId, campaign.id))
    .orderBy(desc(campaignProductLimitLogs.createdAt));
  const logsByProduct: Record<number, typeof allLogs> = {};
  for (const log of allLogs) {
    if (!logsByProduct[log.productId]) logsByProduct[log.productId] = [];
    logsByProduct[log.productId].push(log);
  }

  const sourceLive = new URL(req.url).searchParams.get("source") === "live";
  const draft: DraftPayload | null =
    !sourceLive && campaign.draftPayload
      ? JSON.parse(campaign.draftPayload)
      : null;

  // 編輯表單預設顯示草稿（若有），讓 admin 編輯尚未發佈的內容
  // 用 draft 的 product.id 對應到 live product，沿用 sold/limitHistory
  let groupsForUI: Array<{
    id?: number;
    name: string;
    description: string;
    sortOrder: number;
    isRequired: boolean;
    products: Array<Record<string, unknown>>;
  }>;

  if (draft) {
    const liveById = new Map(liveProducts.map((p) => [p.id, p]));
    groupsForUI = (draft.groups || []).map((g, gi) => ({
      name: g.name,
      description: g.description || "",
      sortOrder: g.sortOrder ?? gi,
      isRequired: g.isRequired ?? false,
      products: (g.products || []).map((p, pi) => {
        const live = typeof p.id === "number" ? liveById.get(p.id) : undefined;
        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          imageUrl: p.imageUrl || "",
          price: p.price,
          limit: p.limit ?? null,
          unit: p.unit || "份",
          sortOrder: p.sortOrder ?? pi,
          note: p.note || "",
          isActive: true,
          sold: live ? soldById[live.id] || 0 : 0,
          limitHistory: live ? logsByProduct[live.id] || [] : [],
        };
      }),
    }));
  } else {
    groupsForUI = liveGroups.map((g) => ({
      ...g,
      products: liveProducts
        .filter((p) => p.groupId === g.id)
        .map((p) => ({
          ...p,
          sold: soldById[p.id] || 0,
          limitHistory: logsByProduct[p.id] || [],
        })),
    }));
  }

  const diff = await computeDiff(campaign.id, draft);

  return NextResponse.json({
    ...campaign,
    groups: groupsForUI,
    hasDraft: draft != null,
    diff,
  });
}

// 更新活動（基本欄位直接套用；商品結構（groups）寫入 draftPayload，等發佈才生效）
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const campaignId = Number(id);
  const body = await req.json();

  // 如果只更新 status
  if (body.status && Object.keys(body).length === 1) {
    await db
      .update(campaigns)
      .set({ status: body.status, updatedAt: sql`(datetime('now'))` })
      .where(eq(campaigns.id, campaignId));
    return NextResponse.json({ success: true });
  }

  const {
    name,
    startDate,
    endDate,
    startTime,
    endTime,
    bannerUrl,
    description,
    formStyle,
    pickupOptions,
    supporterDiscount,
    supportOptions,
    groups,
  } = body;

  // 基本欄位直接套用（per requirement: 只有商品結構走草稿流程）
  const baseUpdate: Record<string, unknown> = {
    updatedAt: sql`(datetime('now'))`,
  };
  if (name !== undefined) baseUpdate.name = name;
  if (startDate !== undefined) baseUpdate.startDate = startDate;
  if (endDate !== undefined) baseUpdate.endDate = endDate;
  if (startTime !== undefined) baseUpdate.startTime = startTime || "00:00";
  if (endTime !== undefined) baseUpdate.endTime = endTime || "23:59";
  if (bannerUrl !== undefined) baseUpdate.bannerUrl = bannerUrl || "";
  if (description !== undefined) baseUpdate.description = description || "";
  if (formStyle !== undefined) baseUpdate.formStyle = formStyle || "classic";
  if (supporterDiscount !== undefined)
    baseUpdate.supporterDiscount = supporterDiscount ?? 0;
  if (supportOptions !== undefined)
    baseUpdate.supportOptions =
      typeof supportOptions === "string"
        ? supportOptions
        : JSON.stringify(supportOptions || []);
  if (pickupOptions !== undefined)
    baseUpdate.pickupOptions =
      typeof pickupOptions === "string"
        ? pickupOptions
        : JSON.stringify(pickupOptions || []);

  // 商品結構：存到 draftPayload，並確保 previewToken 存在
  if (Array.isArray(groups)) {
    baseUpdate.draftPayload = JSON.stringify({ groups });
    const current = await db
      .select({ previewToken: campaigns.previewToken })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .get();
    if (!current?.previewToken) {
      baseUpdate.previewToken = generatePreviewToken();
    }
  }

  await db
    .update(campaigns)
    .set(baseUpdate)
    .where(eq(campaigns.id, campaignId));

  return NextResponse.json({ success: true });
}

// 刪除活動
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const campaignId = Number(id);

  await db
    .delete(campaignProductLimitLogs)
    .where(eq(campaignProductLimitLogs.campaignId, campaignId));
  await db
    .delete(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));
  await db
    .delete(campaignGroups)
    .where(eq(campaignGroups.campaignId, campaignId));
  await db.delete(campaigns).where(eq(campaigns.id, campaignId));

  return NextResponse.json({ success: true });
}
