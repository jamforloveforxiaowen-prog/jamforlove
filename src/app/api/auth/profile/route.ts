import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, email, address } = await req.json();

  // 輸入驗證：限制各欄位長度，防止超長字串寫入資料庫
  const MAX_LENGTH = 200;
  if (
    (name && String(name).length > MAX_LENGTH) ||
    (phone && String(phone).length > MAX_LENGTH) ||
    (email && String(email).length > MAX_LENGTH) ||
    (address && String(address).length > MAX_LENGTH)
  ) {
    return NextResponse.json(
      { error: "Input too long, maximum 200 characters per field" },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({
      name: name ?? "",
      phone: phone ?? "",
      email: email ?? "",
      address: address ?? "",
    })
    .where(eq(users.id, session.id));

  return NextResponse.json({ success: true });
}
