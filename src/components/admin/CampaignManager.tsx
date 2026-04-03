"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

/* ─── 型別 ─── */

interface CampaignProduct {
  name: string;
  description: string;
  price: number;
  limit: number | null;
  unit: string;
  sortOrder: number;
  note: string;
  isActive: boolean;
}

interface CampaignGroup {
  name: string;
  description: string;
  sortOrder: number;
  isRequired: boolean;
  products: CampaignProduct[];
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
  createdAt: string;
}

interface CampaignDetail extends Omit<Campaign, "orderCount" | "pickupOptions"> {
  pickupOptions: string;
  groups: (CampaignGroup & { id: number; products: (CampaignProduct & { id: number })[] })[];
}

const STATUS_LABELS: Record<string, string> = { draft: "草稿", active: "進行中", closed: "已結束" };
const STATUS_STYLES: Record<string, string> = {
  draft: "bg-espresso-light/10 text-espresso-light",
  active: "bg-sage/15 text-sage",
  closed: "bg-espresso-light/10 text-espresso-light/50",
};

const FORM_STYLES: { id: string; name: string; description: string }[] = [
  { id: "classic", name: "經典手感", description: "虛線邊框、圓角、手寫風步驟圓圈" },
  { id: "minimal", name: "極簡白", description: "大量留白、細線分隔、乾淨俐落" },
  { id: "warm", name: "暖陽雜貨", description: "米色底、手繪插圖風、膠帶裝飾" },
  { id: "elegant", name: "優雅花園", description: "淡紫粉色系、花朵裝飾線、圓角卡片" },
  { id: "rustic", name: "鄉村木質", description: "木紋底圖、深棕色調、方角邊框" },
  { id: "playful", name: "活潑糖果", description: "圓潤色塊、彩色標籤、跳動動畫" },
  { id: "modern", name: "現代都會", description: "灰黑白配色、直角、無襯線字體" },
  { id: "vintage", name: "復古印刷", description: "復古紙張底、襯線字體、郵票裝飾" },
  { id: "nature", name: "自然草本", description: "綠色系、葉片裝飾、有機圓角" },
  { id: "festival", name: "節慶喜氣", description: "紅金配色、燈籠裝飾、適合佳節活動" },
];

const DEFAULT_PICKUP_OPTIONS = ["小川阿姨", "台大面交", "宜蘭面交"];

const emptyProduct = (): CampaignProduct => ({
  name: "", description: "", price: 0, limit: null, unit: "份", sortOrder: 0, note: "", isActive: true,
});
const emptyGroup = (): CampaignGroup => ({
  name: "", description: "", sortOrder: 0, isRequired: false, products: [emptyProduct()],
});

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
  const [pickupOptions, setPickupOptions] = useState<string[]>([...DEFAULT_PICKUP_OPTIONS]);
  const [newPickupOption, setNewPickupOption] = useState("");
  const [groups, setGroups] = useState<CampaignGroup[]>([
    { name: "產品組合", description: "可複選多組", sortOrder: 0, isRequired: true, products: [emptyProduct()] },
  ]);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (Array.isArray(data)) setCampaigns(data.map((c: Record<string, unknown>) => ({
        ...c,
        pickupOptions: typeof c.pickupOptions === "string" ? JSON.parse(c.pickupOptions as string) : c.pickupOptions || [],
      })) as Campaign[]);
    } catch { setError("無法載入活動列表"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCampaigns(); }, []);

  function resetForm() {
    setName(""); setStartDate(""); setEndDate(""); setBannerUrl("");
    setFormStyle("classic");
    setPickupOptions([...DEFAULT_PICKUP_OPTIONS]); setNewPickupOption("");
    setGroups([{ name: "產品組合", description: "可複選多組", sortOrder: 0, isRequired: true, products: [emptyProduct()] }]);
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
    setPickupOptions(Array.isArray(opts) && opts.length > 0 ? opts : [...DEFAULT_PICKUP_OPTIONS]);
    setGroups(data.groups.map((g) => ({
      name: g.name, description: g.description, sortOrder: g.sortOrder, isRequired: g.isRequired,
      products: g.products.map((p) => ({
        name: p.name, description: p.description, price: p.price, limit: p.limit,
        unit: p.unit, sortOrder: p.sortOrder, note: p.note, isActive: p.isActive,
      })),
    })));
    setEditingId(id); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !startDate || !endDate) { setError("請填寫活動名稱和日期"); return; }
    setSubmitting(true); setError("");

    const payload = {
      name, startDate, endDate, bannerUrl, formStyle,
      pickupOptions: JSON.stringify(pickupOptions),
      groups: groups.map((g, gi) => ({
        ...g, sortOrder: gi,
        products: g.products.map((p, pi) => ({ ...p, sortOrder: pi })),
      })),
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
    if (c.orderCount > 0) { alert("此活動已有訂單，無法刪除"); return; }
    if (!window.confirm(`確定要刪除「${c.name}」嗎？此操作無法復原。`)) return;
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
    setPickupOptions(Array.isArray(opts) ? opts : [...DEFAULT_PICKUP_OPTIONS]);
    setGroups(data.groups.map((g) => ({
      name: g.name, description: g.description, sortOrder: g.sortOrder, isRequired: g.isRequired,
      products: g.products.map((p) => ({
        name: p.name, description: p.description, price: p.price, limit: p.limit,
        unit: p.unit, sortOrder: p.sortOrder, note: p.note, isActive: p.isActive,
      })),
    })));
    setEditingId(null); setShowForm(true);
  }

  // 分組 / 品項操作
  function updateGroup(gi: number, field: string, value: unknown) {
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, [field]: value } : g));
  }
  function addGroup() { setGroups((prev) => [...prev, emptyGroup()]); }
  function removeGroup(gi: number) { setGroups((prev) => prev.filter((_, i) => i !== gi)); }
  function updateProduct(gi: number, pi: number, field: string, value: unknown) {
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, products: g.products.map((p, j) => j === pi ? { ...p, [field]: value } : p) } : g));
  }
  function addProduct(gi: number) {
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, products: [...g.products, emptyProduct()] } : g));
  }
  function removeProduct(gi: number, pi: number) {
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, products: g.products.filter((_, j) => j !== pi) } : g));
  }

  // 面交選項操作
  function addPickupOption() {
    const v = newPickupOption.trim();
    if (!v || pickupOptions.includes(v)) return;
    setPickupOptions((prev) => [...prev, v]);
    setNewPickupOption("");
  }
  function removePickupOption(idx: number) {
    setPickupOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  const inputClass = "w-full px-3 py-2 rounded-md text-lg text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none";
  const labelClass = "block text-sm font-medium text-espresso mb-1";

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">銷售活動</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary-sm">+ 新增活動</button>
      </div>

      {/* ─── 預覽 ─── */}
      {previewId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-linen-dark/30 px-6 py-3 flex items-center justify-between z-10">
              <span className="font-serif font-bold text-espresso">預覽</span>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!window.confirm("確定要發佈此活動嗎？")) return;
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
          <h3 className="font-serif font-bold text-espresso text-lg">{editingId ? "編輯活動" : "新增活動"}</h3>

          {/* 基本 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>活動名稱 *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="例：2026 母親節預購" />
            </div>
            <div>
              <label className={labelClass}>開始日期 *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>結束日期 *</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required />
            </div>
          </div>

          {/* 說明圖 */}
          <ImageUploader value={bannerUrl} onChange={setBannerUrl} label="活動說明圖（選填）" previewWidth={160} previewHeight={100} />

          {/* 面交選項 */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-3">面交取貨選項</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {pickupOptions.map((opt, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-linen ring-1 ring-linen-dark/40 text-espresso">
                  {opt}
                  <button type="button" onClick={() => removePickupOption(i)} className="text-rose/40 hover:text-rose">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newPickupOption}
                onChange={(e) => setNewPickupOption(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPickupOption(); } }}
                className={`${inputClass} flex-1`}
                placeholder="新增選項，例：5/19（四）校內取貨"
              />
              <button type="button" onClick={addPickupOption} className="px-4 py-2 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all shrink-0">
                新增
              </button>
            </div>
          </div>

          {/* 表單風格 */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-3">表單風格</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {FORM_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormStyle(style.id)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    formStyle === style.id
                      ? "bg-rose/5 ring-2 ring-rose"
                      : "bg-linen/50 ring-1 ring-linen-dark/40 hover:ring-espresso-light/40"
                  }`}
                >
                  <p className="text-sm font-bold text-espresso">{style.name}</p>
                  <p className="text-[0.65rem] text-espresso-light/50 mt-0.5 leading-tight">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 分組與品項 */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase">產品分組</p>
              <button type="button" onClick={addGroup} className="text-xs text-rose hover:underline">+ 新增分組</button>
            </div>
            <div className="space-y-6">
              {groups.map((group, gi) => (
                <div key={gi} className="bg-linen/50 rounded-lg p-4 ring-1 ring-linen-dark/40">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input value={group.name} onChange={(e) => updateGroup(gi, "name", e.target.value)} className={inputClass} placeholder="分組名稱" required />
                      <input value={group.description} onChange={(e) => updateGroup(gi, "description", e.target.value)} className={inputClass} placeholder="說明" />
                      <label className="flex items-center gap-2 text-sm text-espresso cursor-pointer">
                        <input type="checkbox" checked={group.isRequired} onChange={(e) => updateGroup(gi, "isRequired", e.target.checked)} className="w-4 h-4 accent-rose" />
                        必填
                      </label>
                    </div>
                    {groups.length > 1 && (
                      <button type="button" onClick={() => removeGroup(gi)} className="text-xs text-rose/60 hover:text-rose shrink-0 mt-2">刪除分組</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.products.map((product, pi) => (
                      <div key={pi} className="bg-white rounded-md p-3 ring-1 ring-linen-dark/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <input value={product.name} onChange={(e) => updateProduct(gi, pi, "name", e.target.value)} className={inputClass} placeholder="品項名稱" required />
                          <input value={product.description} onChange={(e) => updateProduct(gi, pi, "description", e.target.value)} className={inputClass} placeholder="內容描述" />
                          <div className="flex gap-2">
                            <input type="number" value={product.price} onChange={(e) => updateProduct(gi, pi, "price", Number(e.target.value))} className={inputClass} placeholder="價格" min="0" required />
                            <input value={product.unit} onChange={(e) => updateProduct(gi, pi, "unit", e.target.value)} className={`${inputClass} w-16`} placeholder="單位" />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input type="number" value={product.limit ?? ""} onChange={(e) => updateProduct(gi, pi, "limit", e.target.value ? Number(e.target.value) : null)} className={inputClass} placeholder="限量" min="0" />
                            <button type="button" onClick={() => removeProduct(gi, pi)} className="text-rose/40 hover:text-rose shrink-0" title="刪除">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                        <input value={product.note} onChange={(e) => updateProduct(gi, pi, "note", e.target.value)} className={`${inputClass} mt-2`} placeholder="備註（例：限面交）" />
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addProduct(gi)} className="text-xs text-sage hover:underline mt-2">+ 新增品項</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "更新活動" : "建立活動"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">取消</button>
          </div>
        </form>
      )}

      {/* ─── 活動列表 ─── */}
      {campaigns.length === 0 && !showForm ? (
        <div className="text-center py-24">
          <p className="text-espresso-light/50 text-sm">尚無活動，點擊上方按鈕新增</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.filter((c) => c.id !== editingId).map((c) => (
            <div key={c.id} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-serif font-bold text-espresso text-base">{c.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${STATUS_STYLES[c.status] || ""}`}>
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                    <span className="text-espresso-light/30 text-xs">
                      {FORM_STYLES.find((s) => s.id === c.formStyle)?.name || c.formStyle}
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
