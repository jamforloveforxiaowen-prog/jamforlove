import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, value } = await req.json();
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .get();

  if (existing) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: sql`(datetime('now'))` })
      .where(eq(siteSettings.key, key));
  } else {
    await db
      .insert(siteSettings)
      .values({ key, value });
  }

  return NextResponse.json({ ok: true });
}
