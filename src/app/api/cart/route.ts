import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db
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

  // 只回傳上架中的產品
  const activeItems = items
    .filter((item) => item.isActive)
    .map(({ isActive: _, ...rest }) => rest);

  return NextResponse.json(activeItems);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  if (!productId || typeof quantity !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.userId, session.id), eq(cartItems.productId, productId))
    )
    .get();

  if (quantity <= 0) {
    if (existing) {
      await db.delete(cartItems).where(eq(cartItems.id, existing.id));
    }
  } else if (existing) {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      userId: session.id,
      productId,
      quantity,
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(cartItems).where(eq(cartItems.userId, session.id));
  return NextResponse.json({ success: true });
}
