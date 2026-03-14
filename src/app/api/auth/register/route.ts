import { NextRequest, NextResponse } from "next/server";
import { register, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password, name } = await req.json();

  if (!username || !password || !name) {
    return NextResponse.json({ error: "請填寫所有欄位" }, { status: 400 });
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { error: "帳號長度需在 3-20 字之間" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "密碼至少需要 6 個字元" },
      { status: 400 }
    );
  }

  const result = await register(username, password, name);

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
