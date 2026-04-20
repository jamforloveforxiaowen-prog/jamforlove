import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, campaigns, campaignProducts, siteSettings } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
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
// 優先用 DB 當前價格；若商品已被刪除／重建（例如活動編輯會重插），回退至 client 傳來的歷史價格
// 避免訂單金額被計算為 0
async function calculateTotal(campaignId: number, items: OrderItem[]): Promise<number> {
  const products = await db
    .select({ id: campaignProducts.id, price: campaignProducts.price })
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));

  const priceMap = new Map(products.map((p) => [p.id, p.price]));

  return items.reduce((sum, item) => {
    const dbPrice = priceMap.get(item.productId);
    const price = dbPrice ?? (typeof item.price === "number" && item.price >= 0 ? item.price : 0);
    return sum + price * (item.quantity || 0);
  }, 0);
}

// 統計已售數量（以商品名稱彙總，避免 productId 重建造成的錯算）
async function getSoldQuantities(campaignId: number, excludeOrderId?: number) {
  const allOrders = await db
    .select({ id: fundraiseOrders.id, items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaignId));

  const soldByName: Record<string, number> = {};
  for (const order of allOrders) {
    if (excludeOrderId && order.id === excludeOrderId) continue;
    const items = JSON.parse(order.items || "[]") as { productId: number; name?: string; quantity: number }[];
    for (const item of items) {
      const key = (item.name || "").trim();
      if (!key) continue;
      soldByName[key] = (soldByName[key] || 0) + item.quantity;
    }
  }
  return { soldByName, totalOrders: allOrders.length };
}

// 檢查庫存（依名稱比對 limit）
async function checkStock(
  campaignId: number,
  items: OrderItem[],
  soldByName: Record<string, number>
): Promise<string | null> {
  const products = await db
    .select({ id: campaignProducts.id, name: campaignProducts.name, limit: campaignProducts.limit })
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));

  // 同名商品保留最大 limit（通常活動內只會有一筆，保險起見）
  const limitByName = new Map<string, number>();
  for (const p of products) {
    if (p.limit == null) continue;
    const key = p.name.trim();
    const prev = limitByName.get(key);
    if (prev === undefined || p.limit > prev) limitByName.set(key, p.limit);
  }

  // 聚合本次下單裡同名商品的總數
  const requestedByName: Record<string, number> = {};
  for (const it of items) {
    const key = (it.name || "").trim();
    if (!key) continue;
    requestedByName[key] = (requestedByName[key] || 0) + it.quantity;
  }

  for (const [name, want] of Object.entries(requestedByName)) {
    const limit = limitByName.get(name);
    if (limit === undefined) continue;
    const sold = soldByName[name] || 0;
    const remaining = Math.max(0, limit - sold);
    if (want > remaining) {
      return `「${name}」剩餘 ${remaining} 份，無法購買 ${want} 份`;
    }
  }
  return null;
}

// 以「先下單先得」方式累算，判斷指定訂單是否把任何商品推過 limit
async function findOverflowForOrder(campaignId: number, orderId: number): Promise<string | null> {
  const products = await db
    .select({ name: campaignProducts.name, limit: campaignProducts.limit })
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));
  const limitByName = new Map<string, number>();
  for (const p of products) {
    if (p.limit == null) continue;
    const key = p.name.trim();
    const prev = limitByName.get(key);
    if (prev === undefined || p.limit > prev) limitByName.set(key, p.limit);
  }
  if (limitByName.size === 0) return null;

  const rows = await db
    .select({ id: fundraiseOrders.id, items: fundraiseOrders.items, createdAt: fundraiseOrders.createdAt })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaignId));
  rows.sort((a, b) => {
    const t = (a.createdAt || "").localeCompare(b.createdAt || "");
    return t !== 0 ? t : a.id - b.id;
  });

  const cum: Record<string, number> = {};
  for (const r of rows) {
    const items = JSON.parse(r.items || "[]") as { name?: string; quantity: number }[];
    for (const it of items) {
      const key = (it.name || "").trim();
      if (!key || !limitByName.has(key)) continue;
      cum[key] = (cum[key] || 0) + it.quantity;
      if (r.id === orderId && cum[key] > (limitByName.get(key) as number)) {
        return key;
      }
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
  const { campaignId, customerName, phone, email, address, deliveryMethod, paymentMethod, transferLast5, items, notes, isSupporter, supportType, supportDiscount } = body;

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

    const { soldByName } = await getSoldQuantities(campaignId);

    // 庫存檢查
    const stockError = await checkStock(campaignId, items, soldByName);
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    const subtotal = await calculateTotal(campaignId, items);

    // 計算折扣（根據支持類型）
    let discountAmount = 0;
    const pct = Number(supportDiscount) || 0;
    if (pct > 0 && campaign.supporterDiscount > 0) {
      discountAmount = Math.round(subtotal * pct / 100);
    }
    const afterDiscount = subtotal - discountAmount;
    // 郵寄未滿 1000 加收 65 元運費
    const isShipping = (deliveryMethod || "shipping") === "shipping";
    const shippingFeeAmount = isShipping && afterDiscount < 1000 ? 65 : 0;
    const computedTotal = afterDiscount + shippingFeeAmount;

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
        paymentMethod: paymentMethod || "cash",
        transferLast5: (paymentMethod === "transfer" && typeof transferLast5 === "string") ? transferLast5.trim().slice(0, 5) : "",
        items: JSON.stringify(items),
        combos: "[]",
        addons: "[]",
        isSupporter: !!supportType && supportType !== "first_time",
        supportType: supportType || "",
        discountAmount,
        shippingFee: shippingFeeAmount,
        notes: notes || "",
        total: computedTotal,
      })
      .returning()
      .get();

    // 下單後再以「時間先後」重算一次，若本筆訂單把某商品推過 limit 則 rollback
    const overflowName = await findOverflowForOrder(campaignId, order.id);
    if (overflowName) {
      await db.delete(fundraiseOrders).where(eq(fundraiseOrders.id, order.id));
      return NextResponse.json({ error: `「${overflowName}」剛好被其他顧客搶先下單售完，訂單無法成立` }, { status: 409 });
    }

    // 寄確認信（必須 await，否則 Vercel Serverless 會在回傳後中斷寄信）
    if (email) {
      try {
        // 匯款訂單附上匯款資訊
        let bankTransferInfo = "";
        if (paymentMethod === "transfer") {
          const row = await db
            .select({ value: siteSettings.value })
            .from(siteSettings)
            .where(eq(siteSettings.key, "bank_transfer_info"))
            .get();
          bankTransferInfo = row?.value || "";
        }
        const mainItems = (items as OrderItem[]).filter((i) => i.group !== "加購商品");
        const addonItems = (items as OrderItem[]).filter((i) => i.group === "加購商品");
        await sendOrderConfirmationEmail({
          customerName,
          email,
          combos: mainItems.map((i) => ({ name: i.name, items: [i.description || ""], quantity: i.quantity, price: i.price })),
          addons: addonItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total: computedTotal,
          discountAmount,
          shippingFee: shippingFeeAmount,
          deliveryMethod: deliveryMethod || "shipping",
          paymentMethod: paymentMethod || "cash",
          address,
          notes: notes || "",
          orderId: order.id,
          bankTransferInfo,
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
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
  const { orderId, campaignId, customerName, phone, email, address, deliveryMethod, paymentMethod, transferLast5, items, notes, isSupporter, supportType, supportDiscount } = body;

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

    const { soldByName } = await getSoldQuantities(cId, orderId);
    const stockError = await checkStock(cId, items || [], soldByName);
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    const subtotal = await calculateTotal(cId, items || []);

    // 計算折扣（根據支持類型）
    const campaignData = await db.select().from(campaigns).where(eq(campaigns.id, cId)).get();
    let discountAmount = 0;
    const putPct = Number(supportDiscount) || 0;
    if (putPct > 0 && campaignData && campaignData.supporterDiscount > 0) {
      discountAmount = Math.round(subtotal * putPct / 100);
    }
    const putAfterDiscount = subtotal - discountAmount;
    const putIsShipping = (deliveryMethod || "shipping") === "shipping";
    const putShippingFee = putIsShipping && putAfterDiscount < 1000 ? 65 : 0;
    const computedTotal = putAfterDiscount + putShippingFee;

    await db
      .update(fundraiseOrders)
      .set({
        customerName,
        phone,
        email: email || "",
        address,
        deliveryMethod: deliveryMethod || "shipping",
        paymentMethod: paymentMethod || "cash",
        transferLast5: (paymentMethod === "transfer" && typeof transferLast5 === "string") ? transferLast5.trim().slice(0, 5) : "",
        items: JSON.stringify(items || []),
        isSupporter: !!supportType && supportType !== "first_time",
        supportType: supportType || "",
        discountAmount,
        shippingFee: putShippingFee,
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

  const rows = await db
    .select({
      order: fundraiseOrders,
      campaignName: campaigns.name,
    })
    .from(fundraiseOrders)
    .leftJoin(campaigns, eq(fundraiseOrders.campaignId, campaigns.id))
    .where(eq(fundraiseOrders.userId, session.id))
    .orderBy(fundraiseOrders.createdAt);

  const result = rows.map((r) => ({
    ...r.order,
    campaignName: r.campaignName || "",
    items: JSON.parse(r.order.items || "[]"),
    combos: JSON.parse(r.order.combos),
    addons: JSON.parse(r.order.addons),
  }));

  return NextResponse.json(result);
}
