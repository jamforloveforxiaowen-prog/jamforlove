import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allProducts = await db.select().from(products).orderBy(products.id);
  return NextResponse.json(allProducts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, price, isActive } = await req.json();

  if (!name || price == null) {
    return NextResponse.json(
      { error: "請填寫產品名稱和價格" },
      { status: 400 }
    );
  }

  if (typeof price !== "number" || price < 0) {
    return NextResponse.json({ error: "價格必須為正數" }, { status: 400 });
  }

  const product = await db
    .insert(products)
    .values({
      name,
      description: description || "",
      price,
      isActive: isActive ?? true,
    })
    .returning()
    .get();

  return NextResponse.json(product);
}
