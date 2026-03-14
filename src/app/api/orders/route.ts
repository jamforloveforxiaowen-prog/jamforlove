import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

interface OrderItemInput {
  productId: number;
  quantity: number;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.id))
    .orderBy(orders.createdAt);

  // 取得每筆訂單的明細
  const result = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerName, phone, address, notes, items } = await req.json();

  if (!customerName || !phone || !address) {
    return NextResponse.json(
      { error: "請填寫姓名、電話和地址" },
      { status: 400 }
    );
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "請至少選擇一項產品" },
      { status: 400 }
    );
  }

  // 驗證產品並計算總價
  let total = 0;
  const validatedItems: { productId: number; quantity: number; price: number }[] = [];

  for (const item of items as OrderItemInput[]) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return NextResponse.json(
        { error: "商品資料有誤，請重新選擇" },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, item.productId), eq(products.isActive, true)))
      .get();

    if (!product) {
      return NextResponse.json(
        { error: "部分商品已下架，請重新選擇" },
        { status: 400 }
      );
    }

    const subtotal = product.price * item.quantity;
    total += subtotal;
    validatedItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // 建立訂單
  const order = await db
    .insert(orders)
    .values({
      userId: session.id,
      customerName,
      phone,
      address,
      notes: notes || "",
      total,
    })
    .returning()
    .get();

  // 建立訂單明細
  await Promise.all(
    validatedItems.map((item) =>
      db.insert(orderItems).values({
        orderId: order.id,
        ...item,
      })
    )
  );

  return NextResponse.json({ success: true, orderId: order.id });
}
