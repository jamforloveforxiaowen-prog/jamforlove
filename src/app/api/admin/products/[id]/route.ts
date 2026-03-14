import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const { name, description, price, imageUrl, isActive } = await req.json();

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .get();

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updated = await db
    .update(products)
    .set({
      name: name ?? existing.name,
      description: description ?? existing.description,
      price: price ?? existing.price,
      imageUrl: imageUrl ?? existing.imageUrl,
      isActive: isActive ?? existing.isActive,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(products.id, productId))
    .returning()
    .get();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  // 軟刪除：設為不上架
  await db
    .update(products)
    .set({ isActive: false, updatedAt: sql`(datetime('now'))` })
    .where(eq(products.id, productId));

  return NextResponse.json({ success: true });
}
