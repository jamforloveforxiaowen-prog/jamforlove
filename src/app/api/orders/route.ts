import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, campaigns, campaignProducts, siteSettings } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface OrderItem {
  productId: number;
  name: string;
  description?: string;
  group: string;
  quantity: number;
  price: number;
}

// 伺服器端重新計算 total
async function calculateTotal(campaignId: number, items: OrderItem[]): Promise<number> {
  const products = await db
    .select({ id: campaignProducts.id, price: campaignProducts.price })
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));

  const priceMap = new Map(products.map((p) => [p.id, p.price]));

  return items.reduce((sum, item) => {
    const price = priceMap.get(item.productId) ?? 0;
    return sum + price * (item.quantity || 0);
  }, 0);
}

// 統計已售數量
async function getSoldQuantities(campaignId: number, excludeOrderId?: number) {
  const allOrders = await db
    .select({ id: fundraiseOrders.id, items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaignId));

  const soldMap: Record<number, number> = {};
  for (const order of allOrders) {
    if (excludeOrderId && order.id === excludeOrderId) continue;
    const items = JSON.parse(order.items || "[]") as { productId: number; quantity: number }[];
    for (const item of items) {
      soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity;
    }
  }
  return { soldMap, totalOrders: allOrders.length };
}

// 檢查庫存
async function checkStock(campaignId: number, items: OrderItem[], soldMap: Record<number, number>): Promise<string | null> {
  const products = await db
    .select({ id: campaignProducts.id, name: campaignProducts.name, limit: campaignProducts.limit })
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));

  const limitMap = new Map(products.map((p) => [p.id, { limit: p.limit, name: p.name }]));

  for (const item of items) {
    const info = limitMap.get(item.productId);
    if (!info || info.limit == null) continue;
    const sold = soldMap[item.productId] || 0;
    const remaining = info.limit - sold;
    if (item.quantity > remaining) {
      return `「${info.name}」剩餘 ${remaining} 份，無法購買 ${item.quantity} 份`;
    }
  }
  return null;
}

// 檢查活動是否可下單
async function checkCampaign(campaignId: number): Promise<{ error: string | null; campaign: typeof campaigns.$inferSelect | null }> {
  const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).get();
  if (!campaign) return { error: "找不到此活動", campaign: null };
  if (campaign.status !== "active") return { error: "此活動尚未開放或已結束", campaign: null };

  const today = new Date().toISOString().slice(0, 10);
  if (today < campaign.startDate || today > campaign.endDate) {
    return { error: "目前不在預購期間，無法下單", campaign: null };
  }
  return { error: null, campaign };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入再下單" }, { status: 401 });
  }

  const body = await req.json();
  const { campaignId, customerName, phone, email, address, deliveryMethod, items, notes, isSupporter } = body;

  // 新格式（有 campaignId）
  if (campaignId) {
    const { error: campaignError, campaign } = await checkCampaign(campaignId);
    if (campaignError || !campaign) {
      return NextResponse.json({ error: campaignError }, { status: 403 });
    }

    if (!customerName || !phone || !address) {
      return NextResponse.json({ error: "請填寫姓名、電話和地址" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "請至少選擇一項商品" }, { status: 400 });
    }

    const { soldMap } = await getSoldQuantities(campaignId);

    // 庫存檢查
    const stockError = await checkStock(campaignId, items, soldMap);
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    const subtotal = await calculateTotal(campaignId, items);

    // 計算舊客戶折扣
    let discountAmount = 0;
    if (isSupporter && campaign.supporterDiscount > 0) {
      discountAmount = Math.round(subtotal * campaign.supporterDiscount / 100);
    }
    const computedTotal = subtotal - discountAmount;

    const order = await db
      .insert(fundraiseOrders)
      .values({
        campaignId,
        userId: session.id,
        customerName,
        phone,
        email: email || "",
        address,
        deliveryMethod: deliveryMethod || "shipping",
        items: JSON.stringify(items),
        combos: "[]",
        addons: "[]",
        isSupporter: !!isSupporter,
        discountAmount,
        notes: notes || "",
        total: computedTotal,
      })
      .returning()
      .get();

    // 寄確認信
    if (email) {
      sendOrderConfirmationEmail({
        customerName,
        email,
        combos: items.map((i: OrderItem) => ({ name: i.name, items: [i.description || ""], quantity: i.quantity, price: i.price })),
        addons: [],
        total: computedTotal,
        discountAmount,
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

  // Legacy 格式（無 campaignId，保持向後相容）
  const { combos, addons } = body;

  // 舊的預購期間檢查
  const [startRow, endRow] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.key, "fundraise_start")).get(),
    db.select().from(siteSettings).where(eq(siteSettings.key, "fundraise_end")).get(),
  ]);
  const now = new Date();
  const start = startRow?.value ? new Date(startRow.value) : null;
  const end = endRow?.value ? new Date(endRow.value + "T23:59:59") : null;
  if (!start || !end || now < start || now > end) {
    return NextResponse.json({ error: "目前不在預購期間，無法下單" }, { status: 403 });
  }

  const existing = await db.select({ id: fundraiseOrders.id }).from(fundraiseOrders).where(eq(fundraiseOrders.userId, session.id)).get();
  if (existing) {
    return NextResponse.json({ error: "你已經下過訂單了" }, { status: 409 });
  }

  if (!customerName || !phone || !address) {
    return NextResponse.json({ error: "請填寫姓名、電話和地址" }, { status: 400 });
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
      items: "[]",
      combos: JSON.stringify(combos || []),
      addons: JSON.stringify(addons || []),
      notes: notes || "",
      total: 0,
    })
    .returning()
    .get();

  return NextResponse.json({ success: true, orderId: order.id });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const body = await req.json();
  const { orderId, campaignId, customerName, phone, email, address, deliveryMethod, items, notes, isSupporter } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(fundraiseOrders)
    .where(and(eq(fundraiseOrders.id, orderId), eq(fundraiseOrders.userId, session.id)))
    .get();
  if (!existing) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  // 如果有 campaignId，用新邏輯
  const cId = campaignId || existing.campaignId;
  if (cId) {
    const { error: campaignError } = await checkCampaign(cId);
    if (campaignError) {
      return NextResponse.json({ error: "預購期間已結束，無法修改訂單" }, { status: 403 });
    }

    if (!customerName || !phone || !address) {
      return NextResponse.json({ error: "請填寫姓名、電話和地址" }, { status: 400 });
    }

    const { soldMap } = await getSoldQuantities(cId, orderId);
    const stockError = await checkStock(cId, items || [], soldMap);
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    const subtotal = await calculateTotal(cId, items || []);

    // 計算舊客戶折扣
    const campaignData = await db.select().from(campaigns).where(eq(campaigns.id, cId)).get();
    let discountAmount = 0;
    if (isSupporter && campaignData && campaignData.supporterDiscount > 0) {
      discountAmount = Math.round(subtotal * campaignData.supporterDiscount / 100);
    }
    const computedTotal = subtotal - discountAmount;

    await db
      .update(fundraiseOrders)
      .set({
        customerName,
        phone,
        email: email || "",
        address,
        deliveryMethod: deliveryMethod || "shipping",
        items: JSON.stringify(items || []),
        isSupporter: !!isSupporter,
        discountAmount,
        notes: notes || "",
        total: computedTotal,
      })
      .where(eq(fundraiseOrders.id, orderId));

    return NextResponse.json({ success: true, orderId });
  }

  return NextResponse.json({ error: "無法修改此訂單" }, { status: 400 });
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
    items: JSON.parse(o.items || "[]"),
    combos: JSON.parse(o.combos),
    addons: JSON.parse(o.addons),
  }));

  return NextResponse.json(result);
}
