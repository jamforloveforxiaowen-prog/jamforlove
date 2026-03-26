import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const active = await db
    .select()
    .from(banners)
    .where(eq(banners.isActive, true))
    .orderBy(asc(banners.sortOrder));

  return NextResponse.json(active);
}
