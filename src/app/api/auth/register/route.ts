import { NextRequest, NextResponse } from "next/server";
import { register, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "請輸入名稱" }, { status: 400 });
  }

  const trimmed = name.trim();

  if (trimmed.length < 1 || trimmed.length > 20) {
    return NextResponse.json(
      { error: "名稱長度需在 1-20 字之間" },
      { status: 400 }
    );
  }

  const result = await register(trimmed);

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
