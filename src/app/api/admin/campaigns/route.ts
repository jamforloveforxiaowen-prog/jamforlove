import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignGroups, campaignProducts, fundraiseOrders } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const all = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));

  // 附帶每個活動的訂單數
  const result = await Promise.all(
    all.map(async (c) => {
      const [orderCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(fundraiseOrders)
        .where(eq(fundraiseOrders.campaignId, c.id));
      return { ...c, orderCount: orderCount?.count ?? 0 };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, startDate, endDate, bannerUrl, formStyle, pickupOptions, supporterDiscount, groups } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json({ error: "請填寫活動名稱和日期" }, { status: 400 });
  }

  const campaign = await db
    .insert(campaigns)
    .values({
      name,
      startDate,
      endDate,
      bannerUrl: bannerUrl || "",
      formStyle: formStyle || "classic",
      supporterDiscount: supporterDiscount ?? 0,
      pickupOptions: typeof pickupOptions === "string" ? pickupOptions : JSON.stringify(pickupOptions || []),
    })
    .returning()
    .get();

  // 建立分組和品項
  if (Array.isArray(groups)) {
    for (const group of groups) {
      const g = await db
        .insert(campaignGroups)
        .values({
          campaignId: campaign.id,
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
            campaignId: campaign.id,
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

  return NextResponse.json({ success: true, id: campaign.id });
}
