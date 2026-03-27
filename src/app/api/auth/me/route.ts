import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      name: users.name,
      phone: users.phone,
      email: users.email,
      address: users.address,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .get();

  return NextResponse.json({ user: user || null });
}
