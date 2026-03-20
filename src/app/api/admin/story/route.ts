import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storyBlocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const all = await db.select().from(storyBlocks).orderBy(asc(storyBlocks.sortOrder));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { heading, content, imageUrl, sortOrder, isPublished } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "請填寫內容" }, { status: 400 });
  }

  const item = await db
    .insert(storyBlocks)
    .values({
      heading: heading || "",
      content,
      imageUrl: imageUrl || "",
      sortOrder: sortOrder ?? 0,
      isPublished: isPublished ?? false,
    })
    .returning()
    .get();

  return NextResponse.json(item);
}
