import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, orderModifyRequests, campaignProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "completed"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

const VALID_DELIVERY = ["shipping", "pickup"] as const;
type DeliveryMethod = typeof VALID_DELIVERY[number];

const VALID_PAYMENT = ["cash", "transfer"] as const;
type PaymentMethod = typeof VALID_PAYMENT[number];

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

// 後台編輯訂單時以「商品名稱」彙總的庫存檢查（排除自己）
async function checkAdminStock(
  campaignId: number,
  items: Array<{ name?: string; quantity: number }>,
  excludeOrderId: number,
): Promise<string | null> {
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

  const allOrders = await db
    .select({ id: fundraiseOrders.id, items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaignId));
  const soldByName: Record<string, number> = {};
  for (const o of allOrders) {
    if (o.id === excludeOrderId) continue;
    const arr = JSON.parse(o.items || "[]") as Array<{ name?: string; quantity: number }>;
    for (const it of arr) {
      const key = (it.name || "").trim();
      if (!key) continue;
      soldByName[key] = (soldByName[key] || 0) + it.quantity;
    }
  }

  const requested: Record<string, number> = {};
  for (const it of items) {
    const key = (it.name || "").trim();
    if (!key) continue;
    requested[key] = (requested[key] || 0) + it.quantity;
  }
  for (const [name, want] of Object.entries(requested)) {
    const limit = limitByName.get(name);
    if (limit === undefined) continue;
    const sold = soldByName[name] || 0;
    if (sold + want > limit) {
      const remaining = Math.max(0, limit - sold);
      return `「${name}」剩餘 ${remaining} 份，無法改為 ${want} 份`;
    }
  }
  return null;
}

/* ─── 更新訂單狀態（快速切換） ─── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const { status } = await req.json();

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

/* ─── 完整編輯訂單 ─── */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};

  if (typeof body.customerName === "string") update.customerName = body.customerName.trim();
  if (typeof body.phone === "string") update.phone = body.phone.trim();
  if (typeof body.email === "string") update.email = body.email.trim();
  if (typeof body.address === "string") update.address = body.address.trim();
  if (typeof body.notes === "string") update.notes = body.notes;

  if (body.deliveryMethod !== undefined) {
    if (!VALID_DELIVERY.includes(body.deliveryMethod)) {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }
    update.deliveryMethod = body.deliveryMethod as DeliveryMethod;
  }

  if (body.paymentMethod !== undefined) {
    if (!VALID_PAYMENT.includes(body.paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }
    update.paymentMethod = body.paymentMethod as PaymentMethod;
  }

  if (typeof body.transferLast5 === "string") {
    update.transferLast5 = body.transferLast5.trim().slice(0, 5);
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status as OrderStatus;
  }

  if (Array.isArray(body.items)) {
    // 若修改了 items，須重新檢查庫存（依商品名稱彙總）
    const orderId = Number(id);
    const existing = await db
      .select({ campaignId: fundraiseOrders.campaignId })
      .from(fundraiseOrders)
      .where(eq(fundraiseOrders.id, orderId))
      .get();
    if (existing?.campaignId) {
      const stockError = await checkAdminStock(existing.campaignId, body.items, orderId);
      if (stockError) {
        return NextResponse.json({ error: stockError }, { status: 400 });
      }
    }
    update.items = JSON.stringify(body.items);
  }

  if (typeof body.total === "number" && body.total >= 0) {
    update.total = Math.round(body.total);
  }

  if (typeof body.shippingFee === "number" && body.shippingFee >= 0) {
    update.shippingFee = Math.round(body.shippingFee);
  }

  if (typeof body.discountAmount === "number" && body.discountAmount >= 0) {
    update.discountAmount = Math.round(body.discountAmount);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await db
    .update(fundraiseOrders)
    .set(update)
    .where(eq(fundraiseOrders.id, Number(id)));

  return NextResponse.json({ success: true });
}

/* ─── 刪除訂單 ─── */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const orderId = Number(id);

  // 先刪關聯的修改申請，避免外鍵錯誤
  await db
    .delete(orderModifyRequests)
    .where(eq(orderModifyRequests.orderId, orderId));

  await db.delete(fundraiseOrders).where(eq(fundraiseOrders.id, orderId));

  return NextResponse.json({ success: true });
}
