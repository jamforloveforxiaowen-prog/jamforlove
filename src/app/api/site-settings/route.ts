import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const row = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .get();

  return NextResponse.json({ value: row?.value ?? "" });
}
