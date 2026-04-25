import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import {
  applyDraftToLive,
  generatePreviewToken,
  type DraftPayload,
} from "@/lib/campaign-publish";

// 發佈草稿：把 draftPayload 套用到正式的 campaignGroups + campaignProducts
// - 清空 draftPayload
// - 設定 publishedAt = now
// - 維持 previewToken（不重新產生）
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const campaignId = Number(id);

  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .get();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!campaign.draftPayload) {
    return NextResponse.json(
      { error: "沒有未發佈的變更" },
      { status: 400 }
    );
  }

  let payload: DraftPayload;
  try {
    payload = JSON.parse(campaign.draftPayload);
  } catch {
    return NextResponse.json({ error: "草稿內容格式錯誤" }, { status: 500 });
  }

  await applyDraftToLive(campaignId, payload);

  await db
    .update(campaigns)
    .set({
      draftPayload: null,
      publishedAt: sql`(datetime('now'))`,
      previewToken: campaign.previewToken || generatePreviewToken(),
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(campaigns.id, campaignId));

  return NextResponse.json({ success: true });
}

// 捨棄草稿
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const campaignId = Number(id);

  await db
    .update(campaigns)
    .set({
      draftPayload: null,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(campaigns.id, campaignId));

  return NextResponse.json({ success: true });
}
