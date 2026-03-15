import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "缺少必要參數" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "密碼至少需要 6 個字元" },
      { status: 400 }
    );
  }

  const resetToken = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false)
      )
    )
    .get();

  if (!resetToken) {
    return NextResponse.json(
      { error: "連結無效或已使用" },
      { status: 400 }
    );
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: "連結已過期，請重新申請" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId));

  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return NextResponse.json({ success: true });
}
