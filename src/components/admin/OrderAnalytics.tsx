"use client";

import React, { useMemo } from "react";
import { dayKeyTW } from "@/lib/datetime";

/* ─── 型別（跟 admin/page.tsx 一致）─── */

interface OrderItem {
  productId: number;
  name: string;
  description?: string;
  group: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  campaignId: number | null;
  userId: number;
  username: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deliveryMethod: string;
  items: OrderItem[];
  combos: { id: number; name: string; items: string[]; quantity: number; price: number }[];
  addons: { id: number; name: string; quantity: number; price: number }[];
  notes: string;
  total: number;
  status: string;
  createdAt: string;
}

interface CampaignInfo {
  id: number;
  name: string;
}

/* ─── 工具 ─── */

type NormalizedItem = { productId: number | null; name: string; quantity: number; price: number };

function getOrderItems(o: Order): NormalizedItem[] {
  if (o.items && o.items.length > 0) {
    return o.items.map((i) => ({
      productId: i.productId || null,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));
  }
  return [
    ...o.combos.map((c) => ({ productId: null, name: `${c.name}（${c.items.join("、")}）`, quantity: c.quantity, price: c.price })),
    ...o.addons.map((a) => ({ productId: null, name: a.name, quantity: a.quantity, price: a.price })),
  ];
}

function extractCity(address: string): string {
  const match = address.match(/([\u4e00-\u9fff]{2,3}[市縣])/);
  return match ? match[1] : "其他";
}

const COLORS = ["#c4506a", "#c89530", "#6b8e5f", "#3d2b1f", "#e8a0b0", "#a3425a", "#7a6b60", "#8fbc8f", "#d4a574", "#b8860b"];

/* ─── 元件 ─── */

export default function OrderAnalytics({
  orders,
  campaigns,
}: {
  orders: Order[];
  campaigns: CampaignInfo[];
}) {
  const analysis = useMemo(() => {
    if (orders.length === 0) return null;

    // 品項銷量排行：以 productId 為彙總鍵（legacy 無 productId 才退回 name）
    // 顯示名稱使用該 key 出現次數最多的 name（避免「草莓果醬（限量）」「草莓果醬（50）」分裂）
    const salesByKey: Record<string, number> = {};
    const revenueByKey: Record<string, number> = {};
    const nameCountByKey: Record<string, Record<string, number>> = {};
    orders.forEach((o) =>
      getOrderItems(o).forEach((i) => {
        const key = i.productId != null ? `id:${i.productId}` : `name:${i.name}`;
        salesByKey[key] = (salesByKey[key] || 0) + i.quantity;
        revenueByKey[key] = (revenueByKey[key] || 0) + i.price * i.quantity;
        if (!nameCountByKey[key]) nameCountByKey[key] = {};
        nameCountByKey[key][i.name] = (nameCountByKey[key][i.name] || 0) + i.quantity;
      })
    );
    const displayName = (key: string): string => {
      const counts = nameCountByKey[key];
      if (!counts) return key;
      // 取出現次數最多的 name；數量相同時取最短（通常是 canonical 名稱）
      return Object.entries(counts).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].length - b[0].length;
      })[0][0];
    };
    const topItems: [string, number][] = Object.entries(salesByKey)
      .sort((a, b) => b[1] - a[1])
      .map(([key, qty]) => [displayName(key), qty]);
    const maxItemQty = Math.max(...topItems.map(([, q]) => q), 1);
    const itemRevenue: [string, number][] = Object.entries(revenueByKey)
      .sort((a, b) => b[1] - a[1])
      .map(([key, rev]) => [displayName(key), rev]);

    // 每日訂單趨勢
    const dailyOrders: Record<string, number> = {};
    const dailyRevenue: Record<string, number> = {};
    orders.forEach((o) => {
      const day = dayKeyTW(o.createdAt) || o.createdAt.slice(0, 10);
      dailyOrders[day] = (dailyOrders[day] || 0) + 1;
      dailyRevenue[day] = (dailyRevenue[day] || 0) + o.total;
    });
    const sortedDays = Object.keys(dailyOrders).sort();
    const maxDailyOrders = Math.max(...Object.values(dailyOrders), 1);

    // 營收趨勢（累計）
    let cumulative = 0;
    const cumulativeRevenue = sortedDays.map((day) => {
      cumulative += dailyRevenue[day] || 0;
      return { day, total: cumulative };
    });
    const maxCumulative = cumulative || 1;

    // 平均客單價
    const avgOrderValue = Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length);

    // 取貨方式分佈
    const deliveryStats: Record<string, number> = {};
    orders.forEach((o) => {
      const label = o.deliveryMethod === "shipping" ? "郵寄" : o.address || "面交";
      deliveryStats[label] = (deliveryStats[label] || 0) + 1;
    });
    const deliveryEntries = Object.entries(deliveryStats).sort((a, b) => b[1] - a[1]);
    const totalDelivery = orders.length;

    // 地區分佈（僅郵寄）
    const cityStats: Record<string, number> = {};
    orders
      .filter((o) => o.deliveryMethod === "shipping")
      .forEach((o) => {
        const city = extractCity(o.address);
        cityStats[city] = (cityStats[city] || 0) + 1;
      });
    const cityEntries = Object.entries(cityStats).sort((a, b) => b[1] - a[1]);
    const maxCityCount = Math.max(...Object.values(cityStats), 1);

    // 回購率（跨活動）
    const userCampaigns: Record<number, Set<number>> = {};
    orders.forEach((o) => {
      if (!userCampaigns[o.userId]) userCampaigns[o.userId] = new Set();
      if (o.campaignId) userCampaigns[o.userId].add(o.campaignId);
    });
    const totalUsers = Object.keys(userCampaigns).length;
    const repeatUsers = Object.values(userCampaigns).filter((s) => s.size > 1).length;
    const repeatRate = totalUsers > 0 ? Math.round((repeatUsers / totalUsers) * 100) : 0;

    // 庫存消耗（需要 campaign products 的 limit，這裡用 item sales 近似）
    // 售完警示：銷量前幾名

    // 歷次活動對比
    const campaignStats = campaigns.map((c) => {
      const cOrders = orders.filter((o) => o.campaignId === c.id);
      const total = cOrders.reduce((s, o) => s + o.total, 0);
      const itemCount = cOrders.reduce((s, o) => s + getOrderItems(o).reduce((is, i) => is + i.quantity, 0), 0);
      return { ...c, orderCount: cOrders.length, total, itemCount, avg: cOrders.length > 0 ? Math.round(total / cOrders.length) : 0 };
    }).filter((c) => c.orderCount > 0);

    // 成長率
    const growth = campaignStats.length >= 2
      ? {
          orders: Math.round(((campaignStats[0].orderCount - campaignStats[1].orderCount) / Math.max(campaignStats[1].orderCount, 1)) * 100),
          revenue: Math.round(((campaignStats[0].total - campaignStats[1].total) / Math.max(campaignStats[1].total, 1)) * 100),
        }
      : null;

    return {
      topItems, maxItemQty, itemRevenue,
      sortedDays, dailyOrders, maxDailyOrders,
      cumulativeRevenue, maxCumulative,
      avgOrderValue,
      deliveryEntries, totalDelivery,
      cityEntries, maxCityCount,
      repeatRate, totalUsers, repeatUsers,
      campaignStats, growth,
    };
  }, [orders, campaigns]);

  if (!analysis || orders.length === 0) return null;

  const { topItems, maxItemQty, itemRevenue, sortedDays, dailyOrders, maxDailyOrders, cumulativeRevenue, maxCumulative, avgOrderValue, deliveryEntries, totalDelivery, cityEntries, maxCityCount, repeatRate, totalUsers, repeatUsers, campaignStats, growth } = analysis;

  const cardClass = "bg-white rounded-lg ring-1 ring-linen-dark/60 p-5";
  const titleClass = "font-serif text-base font-bold text-espresso mb-4";

  // 圓餅圖 conic-gradient
  function buildConicGradient(entries: [string, number][], total: number) {
    let accumulated = 0;
    const stops = entries.map(([, count], i) => {
      const start = (accumulated / total) * 100;
      accumulated += count;
      const end = (accumulated / total) * 100;
      return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }

  return (
    <div className="mb-8">
      <h3 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2">
        📊 數據分析
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ─── 品項銷量排行 ─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>品項銷量排行</h4>
          <div className="space-y-2">
            {topItems.map(([name, qty], i) => (
              <div key={`${name}-${i}`} className="flex items-center gap-3">
                <span className="text-xs text-espresso-light/40 w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-espresso truncate">{name}</span>
                    <span className="text-sm font-bold text-espresso tabular-nums shrink-0">{qty}</span>
                  </div>
                  <div className="h-2 rounded-full bg-linen-dark/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(qty / maxItemQty) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 取貨方式分佈 ─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>取貨方式分佈</h4>
          <div className="flex items-center gap-6">
            <div
              className="w-32 h-32 rounded-full shrink-0"
              style={{ background: buildConicGradient(deliveryEntries, totalDelivery) }}
            />
            <div className="space-y-2 flex-1">
              {deliveryEntries.map(([label, count], i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-espresso flex-1 truncate">{label}</span>
                  <span className="text-sm font-bold text-espresso tabular-nums">{count}</span>
                  <span className="text-xs text-espresso-light/40">{Math.round((count / totalDelivery) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 每日訂單趨勢 ─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>每日訂單趨勢</h4>
          {sortedDays.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-end gap-2" style={{ height: 220, minWidth: Math.max(sortedDays.length * 36, 280) }}>
                {sortedDays.map((day) => {
                  const count = dailyOrders[day] || 0;
                  const height = Math.max((count / maxDailyOrders) * 100, 4);
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5 min-w-[32px]" title={`${day}: ${count} 筆`}>
                      <span className="text-sm font-bold text-espresso tabular-nums">{count}</span>
                      <div
                        className="w-full rounded-t-md"
                        style={{ height: `${height}%`, background: "#c4506a", minWidth: 16 }}
                      />
                      <span className="text-xs text-espresso-light/70 tabular-nums">{day.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-espresso-light/60">資料不足</p>
          )}
        </div>

        {/* ─── 營收趨勢（累計）─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>累計營收趨勢</h4>
          {cumulativeRevenue.length > 1 ? (
            <svg viewBox={`0 0 ${cumulativeRevenue.length * 40} 120`} className="w-full" style={{ height: 120 }}>
              {/* 背景網格 */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <line key={pct} x1="0" y1={120 - (pct / 100) * 110} x2={cumulativeRevenue.length * 40} y2={120 - (pct / 100) * 110} stroke="#ebe2d4" strokeWidth="1" />
              ))}
              {/* 折線 */}
              <polyline
                fill="none"
                stroke="#c89530"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={cumulativeRevenue.map((d, i) => `${i * 40 + 20},${120 - (d.total / maxCumulative) * 110}`).join(" ")}
              />
              {/* 資料點 */}
              {cumulativeRevenue.map((d, i) => (
                <circle key={i} cx={i * 40 + 20} cy={120 - (d.total / maxCumulative) * 110} r="4" fill="#c89530" />
              ))}
            </svg>
          ) : (
            <p className="text-sm text-espresso-light/40">資料不足</p>
          )}
          <p className="text-right text-sm font-bold text-honey mt-2">
            累計 NT$ {cumulativeRevenue[cumulativeRevenue.length - 1]?.total.toLocaleString() || 0}
          </p>
        </div>

        {/* ─── 關鍵數字 ─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>關鍵指標</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-linen/50">
              <p className="text-2xl font-bold text-espresso">NT$ {avgOrderValue.toLocaleString()}</p>
              <p className="text-xs text-espresso-light/50 mt-1">平均客單價</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-linen/50">
              <p className="text-2xl font-bold text-rose">{repeatRate}%</p>
              <p className="text-xs text-espresso-light/50 mt-1">回購率（{repeatUsers}/{totalUsers} 人）</p>
            </div>
            {growth && (
              <>
                <div className="text-center p-3 rounded-lg bg-linen/50">
                  <p className={`text-2xl font-bold ${growth.orders >= 0 ? "text-sage" : "text-rose"}`}>
                    {growth.orders >= 0 ? "+" : ""}{growth.orders}%
                  </p>
                  <p className="text-xs text-espresso-light/50 mt-1">訂單成長率</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-linen/50">
                  <p className={`text-2xl font-bold ${growth.revenue >= 0 ? "text-sage" : "text-rose"}`}>
                    {growth.revenue >= 0 ? "+" : ""}{growth.revenue}%
                  </p>
                  <p className="text-xs text-espresso-light/50 mt-1">營收成長率</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── 地區分佈 ─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>郵寄地區分佈</h4>
          {cityEntries.length > 0 ? (
            <div className="space-y-2">
              {cityEntries.slice(0, 8).map(([city, count], i) => (
                <div key={city} className="flex items-center gap-3">
                  <span className="text-sm text-espresso w-16 shrink-0">{city}</span>
                  <div className="flex-1 h-2 rounded-full bg-linen-dark/30 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(count / maxCityCount) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-sm font-bold text-espresso tabular-nums w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-espresso-light/40">尚無郵寄訂單</p>
          )}
        </div>

        {/* ─── 品項營收排行 ─── */}
        <div className={cardClass}>
          <h4 className={titleClass}>品項營收排行</h4>
          <div className="space-y-2">
            {itemRevenue.map(([name, revenue], i) => {
              const maxRev = Math.max(...itemRevenue.map(([, r]) => r), 1);
              return (
                <div key={`${name}-${i}`} className="flex items-center gap-3">
                  <span className="text-xs text-espresso-light/40 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-espresso truncate">{name}</span>
                      <span className="text-sm font-bold text-honey tabular-nums shrink-0">NT$ {revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-linen-dark/30 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(revenue / maxRev) * 100}%`, background: "#c89530" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 歷次活動對比 ─── */}
        {campaignStats.length > 0 && (
          <div className={`${cardClass} md:col-span-2`}>
            <h4 className={titleClass}>歷次活動對比</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-linen-dark/40">
                    <th className="text-left py-2 text-espresso-light/50 font-medium">活動</th>
                    <th className="text-right py-2 text-espresso-light/50 font-medium">訂單數</th>
                    <th className="text-right py-2 text-espresso-light/50 font-medium">品項數</th>
                    <th className="text-right py-2 text-espresso-light/50 font-medium">總金額</th>
                    <th className="text-right py-2 text-espresso-light/50 font-medium">平均客單</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignStats.map((c) => (
                    <tr key={c.id} className="border-b border-linen-dark/20">
                      <td className="py-3 text-espresso font-medium">{c.name}</td>
                      <td className="py-3 text-right tabular-nums text-espresso">{c.orderCount}</td>
                      <td className="py-3 text-right tabular-nums text-espresso">{c.itemCount}</td>
                      <td className="py-3 text-right tabular-nums font-bold text-rose">NT$ {c.total.toLocaleString()}</td>
                      <td className="py-3 text-right tabular-nums text-espresso">NT$ {c.avg.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
