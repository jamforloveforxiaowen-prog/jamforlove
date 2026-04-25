"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MultiImageUploader from "@/components/MultiImageUploader";
import ImageUploader from "@/components/ImageUploader";
import { DEFAULT_SUPPORT_OPTIONS, discountToLabel, type SupportOption } from "@/lib/supportTypes";
import { parseBannerUrls, serializeBannerUrls } from "@/lib/bannerUrls";

/* ─── 型別 ─── */

interface LimitLog {
  id: number;
  delta: number;
  prevLimit: number | null;
  newLimit: number | null;
  note: string;
  createdAt: string;
}

interface ProductEntry {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  limit: number | null;
  sold?: number;
  limitHistory?: LimitLog[];
}

interface Campaign {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  bannerUrl: string;
  description: string;
  formStyle: string;
  supporterDiscount: number;
  supportOptions: SupportOption[];
  pickupOptions: string[];
  orderCount: number;
}

interface CampaignDetail extends Omit<Campaign, "orderCount" | "pickupOptions" | "supportOptions"> {
  description: string;
  pickupOptions: string;
  supporterDiscount: number;
  supportOptions: string;
  groups: { id?: number; name: string; description?: string; isRequired: boolean; products: { id?: number; name: string; description?: string; imageUrl?: string; price: number; limit: number | null; sold?: number; limitHistory?: LimitLog[] }[] }[];
  hasDraft?: boolean;
  diff?: DiffEntry[];
  previewToken?: string | null;
  publishedAt?: string | null;
}

interface DiffEntry {
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

const STATUS_LABELS: Record<string, string> = { draft: "草稿", active: "進行中", closed: "已結束" };
const STATUS_STYLES: Record<string, string> = {
  draft: "bg-espresso-light/10 text-espresso-light",
  active: "bg-sage/15 text-sage",
  closed: "bg-espresso-light/10 text-espresso-light/50",
};

const FORM_STYLES = [
  { id: "classic", name: "經典手感", desc: "虛線邊框、圓角、手寫風步驟" },
  { id: "minimal", name: "極簡白", desc: "大量留白、細線分隔" },
  { id: "warm", name: "暖陽雜貨", desc: "米色底、手繪風、膠帶裝飾" },
  { id: "elegant", name: "優雅花園", desc: "淡紫粉色系、花朵裝飾" },
  { id: "rustic", name: "鄉村木質", desc: "木紋底、深棕色調" },
  { id: "playful", name: "活潑糖果", desc: "圓潤色塊、彩色標籤" },
  { id: "modern", name: "現代都會", desc: "灰黑白、直角、無襯線" },
  { id: "vintage", name: "復古印刷", desc: "復古紙張、襯線字體" },
  { id: "nature", name: "自然草本", desc: "綠色系、葉片裝飾" },
  { id: "festival", name: "節慶喜氣", desc: "紅金配色、適合佳節" },
];

const DEFAULT_PICKUP = ["小川阿姨", "台大面交", "宜蘭面交"];

/* ─── 商品卡片元件 ─── */

function ProductCard({
  product,
  index,
  total,
  isFocused,
  onFocus,
  onUpdate,
  onRemove,
  onDuplicate,
  onMove,
  inputClass,
}: {
  product: ProductEntry;
  index: number;
  total: number;
  isFocused: boolean;
  onFocus: () => void;
  onUpdate: (field: keyof ProductEntry, value: unknown) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (to: number) => void;
  inputClass: string;
}) {
  const [addAmount, setAddAmount] = useState<string>("");

  function handleAdd() {
    const n = Number(addAmount);
    if (!Number.isFinite(n) || n <= 0) return;
    const base = product.limit ?? (product.sold ?? 0);
    onUpdate("limit", base + n);
    setAddAmount("");
  }

  return (
    <div
      className={`bg-white rounded-lg ring-1 transition-all duration-200 ${isFocused ? "ring-rose ring-2 shadow-md" : "ring-linen-dark/60"}`}
      style={isFocused ? { borderLeft: "4px solid var(--color-rose)" } : { borderLeft: "4px solid transparent" }}
      onClick={onFocus}
    >
      <div className="flex justify-center pt-2 pb-1 cursor-grab text-espresso-light/20 hover:text-espresso-light/40">
        <svg width="20" height="6" viewBox="0 0 20 6"><circle cx="4" cy="1" r="1" fill="currentColor" /><circle cx="10" cy="1" r="1" fill="currentColor" /><circle cx="16" cy="1" r="1" fill="currentColor" /><circle cx="4" cy="5" r="1" fill="currentColor" /><circle cx="10" cy="5" r="1" fill="currentColor" /><circle cx="16" cy="5" r="1" fill="currentColor" /></svg>
      </div>

      <div className="px-5 pb-2">
        <div className="flex items-start gap-3">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name || "商品圖"}
              width={56}
              height={56}
              className="rounded-md object-cover ring-1 ring-linen-dark/40 shrink-0"
              style={{ width: 56, height: 56 }}
            />
          )}
          <input
            value={product.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            className="flex-1 py-2 text-lg text-espresso bg-transparent outline-none placeholder:text-espresso-light/30"
            style={{ borderBottom: isFocused ? "2px solid var(--color-rose)" : "1px solid rgba(30,15,8,0.1)" }}
            placeholder={isFocused ? "輸入品名，例：香辣香菇醬" : "品名"}
            autoFocus={isFocused && !product.name}
          />
        </div>

        {isFocused && (
          <div className="mt-3 space-y-3 animate-[bakeSwing_0.3s_ease_both]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-sm text-espresso-light/50">NT$</span>
                <input type="number" value={product.price || ""} onChange={(e) => onUpdate("price", Number(e.target.value))} className="w-20 py-1 px-2 text-base text-espresso bg-linen rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose" placeholder="價格" min="0" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-espresso-light/50">總數</span>
                <input type="number" value={product.limit ?? ""} onChange={(e) => onUpdate("limit", e.target.value ? Number(e.target.value) : null)} className="w-20 py-1 px-2 text-base text-espresso bg-linen rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose" placeholder="不限" min="0" />
              </div>
              {(product.sold ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-espresso-light/50">已售</span>
                  <span className="font-semibold text-espresso">{product.sold}</span>
                  {product.limit != null && (
                    <>
                      <span className="text-espresso-light/40">/</span>
                      <span className="text-espresso-light/60">{product.limit}</span>
                      <span className="text-espresso-light/40">（剩 {Math.max(0, product.limit - (product.sold ?? 0))}）</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-espresso-light/50">再開放</span>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="w-20 py-1 px-2 text-base text-espresso bg-linen rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose"
                placeholder="N"
                min="1"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!addAmount || Number(addAmount) <= 0}
                className="px-3 py-1 text-sm font-medium rounded-md bg-rose text-white hover:bg-rose/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                追加
              </button>
              {addAmount && Number(addAmount) > 0 && (
                <span className="text-xs text-espresso-light/50">
                  → 總數會變成 {(product.limit ?? (product.sold ?? 0)) + Number(addAmount)}
                </span>
              )}
            </div>
            {product.limit != null && (product.sold ?? 0) > product.limit && (
              <div className="text-xs text-rose bg-rose/5 border border-rose/20 rounded-md px-3 py-2">
                ⚠ 總數 {product.limit} 比已售 {product.sold} 還少，前端會顯示「已售完」。建議用「再開放」追加，或直接調高總數（≥ {product.sold}）。
              </div>
            )}
            {(product.limitHistory?.length ?? 0) > 0 && (
              <details className="rounded-md bg-linen/40 ring-1 ring-linen-dark/30">
                <summary className="cursor-pointer px-3 py-2 text-xs text-espresso-light/60 hover:text-espresso select-none">
                  編輯記錄（{product.limitHistory!.length} 筆）
                </summary>
                <ul className="px-3 pb-2 space-y-1 text-xs text-espresso-light/70">
                  {product.limitHistory!.map((log) => {
                    const sign = log.delta > 0 ? "+" : "";
                    const date = log.createdAt.replace("T", " ").slice(0, 16);
                    return (
                      <li key={log.id} className="flex items-baseline gap-2">
                        <span className="text-espresso-light/40 text-[11px] tabular-nums">
                          {date}
                        </span>
                        <span
                          className={
                            log.delta > 0
                              ? "font-semibold text-sage"
                              : log.delta < 0
                              ? "font-semibold text-rose"
                              : "font-semibold"
                          }
                        >
                          {sign}
                          {log.delta}
                        </span>
                        <span className="text-espresso-light/50">
                          （{log.prevLimit ?? "不限"} → {log.newLimit ?? "不限"}）
                        </span>
                        {log.note && (
                          <span className="text-espresso-light/40">
                            · {log.note}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
            <textarea
              value={product.description || ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              className="w-full py-2 px-3 text-base text-espresso bg-linen rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose min-h-[64px] leading-relaxed"
              placeholder="商品說明（選填，例：香辣香菇醬 + 馬告菜圃醬 + 手工皂）"
            />
            <ImageUploader
              value={product.imageUrl || ""}
              onChange={(url) => onUpdate("imageUrl", url)}
              label="商品圖片（選填）"
              previewWidth={80}
              previewHeight={80}
            />
          </div>
        )}

        {!isFocused && product.name && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-3 text-sm text-espresso-light/40 flex-wrap">
              <span>NT$ {product.price}</span>
              {(product.sold ?? 0) > 0 && product.limit != null ? (
                <span className={product.sold! > product.limit ? "text-rose font-semibold" : ""}>
                  · 已售 {product.sold} / 總數 {product.limit}
                </span>
              ) : (product.sold ?? 0) > 0 ? (
                <span>· 已售 {product.sold}（總數不限）</span>
              ) : product.limit != null ? (
                <span>· 總數 {product.limit}</span>
              ) : null}
            </div>
            {product.description && (
              <p className="text-sm text-espresso-light/50 line-clamp-2">{product.description}</p>
            )}
          </div>
        )}
      </div>

      {isFocused && (
        <div className="flex items-center justify-end gap-1 px-4 py-2 border-t border-linen-dark/20 animate-[bakeSwing_0.3s_ease_both]">
          <button type="button" onClick={(e) => { e.stopPropagation(); onMove(index - 1); }} disabled={index === 0} className="p-1.5 rounded-md text-espresso-light/40 hover:text-espresso hover:bg-linen disabled:opacity-20 transition-all" title="上移">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMove(index + 1); }} disabled={index === total - 1} className="p-1.5 rounded-md text-espresso-light/40 hover:text-espresso hover:bg-linen disabled:opacity-20 transition-all" title="下移">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </button>
          <div className="w-px h-5 bg-linen-dark/30 mx-1" />
          <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 rounded-md text-espresso-light/40 hover:text-espresso hover:bg-linen transition-all" title="複製">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} disabled={total <= 1} className="p-1.5 rounded-md text-espresso-light/40 hover:text-rose hover:bg-rose/5 disabled:opacity-20 transition-all" title="刪除">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 主元件 ─── */

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [focusedProduct, setFocusedProduct] = useState<number | null>(null);
  const [focusedAddon, setFocusedAddon] = useState<number | null>(null);

  // 表單欄位
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [formStyle, setFormStyle] = useState("classic");
  const [supporterDiscount, setSupporterDiscount] = useState(0);
  const [supportOptions, setSupportOptions] = useState<SupportOption[]>([]);
  const [pickupOptions, setPickupOptions] = useState<string[]>([...DEFAULT_PICKUP]);
  const [newPickup, setNewPickup] = useState("");
  const [products, setProducts] = useState<ProductEntry[]>([{ name: "", description: "", imageUrl: "", price: 0, limit: null }]);
  const [addons, setAddons] = useState<ProductEntry[]>([]);

  // 草稿狀態（編輯中活動的）
  const [hasDraft, setHasDraft] = useState(false);
  const [diff, setDiff] = useState<DiffEntry[]>([]);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copyHint, setCopyHint] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string>("draft");

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (Array.isArray(data)) setCampaigns(data.map((c: Record<string, unknown>) => ({
        ...c,
        pickupOptions: typeof c.pickupOptions === "string" ? JSON.parse(c.pickupOptions as string) : c.pickupOptions || [],
        supportOptions: typeof c.supportOptions === "string" ? JSON.parse(c.supportOptions as string) : c.supportOptions || [],
      })) as Campaign[]);
    } catch { setError("無法載入"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCampaigns(); }, []);

  function resetForm() {
    setName(""); setStartDate(""); setEndDate(""); setStartTime("00:00"); setEndTime("23:59"); setBannerUrls([]); setDescription("");
    setFormStyle("classic"); setSupporterDiscount(0); setSupportOptions([]); setPickupOptions([...DEFAULT_PICKUP]); setNewPickup("");
    setProducts([{ name: "", description: "", imageUrl: "", price: 0, limit: null }]);
    setAddons([]);
    setEditingId(null); setShowForm(false); setError(""); setFocusedProduct(null); setFocusedAddon(null);
    setHasDraft(false); setDiff([]); setPreviewToken(null); setPublishedAt(null); setEditingStatus("draft");
  }

  async function refreshEditDetail(id: number) {
    const res = await fetch(`/api/admin/campaigns/${id}`);
    const data: CampaignDetail = await res.json();
    setHasDraft(!!data.hasDraft);
    setDiff(data.diff || []);
    setPreviewToken(data.previewToken || null);
    setPublishedAt(data.publishedAt || null);
    setEditingStatus(data.status || "draft");
    return data;
  }

  async function publishDraft() {
    if (!editingId) return;
    const msg = hasDraft
      ? "確定要發佈嗎？發佈後消費者看到的就是目前的草稿內容，並會把表單上線到網站。"
      : editingStatus === "active"
        ? "目前已發佈中且沒有草稿變更，不需要重新發佈。"
        : "確定要把此表單發佈到網站嗎？消費者就會在 /order 看到。";
    if (editingStatus === "active" && !hasDraft) {
      window.alert(msg);
      return;
    }
    if (!window.confirm(msg)) return;
    setPublishing(true);
    try {
      // 1) 套用草稿（如果有）
      if (hasDraft) {
        const res = await fetch(`/api/admin/campaigns/${editingId}/publish`, { method: "POST" });
        const result = await res.json();
        if (!res.ok) { setError(result.error || "發佈失敗"); return; }
      }
      // 2) 設 status=active 上架到網站
      if (editingStatus !== "active") {
        await fetch(`/api/admin/campaigns/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        });
      }
      await refreshEditDetail(editingId);
      loadCampaigns();
    } catch { setError("網路連線失敗"); }
    finally { setPublishing(false); }
  }

  async function pausePublish() {
    if (!editingId) return;
    if (!window.confirm("暫停發佈後，此表單會從網站撤下，消費者就看不到了。\n\n之後仍可從後台再次發佈。確定要暫停嗎？")) return;
    setPublishing(true);
    try {
      await fetch(`/api/admin/campaigns/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      await refreshEditDetail(editingId);
      loadCampaigns();
    } catch { setError("網路連線失敗"); }
    finally { setPublishing(false); }
  }

  async function discardDraft() {
    if (!editingId) return;
    if (!window.confirm("捨棄目前的草稿變更，回到上次發佈的版本？")) return;
    try {
      await fetch(`/api/admin/campaigns/${editingId}/publish`, { method: "DELETE" });
      const data = await refreshEditDetail(editingId);
      loadGroupsFromDetail(data);
    } catch { setError("網路連線失敗"); }
  }

  async function copyPreviewLink() {
    if (!previewToken) return;
    const url = `${window.location.origin}/order?previewToken=${encodeURIComponent(previewToken)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyHint(true);
      setTimeout(() => setCopyHint(false), 1500);
    } catch {
      window.prompt("複製此預覽連結：", url);
    }
  }

  function loadGroupsFromDetail(data: CampaignDetail) {
    const groups = data.groups || [];
    const mainGroup = groups.find((g) => g.isRequired !== false) || groups[0];
    const addonGroup = groups.find((g) => g.isRequired === false);

    const rawMain = mainGroup?.products || [];
    const rawAddons = addonGroup?.products || [];

    setProducts(rawMain.length > 0
      ? rawMain.map((p) => ({ id: p.id, name: p.name, description: p.description || "", imageUrl: p.imageUrl || "", price: p.price, limit: p.limit, sold: p.sold ?? 0, limitHistory: p.limitHistory || [] }))
      : [{ name: "", description: "", imageUrl: "", price: 0, limit: null }]);

    setAddons(rawAddons.map((p) => ({ id: p.id, name: p.name, description: p.description || "", imageUrl: p.imageUrl || "", price: p.price, limit: p.limit, sold: p.sold ?? 0, limitHistory: p.limitHistory || [] })));
  }

  async function startEdit(id: number) {
    setError("");
    const res = await fetch(`/api/admin/campaigns/${id}`);
    const data: CampaignDetail = await res.json();
    setName(data.name); setStartDate(data.startDate); setEndDate(data.endDate);
    setStartTime((data.startTime || "00:00").slice(0, 5));
    setEndTime((data.endTime || "23:59").slice(0, 5));
    setBannerUrls(parseBannerUrls(data.bannerUrl)); setDescription(data.description || ""); setFormStyle(data.formStyle || "classic");
    setSupporterDiscount(data.supporterDiscount || 0);
    const sOpts = typeof data.supportOptions === "string" ? JSON.parse(data.supportOptions) : data.supportOptions;
    setSupportOptions(Array.isArray(sOpts) && sOpts.length > 0 ? sOpts : []);
    const opts = typeof data.pickupOptions === "string" ? JSON.parse(data.pickupOptions) : data.pickupOptions;
    setPickupOptions(Array.isArray(opts) && opts.length > 0 ? opts : [...DEFAULT_PICKUP]);
    loadGroupsFromDetail(data);
    setHasDraft(!!data.hasDraft);
    setDiff(data.diff || []);
    setPreviewToken(data.previewToken || null);
    setPublishedAt(data.publishedAt || null);
    setEditingStatus(data.status || "draft");
    setEditingId(id); setShowForm(true);
  }

  async function saveCampaign(openPreview: boolean) {
    if (!name || !startDate || !endDate) { setError("請填寫表單名稱和日期"); return; }
    const validProducts = products.filter((p) => p.name.trim());
    if (validProducts.length === 0) { setError("請至少新增一項商品"); return; }

    const validAddons = addons.filter((p) => p.name.trim());

    // 防呆：總數比已售還少的商品
    const oversold = [...validProducts, ...validAddons].filter(
      (p) => p.limit != null && (p.sold ?? 0) > p.limit
    );
    if (oversold.length > 0) {
      const list = oversold
        .map((p) => `・${p.name}：總數 ${p.limit} < 已售 ${p.sold}`)
        .join("\n");
      const ok = window.confirm(
        `以下商品的「總數」設得比「已售」還少，前端會顯示「已售完」：\n\n${list}\n\n仍要儲存嗎？`
      );
      if (!ok) return;
    }

    setSubmitting(true); setError("");

    const groups: Array<{
      name: string; description: string; sortOrder: number; isRequired: boolean;
      products: Array<{ id?: number; name: string; description: string; imageUrl: string; price: number; limit: number | null; unit: string; sortOrder: number; note: string; isActive: boolean }>;
    }> = [
      {
        name: "商品", description: "", sortOrder: 0, isRequired: true,
        products: validProducts.map((p, i) => ({ id: p.id, name: p.name, description: p.description || "", imageUrl: p.imageUrl || "", price: p.price, limit: p.limit, unit: "份", sortOrder: i, note: "", isActive: true })),
      },
    ];

    if (validAddons.length > 0) {
      groups.push({
        name: "加購商品", description: "", sortOrder: 1, isRequired: false,
        products: validAddons.map((p, i) => ({ id: p.id, name: p.name, description: p.description || "", imageUrl: p.imageUrl || "", price: p.price, limit: p.limit, unit: "份", sortOrder: i, note: "", isActive: true })),
      });
    }

    const payload = {
      name, startDate, endDate,
      startTime, endTime,
      bannerUrl: serializeBannerUrls(bannerUrls),
      description,
      formStyle,
      supporterDiscount: supportOptions.length > 0 ? 1 : 0,
      supportOptions: JSON.stringify(supportOptions),
      pickupOptions: JSON.stringify(pickupOptions),
      groups,
    };

    try {
      const url = editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "儲存失敗"); setSubmitting(false); return; }

      setSubmitting(false);
      const savedId = editingId || result.id;
      // 編輯既有活動：保留表單開啟，更新草稿狀態（顯示變更摘要）
      // 新建活動：關閉表單回列表
      if (editingId) {
        await refreshEditDetail(editingId);
        loadCampaigns();
        if (openPreview) setPreviewId(editingId);
      } else {
        resetForm();
        loadCampaigns();
        if (openPreview && savedId) setPreviewId(savedId);
      }
    } catch { setError("網路連線失敗"); setSubmitting(false); }
  }

  async function toggleStatus(c: Campaign) {
    const next = c.status === "draft" ? "active" : c.status === "active" ? "closed" : "draft";
    if (!window.confirm(`確定要將「${c.name}」設為「${STATUS_LABELS[next]}」嗎？`)) return;
    await fetch(`/api/admin/campaigns/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    loadCampaigns();
  }

  async function handleDelete(c: Campaign) {
    if (c.orderCount > 0) { alert("此表單已有訂單，無法刪除"); return; }
    if (!window.confirm(`確定要刪除「${c.name}」嗎？`)) return;
    await fetch(`/api/admin/campaigns/${c.id}`, { method: "DELETE" });
    loadCampaigns();
  }

  async function duplicateCampaign(c: Campaign) {
    const res = await fetch(`/api/admin/campaigns/${c.id}`);
    const data: CampaignDetail = await res.json();
    setName(data.name + "（複製）"); setStartDate(""); setEndDate("");
    setStartTime((data.startTime || "00:00").slice(0, 5));
    setEndTime((data.endTime || "23:59").slice(0, 5));
    setBannerUrls(parseBannerUrls(data.bannerUrl)); setDescription(data.description || ""); setFormStyle(data.formStyle || "classic");
    setSupporterDiscount(data.supporterDiscount || 0);
    const sOpts = typeof data.supportOptions === "string" ? JSON.parse(data.supportOptions) : data.supportOptions;
    setSupportOptions(Array.isArray(sOpts) ? sOpts : []);
    const opts = typeof data.pickupOptions === "string" ? JSON.parse(data.pickupOptions) : data.pickupOptions;
    setPickupOptions(Array.isArray(opts) ? opts : [...DEFAULT_PICKUP]);
    loadGroupsFromDetail(data);
    setEditingId(null); setShowForm(true);
  }

  // 品項操作（共用）
  function updateItem(setter: React.Dispatch<React.SetStateAction<ProductEntry[]>>, i: number, field: keyof ProductEntry, value: unknown) {
    setter((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }
  function addItem(setter: React.Dispatch<React.SetStateAction<ProductEntry[]>>, items: ProductEntry[], focusSetter: React.Dispatch<React.SetStateAction<number | null>>) {
    setter((prev) => [...prev, { name: "", description: "", imageUrl: "", price: 0, limit: null }]);
    setTimeout(() => focusSetter(items.length), 50);
  }
  function removeItem(setter: React.Dispatch<React.SetStateAction<ProductEntry[]>>, items: ProductEntry[], i: number, focusSetter: React.Dispatch<React.SetStateAction<number | null>>) {
    if (items.length <= 1) return;
    setter((prev) => prev.filter((_, idx) => idx !== i));
    focusSetter(null);
  }
  function duplicateItem(setter: React.Dispatch<React.SetStateAction<ProductEntry[]>>, i: number) {
    setter((prev) => [...prev.slice(0, i + 1), { ...prev[i] }, ...prev.slice(i + 1)]);
  }
  function moveItem(setter: React.Dispatch<React.SetStateAction<ProductEntry[]>>, items: ProductEntry[], from: number, to: number, focusSetter: React.Dispatch<React.SetStateAction<number | null>>) {
    if (to < 0 || to >= items.length) return;
    setter((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    focusSetter(to);
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  const inputClass = "w-full px-3 py-2 rounded-md text-lg text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none";

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4">{error}</p>}

      <div className="flex items-center justify-end mb-6">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary-sm">+ 建立表單</button>
      </div>

      {/* ═══ 預覽 Modal ═══ */}
      {previewId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-linen-dark/30 px-6 py-3 flex items-center justify-between z-10">
              <span className="font-serif font-bold text-espresso">預覽表單{hasDraft ? "（含未發佈草稿）" : ""}</span>
              <button onClick={() => setPreviewId(null)} className="px-4 py-1.5 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all">關閉</button>
            </div>
            <iframe src={`/order?preview=${previewId}`} className="w-full border-0" style={{ height: "80vh" }} />
          </div>
        </div>
      )}

      {/* ═══ 編輯表單 ═══ */}
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveCampaign(false); }} className="mb-8 space-y-4">
          <h3 className="font-serif font-bold text-espresso text-lg">{editingId ? "編輯表單" : "建立預購表單"}</h3>

          {/* 基本資訊卡片 */}
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">表單名稱 *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="例：2026 母親節預購" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">開始日期 / 時間 *</label>
                <div className="flex gap-2">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${inputClass} flex-1`} required />
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${inputClass} w-28`} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">結束日期 / 時間 *</label>
                <div className="flex gap-2">
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`${inputClass} flex-1`} required />
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${inputClass} w-28`} required />
                </div>
              </div>
            </div>
            <p className="text-xs text-espresso-light/50 -mt-2">
              預設整天開放（00:00 ～ 23:59）。表單只在「開放時間 ～ 結束時間」之間會顯示在網站上。
            </p>
            {/* 支持者折扣選項 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-espresso">支持者折扣選項</label>
                {supportOptions.length === 0 ? (
                  <button type="button" onClick={() => setSupportOptions([...DEFAULT_SUPPORT_OPTIONS])}
                    className="text-xs px-3 py-1 rounded-md bg-sage/10 ring-1 ring-sage/30 text-sage font-medium hover:bg-sage/20 transition-all">
                    + 啟用折扣選項
                  </button>
                ) : (
                  <button type="button" onClick={() => { if (window.confirm("確定要移除所有折扣選項嗎？")) setSupportOptions([]); }}
                    className="text-xs px-3 py-1 rounded-md ring-1 ring-rose/30 text-rose/60 hover:text-rose hover:ring-rose transition-all">
                    移除全部
                  </button>
                )}
              </div>
              {supportOptions.length > 0 && (
                <div className="space-y-2">
                  {supportOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 bg-linen/50 rounded-lg p-3 ring-1 ring-linen-dark/40">
                      <input
                        value={opt.label}
                        onChange={(e) => setSupportOptions((prev) => prev.map((o, idx) => idx === i ? { ...o, label: e.target.value } : o))}
                        className="flex-1 px-2 py-1.5 text-sm text-espresso bg-white rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose"
                        placeholder="選項文字"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          value={opt.discount}
                          onChange={(e) => setSupportOptions((prev) => prev.map((o, idx) => idx === i ? { ...o, discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)) } : o))}
                          className="w-16 px-2 py-1.5 text-sm text-espresso bg-white rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose text-center"
                          min="0" max="100"
                        />
                        <span className="text-xs text-espresso-light/50 w-10">
                          {opt.discount > 0 ? discountToLabel(opt.discount) : "無折扣"}
                        </span>
                      </div>
                      <button type="button" onClick={() => setSupportOptions((prev) => prev.filter((_, idx) => idx !== i))}
                        className="px-2 py-1 rounded-md text-xs text-rose/50 ring-1 ring-rose/20 hover:text-rose hover:ring-rose hover:bg-rose/5 transition-all shrink-0">
                        刪除
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setSupportOptions((prev) => [...prev, { label: "", discount: 0 }])}
                    className="w-full py-2 text-sm text-espresso-light/40 hover:text-rose ring-1 ring-dashed ring-linen-dark/30 rounded-lg hover:ring-rose/40 transition-all">
                    + 新增選項
                  </button>
                </div>
              )}
              {supportOptions.length === 0 && (
                <p className="text-xs text-espresso-light/40">未啟用 — 點擊上方按鈕可新增預設折扣選項</p>
              )}
            </div>
            <MultiImageUploader value={bannerUrls} onChange={setBannerUrls} label="活動說明圖（選填，最多 5 張）" maxImages={5} previewWidth={120} previewHeight={80} />
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">活動文字說明（選填）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} min-h-[120px] leading-relaxed`}
                placeholder="例：今年是 Jam for Love 十周年，邀請您一起延續愛與甜的故事…（可換行）"
              />
              <p className="text-xs text-espresso-light/40 mt-1">會顯示在訂購表單的活動說明圖下方</p>
            </div>
          </div>

          {/* ═══ 商品列表 ═══ */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-espresso text-base">商品</h4>
            {products.map((p, i) => (
              <ProductCard
                key={i}
                product={p}
                index={i}
                total={products.length}
                isFocused={focusedProduct === i}
                onFocus={() => { setFocusedProduct(i); setFocusedAddon(null); }}
                onUpdate={(field, value) => updateItem(setProducts, i, field, value)}
                onRemove={() => removeItem(setProducts, products, i, setFocusedProduct)}
                onDuplicate={() => duplicateItem(setProducts, i)}
                onMove={(to) => moveItem(setProducts, products, i, to, setFocusedProduct)}
                inputClass={inputClass}
              />
            ))}
            <button
              type="button"
              onClick={() => addItem(setProducts, products, setFocusedProduct)}
              className="w-full py-3 bg-white rounded-lg ring-1 ring-dashed ring-linen-dark/40 text-espresso-light/50 hover:text-rose hover:ring-rose/40 transition-all flex items-center justify-center gap-2 text-base"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
              新增商品
            </button>
          </div>

          {/* ═══ 加購商品列表 ═══ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-espresso text-base">加購商品（選填）</h4>
              {addons.length === 0 && (
                <button
                  type="button"
                  onClick={() => { setAddons([{ name: "", description: "", imageUrl: "", price: 0, limit: null }]); setTimeout(() => setFocusedAddon(0), 50); }}
                  className="text-xs px-3 py-1 rounded-md bg-honey/10 ring-1 ring-honey/30 text-honey font-medium hover:bg-honey/20 transition-all"
                >
                  + 新增加購區
                </button>
              )}
            </div>
            {addons.length === 0 && (
              <p className="text-xs text-espresso-light/40">未設定加購商品 — 消費者只會看到主要商品</p>
            )}
            {addons.map((p, i) => (
              <ProductCard
                key={i}
                product={p}
                index={i}
                total={addons.length}
                isFocused={focusedAddon === i}
                onFocus={() => { setFocusedAddon(i); setFocusedProduct(null); }}
                onUpdate={(field, value) => updateItem(setAddons, i, field, value)}
                onRemove={() => {
                  if (addons.length <= 1) { setAddons([]); setFocusedAddon(null); return; }
                  removeItem(setAddons, addons, i, setFocusedAddon);
                }}
                onDuplicate={() => duplicateItem(setAddons, i)}
                onMove={(to) => moveItem(setAddons, addons, i, to, setFocusedAddon)}
                inputClass={inputClass}
              />
            ))}
            {addons.length > 0 && (
              <button
                type="button"
                onClick={() => addItem(setAddons, addons, setFocusedAddon)}
                className="w-full py-3 bg-white rounded-lg ring-1 ring-dashed ring-honey/40 text-espresso-light/50 hover:text-honey hover:ring-honey/60 transition-all flex items-center justify-center gap-2 text-base"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
                新增加購商品
              </button>
            )}
          </div>

          {/* 面交選項 */}
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
            <p className="text-sm font-medium text-espresso mb-3">取貨選項（消費者下拉選擇）</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {pickupOptions.map((opt, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-linen ring-1 ring-linen-dark/40 text-espresso">
                  {opt}
                  <button type="button" onClick={() => setPickupOptions((prev) => prev.filter((_, idx) => idx !== i))} className="text-rose/40 hover:text-rose">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newPickup} onChange={(e) => setNewPickup(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = newPickup.trim(); if (v && !pickupOptions.includes(v)) { setPickupOptions((p) => [...p, v]); setNewPickup(""); } } }}
                className={`${inputClass} flex-1`} placeholder="新增選項，例：5/19（四）校內取貨" />
              <button type="button" onClick={() => { const v = newPickup.trim(); if (v && !pickupOptions.includes(v)) { setPickupOptions((p) => [...p, v]); setNewPickup(""); } }}
                className="px-4 py-2 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all shrink-0">新增</button>
            </div>
          </div>

          {/* 表單風格 */}
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
            <p className="text-sm font-medium text-espresso mb-3">表單風格</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {FORM_STYLES.map((s) => (
                <button key={s.id} type="button" onClick={() => setFormStyle(s.id)}
                  className={`p-3 rounded-lg text-left transition-all ${formStyle === s.id ? "bg-rose/5 ring-2 ring-rose" : "bg-linen/50 ring-1 ring-linen-dark/40 hover:ring-espresso-light/40"}`}>
                  <p className="text-sm font-bold text-espresso">{s.name}</p>
                  <p className="text-[0.65rem] text-espresso-light/50 mt-0.5 leading-tight">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 變更摘要（編輯既有活動，且有未發佈草稿時顯示）*/}
          {editingId && hasDraft && diff.length > 0 && (
            <div className="bg-honey/5 ring-1 ring-honey/30 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-serif font-bold text-espresso text-base flex items-center gap-2">
                  ⚠️ 待發佈變更摘要 <span className="text-xs font-normal text-espresso-light/60">(共 {diff.length} 項)</span>
                </h4>
                <span className="text-xs text-espresso-light/50">
                  {publishedAt ? `上次發佈：${publishedAt}` : "尚未發佈過"}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm">
                {diff.map((d, i) => {
                  const dot =
                    d.type === "add" ? "🟢" :
                    d.type === "remove" ? "🔴" :
                    d.type === "rename" ? "🟡" :
                    d.type === "price" ? "💰" :
                    d.type === "limit" ? "📦" : "・";
                  let text = "";
                  if (d.type === "add") text = `新增商品「${d.afterName}」（NT$${d.afterPrice}，無歷史銷售）`;
                  else if (d.type === "remove") text = `下架商品「${d.beforeName}」（保留 ${d.sold ?? 0} 筆歷史銷售，後台排行榜會消失）`;
                  else if (d.type === "rename") text = `改名：「${d.beforeName}」→「${d.afterName}」（保留 ${d.sold ?? 0} 筆歷史銷售）`;
                  else if (d.type === "price") text = `「${d.afterName}」金額：NT$${d.beforePrice} → NT$${d.afterPrice}`;
                  else if (d.type === "limit") text = `「${d.afterName}」總數：${d.beforeLimit ?? "不限"} → ${d.afterLimit ?? "不限"}`;
                  return <li key={i} className="text-espresso-light"><span className="mr-1.5">{dot}</span>{text}</li>;
                })}
              </ul>
              <div className="text-xs text-espresso-light/50 leading-relaxed pt-2 border-t border-honey/20">
                💡 <strong>下架</strong>會讓商品在訂單頁消失，但歷史銷售數仍記在原 ID 上、後台排行榜不再顯示。<strong>改名</strong>則保留同一個商品，銷售統計延續。
              </div>
            </div>
          )}

          {/* 預覽連結（有 token 時顯示）*/}
          {editingId && previewToken && (
            <div className="bg-sage/5 ring-1 ring-sage/30 rounded-lg p-4 space-y-2">
              <h4 className="font-serif font-bold text-espresso text-sm">分享預覽連結</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/order?previewToken=${previewToken}`}
                  className="flex-1 min-w-[260px] px-3 py-2 rounded-md text-sm text-espresso-light bg-white ring-1 ring-linen-dark/60 font-mono"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button type="button" onClick={copyPreviewLink} className="px-4 py-2 rounded-md text-sm font-medium bg-sage text-white hover:bg-sage/80 transition-colors whitespace-nowrap">
                  {copyHint ? "✓ 已複製" : "複製連結"}
                </button>
              </div>
              <p className="text-xs text-espresso-light/50">
                此連結反映目前儲存的草稿內容，可傳給夥伴確認。發佈後仍可使用，會切回最新發佈版本。
              </p>
            </div>
          )}

          {/* 送出 */}
          <div className="flex gap-3 flex-wrap items-center">
            {editingId && (
              <button type="button" disabled={submitting || publishing} onClick={() => saveCampaign(true)} className="btn-primary-sm">
                預覽
              </button>
            )}
            <button type="submit" disabled={submitting || publishing} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "儲存草稿" : "儲存"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">取消</button>
            {editingId && (
              <>
                <div className="w-px h-7 bg-linen-dark/40 mx-1" />
                <span className="text-xs text-espresso-light/50">
                  {editingStatus === "active" ? "目前狀態：發佈中" : editingStatus === "closed" ? "目前狀態：已結束" : "目前狀態：未發佈"}
                </span>
                <button
                  type="button"
                  onClick={pausePublish}
                  disabled={submitting || publishing || editingStatus !== "active"}
                  className="px-4 py-2 rounded-md text-sm font-bold bg-honey/15 text-espresso ring-1 ring-honey/40 hover:bg-honey/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={editingStatus === "active" ? "從網站撤下此表單" : "目前未發佈，無需暫停"}
                >
                  {publishing ? "處理中..." : "⏸ 暫停表單發佈"}
                </button>
                <button
                  type="button"
                  onClick={publishDraft}
                  disabled={
                    submitting ||
                    publishing ||
                    (editingStatus === "active" && !hasDraft)
                  }
                  className="px-4 py-2 rounded-md text-sm font-bold bg-rose text-white hover:bg-rose/80 transition-colors disabled:bg-espresso-light/20 disabled:text-espresso-light/40 disabled:cursor-not-allowed"
                  title={
                    editingStatus === "active" && !hasDraft
                      ? "目前已發佈且沒有草稿變更"
                      : hasDraft
                        ? "套用草稿並發佈到網站"
                        : "把表單發佈到網站"
                  }
                >
                  {publishing
                    ? "發佈中..."
                    : editingStatus === "active" && !hasDraft
                      ? "已發佈"
                      : "🚀 發佈"}
                </button>
                {hasDraft && (
                  <button type="button" onClick={discardDraft} disabled={submitting || publishing} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-rose/30 text-rose/80 hover:text-rose hover:ring-rose transition-all">
                    捨棄草稿
                  </button>
                )}
              </>
            )}
            {!editingId && (
              <button type="button" disabled={submitting} onClick={() => saveCampaign(true)} className="btn-primary-sm">
                預覽
              </button>
            )}
          </div>
        </form>
      )}

      {/* ═══ 表單列表 ═══ */}
      {campaigns.length === 0 && !showForm ? (
        <div className="text-center py-24">
          <p className="text-espresso-light/50 text-sm">尚無預購表單，點擊上方按鈕建立</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.filter((c) => c.id !== editingId).map((c) => {
            const thumbUrls = parseBannerUrls(c.bannerUrl);
            return (
              <div key={c.id} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-serif font-bold text-espresso text-base">{c.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${STATUS_STYLES[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </div>
                    <p className="text-espresso-light/50 text-sm">
                      {c.startDate} {(c.startTime || "00:00").slice(0, 5)} ~ {c.endDate} {(c.endTime || "23:59").slice(0, 5)} · {c.orderCount} 筆訂單
                    </p>
                  </div>
                  {thumbUrls.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {thumbUrls.slice(0, 3).map((url, i) => (
                        <Image key={i} src={url} alt="" width={50} height={35} className="rounded-md object-cover" />
                      ))}
                      {thumbUrls.length > 3 && (
                        <span className="text-xs text-espresso-light/40 self-center">+{thumbUrls.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px dashed rgba(30,15,8,0.06)" }}>
                  <button onClick={() => setPreviewId(c.id)} className="text-xs px-4 py-1.5 rounded-md bg-sage/10 ring-1 ring-sage/30 text-sage font-medium hover:bg-sage/20 hover:ring-sage transition-all">
                    預覽
                  </button>
                  <button onClick={() => startEdit(c.id)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">編輯</button>
                  <button onClick={() => toggleStatus(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">
                    {c.status === "draft" ? "發佈" : c.status === "active" ? "結束" : "重新開放"}
                  </button>
                  {c.status !== "draft" && (
                    <button onClick={async () => {
                      if (!window.confirm(`確定要隱藏「${c.name}」嗎？消費者將看不到此表單。`)) return;
                      await fetch(`/api/admin/campaigns/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "draft" }) });
                      loadCampaigns();
                    }} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-espresso-light/20 text-espresso-light/50 hover:text-espresso hover:ring-espresso-light transition-all">隱藏</button>
                  )}
                  <button onClick={() => duplicateCampaign(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">複製</button>
                  <button onClick={() => handleDelete(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-rose/30 text-rose/60 hover:text-rose hover:ring-rose transition-all">刪除</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
