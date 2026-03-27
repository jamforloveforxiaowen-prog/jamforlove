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
