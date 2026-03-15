import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { error: "請輸入 Email" },
      { status: 400 }
    );
  }

  // 不管 email 是否存在都回傳成功（防止帳號列舉攻擊）
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 小時後過期

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "Jam For Love <onboarding@resend.dev>",
      to: email,
      subject: "重設您的密碼 — Jam For Love",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1e0f08; margin-bottom: 16px;">重設密碼</h2>
          <p style="color: #5c3d2e; line-height: 1.6;">
            您好 ${user.name}，<br><br>
            我們收到了重設您 Jam For Love 帳號密碼的請求。
            請點擊下方按鈕設定新密碼：
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #c4506a; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 24px 0;">
            重設密碼
          </a>
          <p style="color: #5c3d2e; font-size: 14px; line-height: 1.6;">
            此連結將在 1 小時後失效。<br>
            如果這不是您本人的操作，請忽略此信件。
          </p>
          <hr style="border: none; border-top: 1px solid #ebe2d4; margin: 32px 0;" />
          <p style="color: #5c3d2e80; font-size: 12px;">
            Jam For Love — 用愛手工熬煮
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({
    message: "如果此 Email 已註冊，重設連結已寄出，請查收信箱",
  });
}
