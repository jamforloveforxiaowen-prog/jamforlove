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

  // 驗證 status 白名單，防止非法狀態值寫入資料庫
  const VALID_STATUSES = ["pending", "confirmed", "shipped", "completed"] as const;
  type OrderStatus = typeof VALID_STATUSES[number];

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 }
    );
  }

  await db
    .update(fundraiseOrders)
    .set({ status: status as OrderStatus })
    .where(eq(fundraiseOrders.id, Number(id)));

  return NextResponse.json({ success: true });
}
