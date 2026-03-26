import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const all = await db.select().from(news).orderBy(desc(news.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content, imageUrl, isPublished } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "請填寫標題和內容" }, { status: 400 });
  }

  const item = await db
    .insert(news)
    .values({ title, content, imageUrl: imageUrl ?? "", isPublished: isPublished ?? false })
    .returning()
    .get();

  return NextResponse.json(item);
}
