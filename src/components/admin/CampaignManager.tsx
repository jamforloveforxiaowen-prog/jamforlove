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
  pickupOptions: string[];
  orderCount: number;
}

interface CampaignDetail extends Omit<Campaign, "orderCount" | "pickupOptions"> {
  pickupOptions: string;
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

  // 表單欄位
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [formStyle, setFormStyle] = useState("classic");
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
    setFormStyle("classic"); setPickupOptions([...DEFAULT_PICKUP]); setNewPickup("");
    setProducts([{ name: "", price: 0, limit: null }]);
    setEditingId(null); setShowForm(false); setError("");
  }

  async function startEdit(id: number) {
    setError("");
    const res = await fetch(`/api/admin/campaigns/${id}`);
    const data: CampaignDetail = await res.json();
    setName(data.name);
    setStartDate(data.startDate);
    setEndDate(data.endDate);
    setBannerUrl(data.bannerUrl || "");
    setFormStyle(data.formStyle || "classic");
    const opts = typeof data.pickupOptions === "string" ? JSON.parse(data.pickupOptions) : data.pickupOptions;
    setPickupOptions(Array.isArray(opts) && opts.length > 0 ? opts : [...DEFAULT_PICKUP]);
    // 從 groups[0].products 取出品項
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

    // 打包成一個 group（保持 API 相容）
    const payload = {
      name, startDate, endDate, bannerUrl, formStyle,
      pickupOptions: JSON.stringify(pickupOptions),
      groups: [{
        name: "商品", description: "", sortOrder: 0, isRequired: true,
        products: validProducts.map((p, i) => ({
          name: p.name, description: "", price: p.price, limit: p.limit,
          unit: "份", sortOrder: i, note: "", isActive: true,
        })),
      }],
    };

    try {
      const url = editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "儲存失敗"); setSubmitting(false); return; }
    } catch { setError("網路連線失敗"); setSubmitting(false); return; }

    setSubmitting(false); resetForm(); loadCampaigns();
  }

  async function toggleStatus(c: Campaign) {
    const next = c.status === "draft" ? "active" : c.status === "active" ? "closed" : "draft";
    if (!window.confirm(`確定要將「${c.name}」設為「${STATUS_LABELS[next]}」嗎？`)) return;
    await fetch(`/api/admin/campaigns/${c.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
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
    setName(data.name + "（複製）");
    setStartDate(""); setEndDate("");
    setBannerUrl(data.bannerUrl || "");
    setFormStyle(data.formStyle || "classic");
    const opts = typeof data.pickupOptions === "string" ? JSON.parse(data.pickupOptions) : data.pickupOptions;
    setPickupOptions(Array.isArray(opts) ? opts : [...DEFAULT_PICKUP]);
    const prods = data.groups?.[0]?.products || [];
    setProducts(prods.length > 0
      ? prods.map((p) => ({ name: p.name, price: p.price, limit: p.limit }))
      : [{ name: "", price: 0, limit: null }]);
    setEditingId(null); setShowForm(true);
  }

  // 品項操作
  function updateProduct(i: number, field: keyof ProductEntry, value: unknown) {
    setProducts((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }
  function addProduct() { setProducts((prev) => [...prev, { name: "", price: 0, limit: null }]); }
  function removeProduct(i: number) { setProducts((prev) => prev.filter((_, idx) => idx !== i)); }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  const inputClass = "w-full px-3 py-2 rounded-md text-lg text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none";

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">預購表單</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary-sm">+ 建立表單</button>
      </div>

      {/* 預覽 */}
      {previewId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-linen-dark/30 px-6 py-3 flex items-center justify-between z-10">
              <span className="font-serif font-bold text-espresso">預覽表單</span>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!window.confirm("確定要發佈嗎？")) return;
                    await fetch(`/api/admin/campaigns/${previewId}`, {
                      method: "PUT", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "active" }),
                    });
                    setPreviewId(null); loadCampaigns();
                  }}
                  className="px-4 py-1.5 rounded-md text-sm font-medium bg-sage text-white hover:bg-sage/80 transition-colors"
                >
                  確認發佈
                </button>
                <button onClick={() => setPreviewId(null)} className="px-4 py-1.5 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all">
                  關閉
                </button>
              </div>
            </div>
            <iframe src={`/order?preview=${previewId}`} className="w-full border-0" style={{ height: "80vh" }} />
          </div>
        </div>
      )}

      {/* ─── 編輯表單 ─── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 mb-8 space-y-6">
          <h3 className="font-serif font-bold text-espresso text-lg">{editingId ? "編輯表單" : "建立預購表單"}</h3>

          {/* 基本資訊 */}
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

          {/* 說明圖 */}
          <ImageUploader value={bannerUrl} onChange={setBannerUrl} label="活動說明圖（選填）" previewWidth={160} previewHeight={100} />

          {/* ─── 商品列表 ─── */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-3">商品列表</p>
            <div className="space-y-2">
              {products.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p.name}
                    onChange={(e) => updateProduct(i, "name", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="品名"
                  />
                  <div className="relative shrink-0 w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light/40 text-sm">NT$</span>
                    <input
                      type="number"
                      value={p.price || ""}
                      onChange={(e) => updateProduct(i, "price", Number(e.target.value))}
                      className={`${inputClass} pl-12`}
                      placeholder="價格"
                      min="0"
                    />
                  </div>
                  <input
                    type="number"
                    value={p.limit ?? ""}
                    onChange={(e) => updateProduct(i, "limit", e.target.value ? Number(e.target.value) : null)}
                    className={`${inputClass} w-24 shrink-0`}
                    placeholder="限量"
                    min="0"
                  />
                  <button type="button" onClick={() => removeProduct(i)} className="text-rose/40 hover:text-rose shrink-0 p-1" title="刪除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addProduct} className="text-xs text-sage hover:underline mt-3">+ 新增商品</button>
          </div>

          {/* ─── 面交選項 ─── */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-3">面交取貨選項（消費者下拉選擇）</p>
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
              <input
                value={newPickup}
                onChange={(e) => setNewPickup(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = newPickup.trim(); if (v && !pickupOptions.includes(v)) { setPickupOptions((p) => [...p, v]); setNewPickup(""); } } }}
                className={`${inputClass} flex-1`}
                placeholder="新增選項，例：5/19（四）校內取貨"
              />
              <button type="button" onClick={() => { const v = newPickup.trim(); if (v && !pickupOptions.includes(v)) { setPickupOptions((p) => [...p, v]); setNewPickup(""); } }} className="px-4 py-2 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all shrink-0">
                新增
              </button>
            </div>
          </div>

          {/* ─── 表單風格 ─── */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-3">表單風格</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {FORM_STYLES.map((s) => (
                <button
                  key={s.id} type="button" onClick={() => setFormStyle(s.id)}
                  className={`p-3 rounded-lg text-left transition-all ${formStyle === s.id ? "bg-rose/5 ring-2 ring-rose" : "bg-linen/50 ring-1 ring-linen-dark/40 hover:ring-espresso-light/40"}`}
                >
                  <p className="text-sm font-bold text-espresso">{s.name}</p>
                  <p className="text-[0.65rem] text-espresso-light/50 mt-0.5 leading-tight">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "更新表單" : "建立表單"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">取消</button>
          </div>
        </form>
      )}

      {/* ─── 表單列表 ─── */}
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
                    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${STATUS_STYLES[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="text-espresso-light/50 text-sm">
                    {c.startDate} ~ {c.endDate} · {c.orderCount} 筆訂單
                  </p>
                </div>
                {c.bannerUrl && <Image src={c.bannerUrl} alt="" width={80} height={50} className="rounded-md object-cover shrink-0" />}
              </div>

              <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px dashed rgba(30,15,8,0.06)" }}>
                <button onClick={() => startEdit(c.id)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">編輯</button>
                {c.status === "draft" && (
                  <button onClick={() => setPreviewId(c.id)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-sage/40 text-sage hover:ring-sage transition-all">預覽</button>
                )}
                <button onClick={() => toggleStatus(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">
                  {c.status === "draft" ? "發佈" : c.status === "active" ? "結束" : "重新開放"}
                </button>
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
