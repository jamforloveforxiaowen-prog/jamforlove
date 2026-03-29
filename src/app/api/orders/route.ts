import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "@/lib/email";

// 伺服器端定義的商品價格（不信任客戶端傳入的 price）
const COMBO_PRICES: Record<number, number> = {
  1: 500,
  2: 500,
  3: 500,
  4: 500,
  5: 500,
  6: 500,
  7: 500,
};

const ADDON_PRICES: Record<number, number> = {
  1: 300,
  2: 100,
  3: 180,
  4: 200,
  5: 150,
  6: 150,
  7: 180,
};

interface ComboItem {
  id: number;
  quantity: number;
  [key: string]: unknown;
}

interface AddonItem {
  id: number;
  quantity: number;
  [key: string]: unknown;
}

// 根據伺服器端價格重新計算總金額，忽略客戶端傳入的 total
function calculateTotal(combos: ComboItem[], addons: AddonItem[]): number {
  const comboTotal = combos.reduce((sum, item) => {
    const price = COMBO_PRICES[item.id] ?? 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  const addonTotal = addons.reduce((sum, item) => {
    const price = ADDON_PRICES[item.id] ?? 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return comboTotal + addonTotal;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入再下單" }, { status: 401 });
  }

  const body = await req.json();
  const { customerName, phone, email, address, deliveryMethod, combos, addons, notes } = body;

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

  // 在伺服器端重新計算 total，不使用前端傳入的值
  const computedTotal = calculateTotal(combos || [], addons || []);

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
      total: computedTotal,
    })
    .returning()
    .get();

  // 寄送訂單確認信（非同步，不阻塞回應）
  if (email) {
    sendOrderConfirmationEmail({
      customerName,
      email,
      combos: combos || [],
      addons: addons || [],
      total: computedTotal,
      deliveryMethod: deliveryMethod || "shipping",
      address,
      notes: notes || "",
      orderId: order.id,
    }).catch((err) => {
      console.error("Failed to send order confirmation email:", err);
    });
  }

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
