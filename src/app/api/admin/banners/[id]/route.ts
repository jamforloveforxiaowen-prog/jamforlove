import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
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
  const allowedUpdate: Partial<typeof banners.$inferInsert> = {};
  if (body.title !== undefined) allowedUpdate.title = String(body.title);
  if (body.subtitle !== undefined) allowedUpdate.subtitle = String(body.subtitle);
  if (body.imageUrl !== undefined) allowedUpdate.imageUrl = String(body.imageUrl);
  if (body.sortOrder !== undefined) allowedUpdate.sortOrder = Number(body.sortOrder);
  if (body.isActive !== undefined) allowedUpdate.isActive = Boolean(body.isActive);

  const updated = await db
    .update(banners)
    .set({ ...allowedUpdate, updatedAt: sql`(datetime('now'))` })
    .where(eq(banners.id, Number(id)))
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
  await db.delete(banners).where(eq(banners.id, Number(id)));
  return NextResponse.json({ ok: true });
}
