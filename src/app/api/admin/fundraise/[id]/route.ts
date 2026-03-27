import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  await db
    .update(fundraiseOrders)
    .set({ status })
    .where(eq(fundraiseOrders.id, Number(id)));

  return NextResponse.json({ success: true });
}
