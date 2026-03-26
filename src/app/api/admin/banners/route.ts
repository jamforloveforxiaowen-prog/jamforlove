import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const all = await db.select().from(banners).orderBy(asc(banners.sortOrder));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, subtitle, imageUrl, sortOrder, isActive } = await req.json();

  const item = await db
    .insert(banners)
    .values({
      title: title ?? "",
      subtitle: subtitle ?? "",
      imageUrl: imageUrl ?? "",
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    })
    .returning()
    .get();

  return NextResponse.json(item);
}
