import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true));

  return NextResponse.json(allProducts);
}
