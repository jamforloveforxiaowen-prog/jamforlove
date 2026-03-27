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
      userId: fundraiseOrders.userId,
      customerName: fundraiseOrders.customerName,
      phone: fundraiseOrders.phone,
      email: fundraiseOrders.email,
      address: fundraiseOrders.address,
      deliveryMethod: fundraiseOrders.deliveryMethod,
      combos: fundraiseOrders.combos,
      addons: fundraiseOrders.addons,
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
    combos: JSON.parse(r.combos),
    addons: JSON.parse(r.addons),
  }));

  return NextResponse.json(result);
}
