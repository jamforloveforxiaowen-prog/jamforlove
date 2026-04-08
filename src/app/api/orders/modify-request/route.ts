import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderModifyRequests, fundraiseOrders, siteSettings, campaigns } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { sendOrderModifyNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const { orderId, message } = await req.json();

  if (!orderId || !message?.trim()) {
    return NextResponse.json({ error: "請填寫修改內容" }, { status: 400 });
  }

  // 確認訂單屬於此用戶
  const order = await db
    .select()
    .from(fundraiseOrders)
    .where(and(eq(fundraiseOrders.id, orderId), eq(fundraiseOrders.userId, session.id)))
    .get();

  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  // 取得活動名稱
  let campaignName = "";
  if (order.campaignId) {
    const campaign = await db.select({ name: campaigns.name }).from(campaigns).where(eq(campaigns.id, order.campaignId)).get();
    campaignName = campaign?.name || "";
  }

  // 儲存修改申請
  await db.insert(orderModifyRequests).values({
    orderId,
    customerName: order.customerName,
    phone: order.phone,
    message: message.trim(),
  });

  // 取得通知信箱
  const emailSetting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "order_notify_emails"))
    .get();

  const notifyEmails: string[] = emailSetting?.value ? JSON.parse(emailSetting.value) : [];

  // 解析訂單品項
  const items = JSON.parse(order.items || "[]") as { name: string; quantity: number; price: number }[];

  // 寄通知信給所有管理員信箱
  if (notifyEmails.length > 0) {
    sendOrderModifyNotification({
      orderId,
      customerName: order.customerName,
      phone: order.phone,
      campaignName,
      items,
      total: order.total,
      message: message.trim(),
      notifyEmails,
    }).catch((err) => {
      console.error("Failed to send modify notification:", err);
    });
  }

  return NextResponse.json({ success: true });
}
