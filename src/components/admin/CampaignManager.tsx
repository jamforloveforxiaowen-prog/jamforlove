"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

/* ─── 型別 ─── */

interface ProductEntry {
  name: string;
  price: number;
  limit: number | null;
}

interface Campaign {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  formStyle: string;
  supporterDiscount: number;
  pickupOptions: string[];
  orderCount: number;
}

interface CampaignDetail extends Omit<Campaign, "orderCount" | "pickupOptions"> {
  pickupOptions: string;
  supporterDiscount: number;
  groups: { products: { name: string; price: number; limit: number | null }[] }[];
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

/* ─── 元件 ─── */

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [focusedProduct, setFocusedProduct] = useState<number | null>(null);

  // 表單欄位
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [formStyle, setFormStyle] = useState("classic");
  const [supporterDiscount, setSupporterDiscount] = useState(0);
  const [pickupOptions, setPickupOptions] = useState<string[]>([...DEFAULT_PICKUP]);
  const [newPickup, setNewPickup] = useState("");
  const [products, setProducts] = useState<ProductEntry[]>([{ name: "", price: 0, limit: null }]);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (Array.isArray(data)) setCampaigns(data.map((c: Record<string, unknown>) => ({
        ...c,
        pickupOptions: typeof c.pickupOptions === "string" ? JSON.parse(c.pickupOptions as string) : c.pickupOptions || [],
      })) as Campaign[]);
    } catch { setError("無法載入"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCampaigns(); }, []);

  function resetForm() {
    setName(""); setStartDate(""); setEndDate(""); setBannerUrl("");
    setFormStyle("classic"); setSupporterDiscount(0); setPickupOptions([...DEFAULT_PICKUP]); setNewPickup("");
    setProducts([{ name: "", price: 0, limit: null }]);
    setEditingId(null); setShowForm(false); setError(""); setFocusedProduct(null);
  }

  async function startEdit(id: number) {
    setError("");
    const res = await fetch(`/api/admin/campaigns/${id}`);
    const data: CampaignDetail = await res.json();
    setName(data.name); setStartDate(data.startDate); setEndDate(data.endDate);
    setBannerUrl(data.bannerUrl || ""); setFormStyle(data.formStyle || "classic");
    setSupporterDiscount(data.supporterDiscount || 0);
    const opts = typeof data.pickupOptions === "string" ? JSON.parse(data.pickupOptions) : data.pickupOptions;
    setPickupOptions(Array.isArray(opts) && opts.length > 0 ? opts : [...DEFAULT_PICKUP]);
    const prods = data.groups?.[0]?.products || [];
    setProducts(prods.length > 0
      ? prods.map((p) => ({ name: p.name, price: p.price, limit: p.limit }))
      : [{ name: "", price: 0, limit: null }]);
    setEditingId(id); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !startDate || !endDate) { setError("請填寫表單名稱和日期"); return; }
    const validProducts = products.filter((p) => p.name.trim());
    if (validProducts.length === 0) { setError("請至少新增一項商品"); return; }
    setSubmitting(true); setError("");

    const payload = {
      name, startDate, endDate, bannerUrl, formStyle, supporterDiscount,
      pickupOptions: JSON.stringify(pickupOptions),
      groups: [{ name: "商品", description: "", sortOrder: 0, isRequired: true,
        products: validProducts.map((p, i) => ({ name: p.name, description: "", price: p.price, limit: p.limit, unit: "份", sortOrder: i, note: "", isActive: true })),
      }],
    };

    try {
      const url = editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "儲存失敗"); setSubmitting(false); return; }

      setSubmitting(false);
      // 儲存後自動開預覽
      const savedId = editingId || result.id;
      resetForm(); loadCampaigns();
      if (savedId) setPreviewId(savedId);
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
    setBannerUrl(data.bannerUrl || ""); setFormStyle(data.formStyle || "classic");
    setSupporterDiscount(data.supporterDiscount || 0);
    const opts = typeof data.pickupOptions === "string" ? JSON.parse(data.pickupOptions) : data.pickupOptions;
    setPickupOptions(Array.isArray(opts) ? opts : [...DEFAULT_PICKUP]);
    const prods = data.groups?.[0]?.products || [];
    setProducts(prods.length > 0 ? prods.map((p) => ({ name: p.name, price: p.price, limit: p.limit })) : [{ name: "", price: 0, limit: null }]);
    setEditingId(null); setShowForm(true);
  }

  // 品項操作
  function updateProduct(i: number, field: keyof ProductEntry, value: unknown) {
    setProducts((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }
  function addProduct() {
    setProducts((prev) => [...prev, { name: "", price: 0, limit: null }]);
    setTimeout(() => setFocusedProduct(products.length), 50);
  }
  function removeProduct(i: number) {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((_, idx) => idx !== i));
    setFocusedProduct(null);
  }
  function duplicateProduct(i: number) {
    setProducts((prev) => [...prev.slice(0, i + 1), { ...prev[i] }, ...prev.slice(i + 1)]);
  }
  function moveProduct(from: number, to: number) {
    if (to < 0 || to >= products.length) return;
    setProducts((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setFocusedProduct(to);
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  const inputClass = "w-full px-3 py-2 rounded-md text-lg text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none";

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">預購表單</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary-sm">+ 建立表單</button>
      </div>

      {/* ═══ 預覽 Modal ═══ */}
      {previewId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-linen-dark/30 px-6 py-3 flex items-center justify-between z-10">
              <span className="font-serif font-bold text-espresso">預覽表單</span>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!window.confirm("確定要發佈嗎？發佈後消費者即可看到。")) return;
                    await fetch(`/api/admin/campaigns/${previewId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "active" }) });
                    setPreviewId(null); loadCampaigns();
                  }}
                  className="px-4 py-1.5 rounded-md text-sm font-medium bg-sage text-white hover:bg-sage/80 transition-colors"
                >確認發佈</button>
                <button onClick={() => setPreviewId(null)} className="px-4 py-1.5 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all">關閉</button>
              </div>
            </div>
            <iframe src={`/order?preview=${previewId}`} className="w-full border-0" style={{ height: "80vh" }} />
          </div>
        </div>
      )}

      {/* ═══ 編輯表單 ═══ */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <h3 className="font-serif font-bold text-espresso text-lg">{editingId ? "編輯表單" : "建立預購表單"}</h3>

          {/* 基本資訊卡片 */}
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">表單名稱 *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="例：2026 母親節預購" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">開始日期 *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">結束日期 *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">支持者折扣</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSupporterDiscount(supporterDiscount > 0 ? 0 : 1)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${supporterDiscount > 0 ? "bg-sage" : "bg-espresso-light/20"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${supporterDiscount > 0 ? "translate-x-6" : ""}`} />
                </button>
                <span className="text-sm text-espresso-light/50">
                  {supporterDiscount > 0 ? "已啟用 — 消費者可選擇支持方式，享 9 折 / 85 折 / 7 折優惠" : "未啟用"}
                </span>
              </div>
            </div>
            <ImageUploader value={bannerUrl} onChange={setBannerUrl} label="活動說明圖（選填）" previewWidth={160} previewHeight={100} />
          </div>

          {/* ═══ 商品列表（Google Forms 風格）═══ */}
          <div className="space-y-3">
            {products.map((p, i) => {
              const isFocused = focusedProduct === i;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-lg ring-1 transition-all duration-200 ${isFocused ? "ring-rose ring-2 shadow-md" : "ring-linen-dark/60"}`}
                  style={isFocused ? { borderLeft: "4px solid var(--color-rose)" } : { borderLeft: "4px solid transparent" }}
                  onClick={() => setFocusedProduct(i)}
                >
                  {/* 拖曳把手 */}
                  <div className="flex justify-center pt-2 pb-1 cursor-grab text-espresso-light/20 hover:text-espresso-light/40">
                    <svg width="20" height="6" viewBox="0 0 20 6"><circle cx="4" cy="1" r="1" fill="currentColor" /><circle cx="10" cy="1" r="1" fill="currentColor" /><circle cx="16" cy="1" r="1" fill="currentColor" /><circle cx="4" cy="5" r="1" fill="currentColor" /><circle cx="10" cy="5" r="1" fill="currentColor" /><circle cx="16" cy="5" r="1" fill="currentColor" /></svg>
                  </div>

                  <div className="px-5 pb-2">
                    {/* 品名 */}
                    <input
                      value={p.name}
                      onChange={(e) => updateProduct(i, "name", e.target.value)}
                      className="w-full py-2 text-lg text-espresso bg-transparent outline-none placeholder:text-espresso-light/30"
                      style={{ borderBottom: isFocused ? "2px solid var(--color-rose)" : "1px solid rgba(30,15,8,0.1)" }}
                      placeholder={isFocused ? "輸入品名，例：香辣香菇醬" : "品名"}
                      autoFocus={isFocused && !p.name}
                    />

                    {/* 價格 + 限量（focus 時顯示） */}
                    {isFocused && (
                      <div className="flex items-center gap-4 mt-3 animate-[bakeSwing_0.3s_ease_both]">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-espresso-light/50">NT$</span>
                          <input
                            type="number"
                            value={p.price || ""}
                            onChange={(e) => updateProduct(i, "price", Number(e.target.value))}
                            className="w-20 py-1 px-2 text-base text-espresso bg-linen rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose"
                            placeholder="價格"
                            min="0"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-espresso-light/50">限量</span>
                          <input
                            type="number"
                            value={p.limit ?? ""}
                            onChange={(e) => updateProduct(i, "limit", e.target.value ? Number(e.target.value) : null)}
                            className="w-20 py-1 px-2 text-base text-espresso bg-linen rounded-md ring-1 ring-linen-dark/40 outline-none focus:ring-rose"
                            placeholder="不限"
                            min="0"
                          />
                        </div>
                      </div>
                    )}

                    {/* 非 focus 時顯示摘要 */}
                    {!isFocused && p.name && (
                      <div className="flex items-center gap-3 mt-1 text-sm text-espresso-light/40">
                        <span>NT$ {p.price}</span>
                        {p.limit != null && <span>· 限量 {p.limit}</span>}
                      </div>
                    )}
                  </div>

                  {/* 底部工具列（focus 時顯示）*/}
                  {isFocused && (
                    <div className="flex items-center justify-end gap-1 px-4 py-2 border-t border-linen-dark/20 animate-[bakeSwing_0.3s_ease_both]">
                      {/* 上移 */}
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveProduct(i, i - 1); }} disabled={i === 0} className="p-1.5 rounded-md text-espresso-light/40 hover:text-espresso hover:bg-linen disabled:opacity-20 transition-all" title="上移">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                      </button>
                      {/* 下移 */}
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveProduct(i, i + 1); }} disabled={i === products.length - 1} className="p-1.5 rounded-md text-espresso-light/40 hover:text-espresso hover:bg-linen disabled:opacity-20 transition-all" title="下移">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                      </button>
                      <div className="w-px h-5 bg-linen-dark/30 mx-1" />
                      {/* 複製 */}
                      <button type="button" onClick={(e) => { e.stopPropagation(); duplicateProduct(i); }} className="p-1.5 rounded-md text-espresso-light/40 hover:text-espresso hover:bg-linen transition-all" title="複製">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      </button>
                      {/* 刪除 */}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeProduct(i); }} disabled={products.length <= 1} className="p-1.5 rounded-md text-espresso-light/40 hover:text-rose hover:bg-rose/5 disabled:opacity-20 transition-all" title="刪除">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 新增商品按鈕 */}
            <button
              type="button"
              onClick={addProduct}
              className="w-full py-3 bg-white rounded-lg ring-1 ring-dashed ring-linen-dark/40 text-espresso-light/50 hover:text-rose hover:ring-rose/40 transition-all flex items-center justify-center gap-2 text-base"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
              新增商品
            </button>
          </div>

          {/* 面交選項 */}
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
            <p className="text-sm font-medium text-espresso mb-3">面交取貨選項（消費者下拉選擇）</p>
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

          {/* 送出 */}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "儲存並預覽" : "建立並預覽"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">取消</button>
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
          {campaigns.filter((c) => c.id !== editingId).map((c) => (
            <div key={c.id} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-serif font-bold text-espresso text-base">{c.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${STATUS_STYLES[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                  </div>
                  <p className="text-espresso-light/50 text-sm">
                    {c.startDate} ~ {c.endDate} · {c.orderCount} 筆訂單
                    {c.supporterDiscount > 0 && <span className="ml-2 text-rose">♥ 支持者折扣已啟用</span>}
                  </p>
                </div>
                {c.bannerUrl && <Image src={c.bannerUrl} alt="" width={80} height={50} className="rounded-md object-cover shrink-0" />}
              </div>

              <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px dashed rgba(30,15,8,0.06)" }}>
                {/* 預覽按鈕（醒目） */}
                <button onClick={() => setPreviewId(c.id)} className="text-xs px-4 py-1.5 rounded-md bg-sage/10 ring-1 ring-sage/30 text-sage font-medium hover:bg-sage/20 hover:ring-sage transition-all">
                  👁 預覽
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
          ))}
        </div>
      )}
    </div>
  );
}
