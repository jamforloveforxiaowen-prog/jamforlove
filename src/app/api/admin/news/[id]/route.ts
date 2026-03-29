import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // 明確列出允許更新的欄位，避免 Mass Assignment 漏洞
  const allowedUpdate: Partial<typeof news.$inferInsert> = {};
  if (body.title !== undefined) allowedUpdate.title = String(body.title);
  if (body.content !== undefined) allowedUpdate.content = String(body.content);
  if (body.imageUrl !== undefined) allowedUpdate.imageUrl = String(body.imageUrl);
  if (body.isPublished !== undefined) allowedUpdate.isPublished = Boolean(body.isPublished);

  const updated = await db
    .update(news)
    .set({ ...allowedUpdate, updatedAt: sql`(datetime('now'))` })
    .where(eq(news.id, Number(id)))
    .returning()
    .get();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
  await db.delete(news).where(eq(news.id, Number(id)));
  return NextResponse.json({ ok: true });
}
