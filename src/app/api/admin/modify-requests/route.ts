import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderModifyRequests, fundraiseOrders, campaigns } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      request: orderModifyRequests,
      campaignName: campaigns.name,
      orderEmail: fundraiseOrders.email,
      orderTotal: fundraiseOrders.total,
      orderItems: fundraiseOrders.items,
    })
    .from(orderModifyRequests)
    .leftJoin(fundraiseOrders, eq(orderModifyRequests.orderId, fundraiseOrders.id))
    .leftJoin(campaigns, eq(fundraiseOrders.campaignId, campaigns.id))
    .orderBy(desc(orderModifyRequests.createdAt));

  const result = rows.map((r) => ({
    ...r.request,
    campaignName: r.campaignName || "",
    orderEmail: r.orderEmail || "",
    orderTotal: r.orderTotal || 0,
    orderItems: JSON.parse(r.orderItems || "[]"),
  }));

  return NextResponse.json(result);
}

// 標為已處理 / 未處理
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, handled } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db
    .update(orderModifyRequests)
    .set({ handled: !!handled })
    .where(eq(orderModifyRequests.id, id));

  return NextResponse.json({ success: true });
}
