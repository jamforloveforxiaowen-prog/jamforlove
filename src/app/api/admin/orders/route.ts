import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: fundraiseOrders.id,
      campaignId: fundraiseOrders.campaignId,
      userId: fundraiseOrders.userId,
      customerName: fundraiseOrders.customerName,
      phone: fundraiseOrders.phone,
      email: fundraiseOrders.email,
      address: fundraiseOrders.address,
      deliveryMethod: fundraiseOrders.deliveryMethod,
      paymentMethod: fundraiseOrders.paymentMethod,
      transferLast5: fundraiseOrders.transferLast5,
      items: fundraiseOrders.items,
      combos: fundraiseOrders.combos,
      addons: fundraiseOrders.addons,
      isSupporter: fundraiseOrders.isSupporter,
      supportType: fundraiseOrders.supportType,
      discountAmount: fundraiseOrders.discountAmount,
      shippingFee: fundraiseOrders.shippingFee,
      notes: fundraiseOrders.notes,
      total: fundraiseOrders.total,
      status: fundraiseOrders.status,
      createdAt: fundraiseOrders.createdAt,
      username: users.username,
    })
    .from(fundraiseOrders)
    .leftJoin(users, eq(fundraiseOrders.userId, users.id))
    .orderBy(fundraiseOrders.createdAt);

  const result = rows.map((r) => ({
    ...r,
    items: JSON.parse(r.items || "[]"),
    combos: JSON.parse(r.combos),
    addons: JSON.parse(r.addons),
  }));

  return NextResponse.json(result);
}
