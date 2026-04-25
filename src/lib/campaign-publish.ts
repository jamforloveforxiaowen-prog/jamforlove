import { db } from "@/lib/db";
import {
  campaignGroups,
  campaignProducts,
  campaignProductLimitLogs,
  fundraiseOrders,
} from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

/* ─── 型別 ─── */

export interface DraftProduct {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  limit: number | null;
  unit?: string;
  sortOrder?: number;
  note?: string;
  isActive?: boolean;
}

export interface DraftGroup {
  name: string;
  description?: string;
  sortOrder?: number;
  isRequired: boolean;
  products: DraftProduct[];
}

export interface DraftPayload {
  groups: DraftGroup[];
}

/* ─── 套用草稿到正式表 ─── */

/**
 * 把 draftPayload 套用到 campaign_groups + campaign_products
 * - 商品依 id 保留（沒提供 id 的視為新商品）
 * - 群組依 isRequired 標誌配對（每個 campaign 最多一個必填+一個非必填群組）
 * - 沒出現在 draft 裡的舊商品 → 軟刪除（保留歷史訂單引用）
 */
export async function applyDraftToLive(
  campaignId: number,
  payload: DraftPayload
): Promise<void> {
  const groups = payload.groups || [];

  const existingGroups = await db
    .select()
    .from(campaignGroups)
    .where(eq(campaignGroups.campaignId, campaignId));
  const existingProducts = await db
    .select()
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));
  const existingProductMap = new Map(existingProducts.map((p) => [p.id, p]));

  const keptProductIds = new Set<number>();

  for (const group of groups) {
    const isRequired = group.isRequired ?? false;
    const existingGroup = existingGroups.find(
      (g) => g.isRequired === isRequired
    );

    let groupId: number;
    if (existingGroup) {
      await db
        .update(campaignGroups)
        .set({
          name: group.name,
          description: group.description || "",
          sortOrder: group.sortOrder ?? 0,
          isRequired,
        })
        .where(eq(campaignGroups.id, existingGroup.id));
      groupId = existingGroup.id;
    } else {
      const g = await db
        .insert(campaignGroups)
        .values({
          campaignId,
          name: group.name,
          description: group.description || "",
          sortOrder: group.sortOrder ?? 0,
          isRequired,
        })
        .returning()
        .get();
      groupId = g.id;
    }

    for (const product of group.products || []) {
      const productPayload = {
        campaignId,
        groupId,
        name: product.name,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        price: product.price,
        limit: product.limit ?? null,
        unit: product.unit || "份",
        sortOrder: product.sortOrder ?? 0,
        note: product.note || "",
        isActive: product.isActive ?? true,
      };

      const existing =
        typeof product.id === "number"
          ? existingProductMap.get(product.id)
          : undefined;

      if (existing) {
        await db
          .update(campaignProducts)
          .set(productPayload)
          .where(eq(campaignProducts.id, existing.id));
        keptProductIds.add(existing.id);

        const oldLimit = existing.limit;
        const newLimit = productPayload.limit;
        if (oldLimit !== newLimit) {
          await db.insert(campaignProductLimitLogs).values({
            campaignId,
            productId: existing.id,
            delta: (newLimit ?? 0) - (oldLimit ?? 0),
            prevLimit: oldLimit,
            newLimit: newLimit,
            note: "",
          });
        }
      } else {
        const inserted = await db
          .insert(campaignProducts)
          .values(productPayload)
          .returning()
          .get();
        if (inserted.limit != null) {
          await db.insert(campaignProductLimitLogs).values({
            campaignId,
            productId: inserted.id,
            delta: inserted.limit,
            prevLimit: null,
            newLimit: inserted.limit,
            note: "新增商品",
          });
        }
      }
    }
  }

  // 沒出現在 payload 裡的舊商品 → 軟刪除
  const orphanIds = existingProducts
    .filter((p) => !keptProductIds.has(p.id) && p.isActive)
    .map((p) => p.id);
  if (orphanIds.length > 0) {
    await db
      .update(campaignProducts)
      .set({ isActive: false })
      .where(
        and(
          eq(campaignProducts.campaignId, campaignId),
          inArray(campaignProducts.id, orphanIds)
        )
      );
  }
}

/* ─── 取得活動的「目前生效」商品結構 ─── */

export async function loadLiveGroups(campaignId: number) {
  const groups = await db
    .select()
    .from(campaignGroups)
    .where(eq(campaignGroups.campaignId, campaignId))
    .orderBy(asc(campaignGroups.sortOrder));

  const products = await db
    .select()
    .from(campaignProducts)
    .where(
      and(
        eq(campaignProducts.campaignId, campaignId),
        eq(campaignProducts.isActive, true)
      )
    )
    .orderBy(asc(campaignProducts.sortOrder));

  return groups.map((g) => ({
    ...g,
    products: products.filter((p) => p.groupId === g.id),
  }));
}

/* ─── 計算每個 productId 的歷史銷量 ─── */

export async function loadSoldByProductId(
  campaignId: number
): Promise<Record<number, number>> {
  const allProducts = await db
    .select()
    .from(campaignProducts)
    .where(eq(campaignProducts.campaignId, campaignId));
  const validIds = new Set(allProducts.map((p) => p.id));
  const activeNameToId = new Map<string, number>();
  for (const p of allProducts) {
    if (p.isActive) activeNameToId.set(p.name.trim(), p.id);
  }

  const orders = await db
    .select({ items: fundraiseOrders.items })
    .from(fundraiseOrders)
    .where(eq(fundraiseOrders.campaignId, campaignId));

  const sold: Record<number, number> = {};
  for (const o of orders) {
    const items = JSON.parse(o.items || "[]") as {
      productId?: number;
      name?: string;
      quantity: number;
    }[];
    for (const it of items) {
      let pid: number | undefined;
      if (it.productId && validIds.has(it.productId)) pid = it.productId;
      else {
        const fallback = activeNameToId.get((it.name || "").trim());
        if (fallback) pid = fallback;
      }
      if (pid != null) sold[pid] = (sold[pid] || 0) + it.quantity;
    }
  }
  return sold;
}

/* ─── 變更摘要：比對 draft vs live ─── */

export interface DraftDiffEntry {
  type: "rename" | "remove" | "add" | "price" | "limit" | "unchanged";
  productId?: number;
  beforeName?: string;
  afterName?: string;
  beforePrice?: number;
  afterPrice?: number;
  beforeLimit?: number | null;
  afterLimit?: number | null;
  sold?: number;
}

export async function computeDiff(
  campaignId: number,
  draft: DraftPayload | null
): Promise<DraftDiffEntry[]> {
  if (!draft) return [];

  const liveProducts = await db
    .select()
    .from(campaignProducts)
    .where(
      and(
        eq(campaignProducts.campaignId, campaignId),
        eq(campaignProducts.isActive, true)
      )
    );
  const liveById = new Map(liveProducts.map((p) => [p.id, p]));
  const sold = await loadSoldByProductId(campaignId);

  const seen = new Set<number>();
  const diff: DraftDiffEntry[] = [];

  for (const group of draft.groups || []) {
    for (const product of group.products || []) {
      if (typeof product.id === "number" && liveById.has(product.id)) {
        const before = liveById.get(product.id)!;
        seen.add(product.id);
        if (before.name.trim() !== product.name.trim()) {
          diff.push({
            type: "rename",
            productId: product.id,
            beforeName: before.name,
            afterName: product.name,
            sold: sold[product.id] || 0,
          });
        }
        if (before.price !== product.price) {
          diff.push({
            type: "price",
            productId: product.id,
            afterName: product.name,
            beforePrice: before.price,
            afterPrice: product.price,
            sold: sold[product.id] || 0,
          });
        }
        const beforeLimit = before.limit;
        const afterLimit = product.limit;
        if ((beforeLimit ?? null) !== (afterLimit ?? null)) {
          diff.push({
            type: "limit",
            productId: product.id,
            afterName: product.name,
            beforeLimit: beforeLimit,
            afterLimit: afterLimit,
            sold: sold[product.id] || 0,
          });
        }
      } else {
        diff.push({
          type: "add",
          afterName: product.name,
          afterPrice: product.price,
        });
      }
    }
  }

  for (const live of liveProducts) {
    if (!seen.has(live.id)) {
      diff.push({
        type: "remove",
        productId: live.id,
        beforeName: live.name,
        sold: sold[live.id] || 0,
      });
    }
  }

  return diff;
}

/* ─── Preview token ─── */

export function generatePreviewToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
