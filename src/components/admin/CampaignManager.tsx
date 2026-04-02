"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

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
  maxOrders: number | null;
  perPersonLimit: number;
  titleText: string;
  subtitleText: string;
  themeColor: string;
  orderCount: number;
  createdAt: string;
}

interface CampaignDetail extends Omit<Campaign, "orderCount"> {
  groups: (CampaignGroup & { id: number; products: (CampaignProduct & { id: number })[] })[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  active: "進行中",
  closed: "已結束",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-espresso-light/10 text-espresso-light",
  active: "bg-sage/15 text-sage",
  closed: "bg-espresso-light/10 text-espresso-light/50",
};

const emptyProduct = (): CampaignProduct => ({
  name: "", description: "", price: 0, limit: null, unit: "份", sortOrder: 0, note: "", isActive: true,
});

const emptyGroup = (): CampaignGroup => ({
  name: "", description: "", sortOrder: 0, isRequired: false, products: [emptyProduct()],
});

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 表單欄位
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [maxOrders, setMaxOrders] = useState("");
  const [perPersonLimit, setPerPersonLimit] = useState("1");
  const [titleText, setTitleText] = useState("Jam for Love");
  const [subtitleText, setSubtitleText] = useState("");
  const [themeColor, setThemeColor] = useState("rose");
  const [groups, setGroups] = useState<CampaignGroup[]>([
    { name: "產品組合", description: "可複選多組", sortOrder: 0, isRequired: true, products: [emptyProduct()] },
  ]);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (Array.isArray(data)) setCampaigns(data);
    } catch {
      setError("無法載入活動列表");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCampaigns(); }, []);

  function resetForm() {
    setName(""); setStartDate(""); setEndDate(""); setBannerUrl("");
    setMaxOrders(""); setPerPersonLimit("1");
    setTitleText("Jam for Love"); setSubtitleText(""); setThemeColor("rose");
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
    setMaxOrders(data.maxOrders?.toString() || "");
    setPerPersonLimit(data.perPersonLimit?.toString() || "1");
    setTitleText(data.titleText || "Jam for Love");
    setSubtitleText(data.subtitleText || "");
    setThemeColor(data.themeColor || "rose");
    setGroups(
      data.groups.map((g) => ({
        name: g.name,
        description: g.description,
        sortOrder: g.sortOrder,
        isRequired: g.isRequired,
        products: g.products.map((p) => ({
          name: p.name,
          description: p.description,
          price: p.price,
          limit: p.limit,
          unit: p.unit,
          sortOrder: p.sortOrder,
          note: p.note,
          isActive: p.isActive,
        })),
      }))
    );
    setEditingId(id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !startDate || !endDate) { setError("請填寫活動名稱和日期"); return; }
    setSubmitting(true); setError("");

    const payload = {
      name, startDate, endDate, bannerUrl,
      maxOrders: maxOrders ? Number(maxOrders) : null,
      perPersonLimit: Number(perPersonLimit) || 1,
      titleText, subtitleText, themeColor,
      groups: groups.map((g, gi) => ({
        ...g,
        sortOrder: gi,
        products: g.products.map((p, pi) => ({ ...p, sortOrder: pi })),
      })),
    };

    try {
      const url = editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "儲存失敗");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("網路連線失敗"); setSubmitting(false); return;
    }

    setSubmitting(false);
    resetForm();
    loadCampaigns();
  }

  async function toggleStatus(c: Campaign) {
    const next = c.status === "draft" ? "active" : c.status === "active" ? "closed" : "draft";
    const label = STATUS_LABELS[next];
    if (!window.confirm(`確定要將「${c.name}」設為「${label}」嗎？`)) return;
    await fetch(`/api/admin/campaigns/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    loadCampaigns();
  }

  async function handleDelete(c: Campaign) {
    if (c.orderCount > 0) {
      alert("此活動已有訂單，無法刪除");
      return;
    }
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
    setMaxOrders(data.maxOrders?.toString() || "");
    setPerPersonLimit(data.perPersonLimit?.toString() || "1");
    setTitleText(data.titleText || "Jam for Love");
    setSubtitleText(data.subtitleText || "");
    setThemeColor(data.themeColor || "rose");
    setGroups(
      data.groups.map((g) => ({
        name: g.name, description: g.description, sortOrder: g.sortOrder, isRequired: g.isRequired,
        products: g.products.map((p) => ({
          name: p.name, description: p.description, price: p.price,
          limit: p.limit, unit: p.unit, sortOrder: p.sortOrder, note: p.note, isActive: p.isActive,
        })),
      }))
    );
    setEditingId(null);
    setShowForm(true);
  }

  // 分組操作
  function updateGroup(gi: number, field: string, value: unknown) {
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, [field]: value } : g));
  }
  function addGroup() {
    setGroups((prev) => [...prev, emptyGroup()]);
  }
  function removeGroup(gi: number) {
    setGroups((prev) => prev.filter((_, i) => i !== gi));
  }

  // 品項操作
  function updateProduct(gi: number, pi: number, field: string, value: unknown) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi
          ? { ...g, products: g.products.map((p, j) => (j === pi ? { ...p, [field]: value } : p)) }
          : g
      )
    );
  }
  function addProduct(gi: number) {
    setGroups((prev) =>
      prev.map((g, i) => (i === gi ? { ...g, products: [...g.products, emptyProduct()] } : g))
    );
  }
  function removeProduct(gi: number, pi: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, products: g.products.filter((_, j) => j !== pi) } : g
      )
    );
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  const inputClass = "w-full px-3 py-2 rounded-md text-lg text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none";
  const labelClass = "block text-sm font-medium text-espresso mb-1";

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">銷售活動</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary-sm">
          + 新增活動
        </button>
      </div>

      {/* ─── 編輯表單 ─── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 mb-8 space-y-6">
          <h3 className="font-serif font-bold text-espresso text-lg">
            {editingId ? "編輯活動" : "新增活動"}
          </h3>

          {/* 基本資訊 */}
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
            <div>
              <label className={labelClass}>訂單上限</label>
              <input type="number" min="0" value={maxOrders} onChange={(e) => setMaxOrders(e.target.value)} className={inputClass} placeholder="不限" />
            </div>
            <div>
              <label className={labelClass}>每人限購次數</label>
              <input type="number" min="1" value={perPersonLimit} onChange={(e) => setPerPersonLimit(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* 表單風格 */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-3">表單風格</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>標題文字</label>
                <input value={titleText} onChange={(e) => setTitleText(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>副標題</label>
                <input value={subtitleText} onChange={(e) => setSubtitleText(e.target.value)} className={inputClass} placeholder="例：用愛手工熬煮" />
              </div>
              <div>
                <label className={labelClass}>主題色</label>
                <select value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className={inputClass}>
                  <option value="rose">玫瑰粉</option>
                  <option value="sage">草本綠</option>
                  <option value="honey">蜂蜜金</option>
                  <option value="espresso">咖啡棕</option>
                </select>
              </div>
            </div>
          </div>

          {/* 說明圖 */}
          <ImageUploader value={bannerUrl} onChange={setBannerUrl} label="活動說明圖（選填）" previewWidth={160} previewHeight={100} />

          {/* ─── 分組與品項 ─── */}
          <div className="pt-2" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase">產品分組</p>
              <button type="button" onClick={addGroup} className="text-xs text-rose hover:underline">
                + 新增分組
              </button>
            </div>

            <div className="space-y-6">
              {groups.map((group, gi) => (
                <div key={gi} className="bg-linen/50 rounded-lg p-4 ring-1 ring-linen-dark/40">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={group.name}
                        onChange={(e) => updateGroup(gi, "name", e.target.value)}
                        className={inputClass}
                        placeholder="分組名稱，例：產品組合"
                        required
                      />
                      <input
                        value={group.description}
                        onChange={(e) => updateGroup(gi, "description", e.target.value)}
                        className={inputClass}
                        placeholder="說明，例：每組 NT$500"
                      />
                      <label className="flex items-center gap-2 text-sm text-espresso cursor-pointer">
                        <input
                          type="checkbox"
                          checked={group.isRequired}
                          onChange={(e) => updateGroup(gi, "isRequired", e.target.checked)}
                          className="w-4 h-4 accent-rose"
                        />
                        必填（至少選一項）
                      </label>
                    </div>
                    {groups.length > 1 && (
                      <button type="button" onClick={() => removeGroup(gi)} className="text-xs text-rose/60 hover:text-rose shrink-0 mt-2">
                        刪除分組
                      </button>
                    )}
                  </div>

                  {/* 品項列表 */}
                  <div className="space-y-2">
                    {group.products.map((product, pi) => (
                      <div key={pi} className="bg-white rounded-md p-3 ring-1 ring-linen-dark/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <input
                            value={product.name}
                            onChange={(e) => updateProduct(gi, pi, "name", e.target.value)}
                            className={inputClass}
                            placeholder="品項名稱"
                            required
                          />
                          <input
                            value={product.description}
                            onChange={(e) => updateProduct(gi, pi, "description", e.target.value)}
                            className={inputClass}
                            placeholder="內容描述"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={product.price}
                              onChange={(e) => updateProduct(gi, pi, "price", Number(e.target.value))}
                              className={inputClass}
                              placeholder="價格"
                              min="0"
                              required
                            />
                            <input
                              value={product.unit}
                              onChange={(e) => updateProduct(gi, pi, "unit", e.target.value)}
                              className={`${inputClass} w-16`}
                              placeholder="單位"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={product.limit ?? ""}
                              onChange={(e) => updateProduct(gi, pi, "limit", e.target.value ? Number(e.target.value) : null)}
                              className={inputClass}
                              placeholder="限量(不填=不限)"
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={() => removeProduct(gi, pi)}
                              className="text-rose/40 hover:text-rose shrink-0"
                              title="刪除品項"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {product.note !== undefined && (
                          <input
                            value={product.note}
                            onChange={(e) => updateProduct(gi, pi, "note", e.target.value)}
                            className={`${inputClass} mt-2`}
                            placeholder="備註（例：限面交）"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addProduct(gi)} className="text-xs text-sage hover:underline mt-2">
                    + 新增品項
                  </button>
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
                  </div>
                  <p className="text-espresso-light/50 text-sm">
                    {c.startDate} ~ {c.endDate}
                    {c.maxOrders ? ` · 上限 ${c.maxOrders} 筆` : ""}
                    {` · 已有 ${c.orderCount} 筆訂單`}
                  </p>
                </div>

                {c.bannerUrl && (
                  <Image src={c.bannerUrl} alt="" width={80} height={50} className="rounded-md object-cover shrink-0" />
                )}
              </div>

              <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px dashed rgba(30,15,8,0.06)" }}>
                <button onClick={() => startEdit(c.id)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">
                  編輯
                </button>
                <button onClick={() => toggleStatus(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">
                  {c.status === "draft" ? "發佈" : c.status === "active" ? "結束" : "重新開放"}
                </button>
                <button onClick={() => duplicateCampaign(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all">
                  複製
                </button>
                <button onClick={() => handleDelete(c)} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-rose/30 text-rose/60 hover:text-rose hover:ring-rose transition-all">
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
