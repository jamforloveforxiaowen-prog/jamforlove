import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fundraiseOrders, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import {
  renderOrderConfirmationHtml,
  sendOrderConfirmationEmail,
} from "@/lib/email";

interface OrderItemRow {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

interface RawOrder {
  id: number;
  customerName: string;
  email: string;
  address: string;
  deliveryMethod: "shipping" | "pickup";
  paymentMethod: "cash" | "transfer";
  items: string;
  combos: string;
  addons: string;
  discountAmount: number;
  shippingFee: number;
  notes: string;
  total: number;
  createdAt: string;
}

function parseItems(order: RawOrder) {
  const items = JSON.parse(order.items || "[]") as OrderItemRow[];
  const combos = items.map((i) => ({
    name: i.name,
    items: [i.description || ""],
    quantity: i.quantity,
    price: i.price,
  }));
  return { combos, addons: [] as typeof combos };
}

function buildEmailData(order: RawOrder, bankTransferInfo: string) {
  const { combos, addons } = parseItems(order);
  return {
    customerName: order.customerName,
    email: order.email,
    combos,
    addons,
    total: order.total,
    discountAmount: order.discountAmount,
    shippingFee: order.shippingFee,
    deliveryMethod: order.deliveryMethod,
    paymentMethod: order.paymentMethod,
    address: order.address,
    notes: order.notes,
    orderId: order.id,
    bankTransferInfo,
  };
}

async function fetchBankTransferInfo(): Promise<string> {
  const row = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "bank_transfer_info"))
    .get();
  return row?.value || "";
}

async function fetchPickupOrders(): Promise<RawOrder[]> {
  const rows = await db
    .select({
      id: fundraiseOrders.id,
      customerName: fundraiseOrders.customerName,
      email: fundraiseOrders.email,
      address: fundraiseOrders.address,
      deliveryMethod: fundraiseOrders.deliveryMethod,
      paymentMethod: fundraiseOrders.paymentMethod,
      items: fundraiseOrders.items,
      combos: fundraiseOrders.combos,
      addons: fundraiseOrders.addons,
      discountAmount: fundraiseOrders.discountAmount,
      shippingFee: fundraiseOrders.shippingFee,
      notes: fundraiseOrders.notes,
      total: fundraiseOrders.total,
      createdAt: fundraiseOrders.createdAt,
    })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.deliveryMethod, "pickup"));
  return rows as RawOrder[];
}

/**
 * GET：列出所有面交訂單。
 * - 無參數：JSON 清單
 * - ?preview=<orderId>：回傳單筆訂單的更正信 HTML（在瀏覽器開就看得到信件樣貌）
 * - ?preview=first：回傳第一筆訂單的更正信 HTML
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orders = await fetchPickupOrders();
  const { searchParams } = new URL(req.url);
  const preview = searchParams.get("preview");

  if (preview) {
    const target =
      preview === "first"
        ? orders[0]
        : orders.find((o) => o.id === Number(preview));
    if (!target) {
      return new NextResponse("找不到對應訂單", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    const bankTransferInfo = await fetchBankTransferInfo();
    const html = renderOrderConfirmationHtml(buildEmailData(target, bankTransferInfo), {
      isCorrection: true,
    });
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const summary = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    email: o.email,
    address: o.address,
    total: o.total,
    createdAt: o.createdAt,
    hasEmail: !!o.email,
  }));

  return NextResponse.json({
    count: orders.length,
    withEmail: summary.filter((s) => s.hasEmail).length,
    orders: summary,
  });
}

/**
 * POST：實寄更正信給所有面交訂單（需 body { confirm: true }）。
 * 回傳每筆寄送結果。
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { confirm?: boolean };
  if (!body.confirm) {
    return NextResponse.json(
      { error: "Missing { confirm: true }" },
      { status: 400 }
    );
  }

  const orders = await fetchPickupOrders();
  const bankTransferInfo = await fetchBankTransferInfo();
  const results: Array<{
    orderId: number;
    email: string;
    ok: boolean;
    error?: string;
  }> = [];

  for (const o of orders) {
    if (!o.email) {
      results.push({ orderId: o.id, email: "", ok: false, error: "no email" });
      continue;
    }
    try {
      await sendOrderConfirmationEmail(buildEmailData(o, bankTransferInfo), {
        isCorrection: true,
        bypassRateLimit: true,
      });
      results.push({ orderId: o.id, email: o.email, ok: true });
      // 輕微節流，避免 Gmail SMTP 瞬間爆量
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ orderId: o.id, email: o.email, ok: false, error: msg });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  return NextResponse.json({
    total: results.length,
    sent: okCount,
    failed: results.length - okCount,
    results,
  });
}
