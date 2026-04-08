import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignGroups, campaignProducts } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, asc, sql } from "drizzle-orm";

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

  const products = await db
    .select()
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaign.id))
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

  const { name, startDate, endDate, bannerUrl, formStyle, pickupOptions, supporterDiscount, groups } = body;

  await db
    .update(campaigns)
    .set({
      name,
      startDate,
      endDate,
      bannerUrl: bannerUrl || "",
      formStyle: formStyle || "classic",
      supporterDiscount: supporterDiscount ?? 0,
      pickupOptions: typeof pickupOptions === "string" ? pickupOptions : JSON.stringify(pickupOptions || []),
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(campaigns.id, campaignId));

  // 重建分組和品項（刪除舊的，建立新的）
  if (Array.isArray(groups)) {
    await db.delete(campaignProducts).where(eq(campaignProducts.campaignId, campaignId));
    await db.delete(campaignGroups).where(eq(campaignGroups.campaignId, campaignId));

    for (const group of groups) {
      const g = await db
        .insert(campaignGroups)
        .values({
          campaignId,
          name: group.name,
          description: group.description || "",
          sortOrder: group.sortOrder ?? 0,
          isRequired: group.isRequired ?? false,
        })
        .returning()
        .get();

      if (Array.isArray(group.products)) {
        for (const product of group.products) {
          await db.insert(campaignProducts).values({
            campaignId,
            groupId: g.id,
            name: product.name,
            description: product.description || "",
            price: product.price,
            limit: product.limit || null,
            unit: product.unit || "份",
            sortOrder: product.sortOrder ?? 0,
            note: product.note || "",
            isActive: product.isActive ?? true,
          });
        }
      }
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
