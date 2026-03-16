import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // 合併 localStorage 的購物車到 DB
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) continue;

    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.id),
          eq(cartItems.productId, item.productId)
        )
      )
      .get();

    if (existing) {
      // 取較大的數量
      const maxQty = Math.max(existing.quantity, item.quantity);
      await db
        .update(cartItems)
        .set({ quantity: maxQty })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        userId: session.id,
        productId: item.productId,
        quantity: item.quantity,
      });
    }
  }

  // 回傳合併後的完整購物車
  const merged = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      price: products.price,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, session.id));

  const activeItems = merged
    .filter((item) => item.isActive)
    .map(({ isActive: _, ...rest }) => rest);

  return NextResponse.json(activeItems);
}
