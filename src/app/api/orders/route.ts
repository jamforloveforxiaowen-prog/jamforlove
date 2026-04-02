import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, siteSettings } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, ne, sql } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "@/lib/email";

// 伺服器端定義的商品價格（不信任客戶端傳入的 price）
const COMBO_PRICES: Record<number, number> = {
  1: 500, 2: 500, 3: 500, 4: 500, 5: 500, 6: 500, 7: 500,
};

const ADDON_PRICES: Record<number, number> = {
  1: 300, 2: 100, 3: 180, 4: 200, 5: 150, 6: 150, 7: 180,
};

// 各品項限量
const COMBO_LIMITS: Record<number, number> = {
  1: 25, 2: 25, 3: 25, 4: 25, 5: 25, 6: 25, 7: 20,
};
const ADDON_LIMITS: Record<number, number | null> = {
  1: null, 2: null, 3: null, 4: null, 5: 20, 6: null, 7: 10,
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

// 統計已售數量（可排除指定訂單，用於編輯時）
async function getSoldQuantities(excludeOrderId?: number) {
  const allOrders = await db.select({
    id: fundraiseOrders.id,
    combos: fundraiseOrders.combos,
    addons: fundraiseOrders.addons,
  }).from(fundraiseOrders);

  const comboSold: Record<number, number> = {};
  const addonSold: Record<number, number> = {};

  for (const order of allOrders) {
    if (excludeOrderId && order.id === excludeOrderId) continue;
    const combos = JSON.parse(order.combos) as ComboItem[];
    const addons = JSON.parse(order.addons) as AddonItem[];
    for (const c of combos) comboSold[c.id] = (comboSold[c.id] || 0) + c.quantity;
    for (const a of addons) addonSold[a.id] = (addonSold[a.id] || 0) + a.quantity;
  }

  return { comboSold, addonSold, totalOrders: allOrders.length };
}

// 檢查庫存是否足夠
function checkStock(
  combos: ComboItem[],
  addons: AddonItem[],
  comboSold: Record<number, number>,
  addonSold: Record<number, number>,
): string | null {
  for (const c of combos) {
    const limit = COMBO_LIMITS[c.id];
    if (limit !== undefined) {
      const sold = comboSold[c.id] || 0;
      const remaining = limit - sold;
      if (c.quantity > remaining) {
        return `組合 ${c.id} 剩餘 ${remaining} 組，無法購買 ${c.quantity} 組`;
      }
    }
  }
  for (const a of addons) {
    const limit = ADDON_LIMITS[a.id];
    if (limit !== null && limit !== undefined) {
      const sold = addonSold[a.id] || 0;
      const remaining = limit - sold;
      if (a.quantity > remaining) {
        return `加購商品 ${a.id} 剩餘 ${remaining} 份，無法購買 ${a.quantity} 份`;
      }
    }
  }
  return null;
}

// 共用：檢查預購期間
async function checkFundraisePeriod(): Promise<string | null> {
  const [startRow, endRow] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.key, "fundraise_start")).get(),
    db.select().from(siteSettings).where(eq(siteSettings.key, "fundraise_end")).get(),
  ]);
  const now = new Date();
  const start = startRow?.value ? new Date(startRow.value) : null;
  const end = endRow?.value ? new Date(endRow.value + "T23:59:59") : null;
  if (!start || !end || now < start || now > end) {
    return "目前不在預購期間，無法下單";
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入再下單" }, { status: 401 });
  }

  // 檢查預購期間
  const periodError = await checkFundraisePeriod();
  if (periodError) {
    return NextResponse.json({ error: periodError }, { status: 403 });
  }

  // 每人限填一次
  const existing = await db
    .select({ id: fundraiseOrders.id })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.userId, session.id))
    .get();
  if (existing) {
    return NextResponse.json(
      { error: "你已經下過訂單了，如需修改請到「我的訂單」編輯" },
      { status: 409 }
    );
  }

  const body = await req.json();
  const { customerName, phone, email, address, deliveryMethod, combos, addons, notes } = body;

  if (!customerName || !phone || !address) {
    return NextResponse.json({ error: "請填寫姓名、電話和地址" }, { status: 400 });
  }

  if ((!combos || combos.length === 0) && (!addons || addons.length === 0)) {
    return NextResponse.json({ error: "請至少選擇一項產品組合或加購商品" }, { status: 400 });
  }

  // 檢查訂單上限
  const { comboSold, addonSold, totalOrders } = await getSoldQuantities();
  const maxRow = await db.select().from(siteSettings).where(eq(siteSettings.key, "fundraise_max_orders")).get();
  const maxOrders = maxRow?.value ? Number(maxRow.value) : null;
  if (maxOrders && totalOrders >= maxOrders) {
    return NextResponse.json({ error: "預購訂單已額滿，感謝你的支持！" }, { status: 403 });
  }

  // 檢查庫存
  const stockError = checkStock(combos || [], addons || [], comboSold, addonSold);
  if (stockError) {
    return NextResponse.json({ error: stockError }, { status: 400 });
  }

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

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  // 檢查預購期間（僅在預購期間內可編輯）
  const periodError = await checkFundraisePeriod();
  if (periodError) {
    return NextResponse.json({ error: "預購期間已結束，無法修改訂單" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, customerName, phone, email, address, deliveryMethod, combos, addons, notes } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  // 確認是自己的訂單
  const existing = await db
    .select()
    .from(fundraiseOrders)
    .where(and(eq(fundraiseOrders.id, orderId), eq(fundraiseOrders.userId, session.id)))
    .get();
  if (!existing) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  if (!customerName || !phone || !address) {
    return NextResponse.json({ error: "請填寫姓名、電話和地址" }, { status: 400 });
  }

  if ((!combos || combos.length === 0) && (!addons || addons.length === 0)) {
    return NextResponse.json({ error: "請至少選擇一項產品組合或加購商品" }, { status: 400 });
  }

  // 檢查庫存（排除自己的訂單）
  const { comboSold, addonSold } = await getSoldQuantities(orderId);
  const stockError = checkStock(combos || [], addons || [], comboSold, addonSold);
  if (stockError) {
    return NextResponse.json({ error: stockError }, { status: 400 });
  }

  const computedTotal = calculateTotal(combos || [], addons || []);

  await db
    .update(fundraiseOrders)
    .set({
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
    .where(eq(fundraiseOrders.id, orderId));

  return NextResponse.json({ success: true, orderId });
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
