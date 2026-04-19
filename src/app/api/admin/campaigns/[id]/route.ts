import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignGroups, campaignProducts } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, asc, sql, and, inArray } from "drizzle-orm";

// 取得單一活動完整資料（含分組和品項）
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, Number(id)))
    .get();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const groups = await db
    .select()
    .from(campaignGroups)
    .where(eq(campaignGroups.campaignId, campaign.id))
    .orderBy(asc(campaignGroups.sortOrder));

  // 僅回傳啟用中的商品（被移除的商品標為 isActive=false，只保留歷史訂單引用）
  const products = await db
    .select()
    .from(campaignProducts)
    .where(
      and(
        eq(campaignProducts.campaignId, campaign.id),
        eq(campaignProducts.isActive, true)
      )
    )
    .orderBy(asc(campaignProducts.sortOrder));

  const groupsWithProducts = groups.map((g) => ({
    ...g,
    products: products.filter((p) => p.groupId === g.id),
  }));

  return NextResponse.json({ ...campaign, groups: groupsWithProducts });
}

// 更新活動
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

  const { name, startDate, endDate, bannerUrl, description, formStyle, pickupOptions, supporterDiscount, supportOptions, groups } = body;

  await db
    .update(campaigns)
    .set({
      name,
      startDate,
      endDate,
      bannerUrl: bannerUrl || "",
      description: description || "",
      formStyle: formStyle || "classic",
      supporterDiscount: supporterDiscount ?? 0,
      supportOptions: typeof supportOptions === "string" ? supportOptions : JSON.stringify(supportOptions || []),
      pickupOptions: typeof pickupOptions === "string" ? pickupOptions : JSON.stringify(pickupOptions || []),
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(campaigns.id, campaignId));

  // Upsert 分組和商品：
  // - 商品依 id 保留 → 舊訂單的 productId 永遠指向正確的商品
  // - 被使用者移除的商品標記為 isActive=false（軟刪除，保留歷史）
  // - 群組依 isRequired 標誌配對（每個活動最多一個「商品」群組 + 一個「加購商品」群組）
  if (Array.isArray(groups)) {
    const existingGroups = await db
      .select()
      .from(campaignGroups)
      .where(eq(campaignGroups.campaignId, campaignId));
    const existingProducts = await db
      .select()
      .from(campaignProducts)
      .where(eq(campaignProducts.campaignId, campaignId));
    const existingProductMap = new Map(existingProducts.map((p) => [p.id, p]));

    const keptProductIds = new Set<number>();

    for (const group of groups) {
      const isRequired = group.isRequired ?? false;
      // 依 isRequired 找已存在的群組
      const existingGroup = existingGroups.find((g) => g.isRequired === isRequired);

      let groupId: number;
      if (existingGroup) {
        await db
          .update(campaignGroups)
          .set({
            name: group.name,
            description: group.description || "",
            sortOrder: group.sortOrder ?? 0,
            isRequired,
          })
          .where(eq(campaignGroups.id, existingGroup.id));
        groupId = existingGroup.id;
      } else {
        const g = await db
          .insert(campaignGroups)
          .values({
            campaignId,
            name: group.name,
            description: group.description || "",
            sortOrder: group.sortOrder ?? 0,
            isRequired,
          })
          .returning()
          .get();
        groupId = g.id;
      }

      if (!Array.isArray(group.products)) continue;

      for (const product of group.products) {
        const productPayload = {
          campaignId,
          groupId,
          name: product.name,
          description: product.description || "",
          imageUrl: product.imageUrl || "",
          price: product.price,
          limit: product.limit || null,
          unit: product.unit || "份",
          sortOrder: product.sortOrder ?? 0,
          note: product.note || "",
          isActive: product.isActive ?? true,
        };

        const existingProduct =
          typeof product.id === "number" ? existingProductMap.get(product.id) : undefined;

        if (existingProduct) {
          await db
            .update(campaignProducts)
            .set(productPayload)
            .where(eq(campaignProducts.id, existingProduct.id));
          keptProductIds.add(existingProduct.id);
        } else {
          await db.insert(campaignProducts).values(productPayload);
        }
      }
    }

    // 沒出現在 payload 裡的舊商品 → 軟刪除（歷史訂單還需要它的 id 和 price）
    const orphanIds = existingProducts
      .map((p) => p.id)
      .filter((id) => !keptProductIds.has(id));
    if (orphanIds.length > 0) {
      await db
        .update(campaignProducts)
        .set({ isActive: false })
        .where(
          and(
            eq(campaignProducts.campaignId, campaignId),
            inArray(campaignProducts.id, orphanIds)
          )
        );
    }
  }

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

  await db.delete(campaignProducts).where(eq(campaignProducts.campaignId, campaignId));
  await db.delete(campaignGroups).where(eq(campaignGroups.campaignId, campaignId));
  await db.delete(campaigns).where(eq(campaigns.id, campaignId));

  return NextResponse.json({ success: true });
}
