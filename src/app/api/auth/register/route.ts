import { NextRequest, NextResponse } from "next/server";
import { register, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "請輸入名稱" }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "請輸入 Email" }, { status: 400 });
  }

  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "請輸入聯絡電話" }, { status: 400 });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();

  if (trimmedName.length < 1 || trimmedName.length > 20) {
    return NextResponse.json(
      { error: "名稱長度需在 1-20 字之間" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return NextResponse.json(
      { error: "請輸入有效的 Email 地址" },
      { status: 400 }
    );
  }

  const result = await register(trimmedName, trimmedEmail, trimmedPhone);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const user = result.user!;
  const token = await createToken({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
