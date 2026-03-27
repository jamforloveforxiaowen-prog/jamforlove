import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入再下單" }, { status: 401 });
  }

  const body = await req.json();
  const { customerName, phone, email, address, deliveryMethod, combos, addons, notes, total } = body;

  if (!customerName || !phone || !address) {
    return NextResponse.json(
      { error: "請填寫姓名、電話和地址" },
      { status: 400 }
    );
  }

  if ((!combos || combos.length === 0) && (!addons || addons.length === 0)) {
    return NextResponse.json(
      { error: "請至少選擇一項產品組合或加購商品" },
      { status: 400 }
    );
  }

  const order = await db
    .insert(fundraiseOrders)
    .values({
      userId: session.id,
      customerName,
      phone,
      email: email || "",
      address,
      deliveryMethod: deliveryMethod || "shipping",
      combos: JSON.stringify(combos || []),
      addons: JSON.stringify(addons || []),
      notes: notes || "",
      total,
    })
    .returning()
    .get();

  return NextResponse.json({ success: true, orderId: order.id });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userOrders = await db
    .select()
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.userId, session.id))
    .orderBy(fundraiseOrders.createdAt);

  const result = userOrders.map((o) => ({
    ...o,
    combos: JSON.parse(o.combos),
    addons: JSON.parse(o.addons),
  }));

  return NextResponse.json(result);
}
