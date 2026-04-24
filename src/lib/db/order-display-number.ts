import { asc } from "drizzle-orm";
import { db } from "./index";
import { fundraiseOrders } from "./schema";

// 依 createdAt → id 排序，將每筆訂單映射成從 1 開始的顯示序號
// 資料庫主鍵 id 仍是 API 呼叫用的唯一識別，不受此函式影響
export async function getAllOrderDisplayNumbers(): Promise<Map<number, number>> {
  const rows = await db
    .select({ id: fundraiseOrders.id })
    .from(fundraiseOrders)
    .orderBy(asc(fundraiseOrders.createdAt), asc(fundraiseOrders.id));
  const map = new Map<number, number>();
  rows.forEach((r, i) => map.set(r.id, i + 1));
  return map;
}

export async function getOrderDisplayNumber(orderId: number): Promise<number> {
  const map = await getAllOrderDisplayNumbers();
  return map.get(orderId) ?? orderId;
}
