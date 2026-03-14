import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allOrders = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      customerName: orders.customerName,
      phone: orders.phone,
      address: orders.address,
      notes: orders.notes,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      username: users.username,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(orders.createdAt);

  const result = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
  );

  return NextResponse.json(result);
}
