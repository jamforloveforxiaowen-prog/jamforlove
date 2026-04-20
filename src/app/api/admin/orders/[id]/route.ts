import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, orderModifyRequests } from "@/lib/db/schema";
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
