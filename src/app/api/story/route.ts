import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storyBlocks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const published = await db
    .select()
    .from(storyBlocks)
    .where(eq(storyBlocks.isPublished, true))
    .orderBy(asc(storyBlocks.sortOrder));

  return NextResponse.json(published);
}
