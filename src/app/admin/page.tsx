"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";
import CampaignManager from "@/components/admin/CampaignManager";
import OrderAnalytics from "@/components/admin/OrderAnalytics";
import { formatDateTimeTW } from "@/lib/datetime";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
}

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
  paymentMethod?: string;
  transferLast5?: string;
  items: OrderItem[];
  combos: { id: number; name: string; items: string[]; quantity: number; price: number }[];
  addons: { id: number; name: string; quantity: number; price: number }[];
  shippingFee?: number;
  discountAmount?: number;
  notes: string;
  total: number;
  status: string;
  createdAt: string;
}

interface ModifyRequest {
  id: number;
  orderId: number;
  customerName: string;
  phone: string;
  message: string;
  handled: boolean;
  createdAt: string;
  campaignName: string;
  orderEmail: string;
  orderTotal: number;
  orderItems: { name: string; quantity: number; price: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "待確認",
  confirmed: "已確認",
  shipped: "已出貨",
  completed: "已完成",
};

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "completed"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-honey/15 text-honey",
  confirmed: "bg-sage/10 text-sage",
  shipped: "bg-rose/10 text-rose",
  completed: "bg-sage/15 text-sage",
};

type Tab = "campaigns" | "orders" | "banners" | "about" | "story" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "campaigns", label: "預購表單設計" },
  { key: "orders", label: "訂單管理" },
  { key: "banners", label: "Banner 管理" },
  { key: "about", label: "關於我們" },
  { key: "story", label: "果醬的故事" },
  { key: "settings", label: "設定" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("campaigns");

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Admin
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          後台管理
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? "bg-espresso text-linen"
                : "text-espresso-light ring-1 ring-linen-dark hover:ring-espresso-light hover:text-espresso"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "campaigns" && <CampaignManager />}
      {tab === "orders" && <OrderManager />}
      {tab === "banners" && <BannerManager />}
      {tab === "about" && <AboutManager />}
      {tab === "story" && <StoryManager />}
      {tab === "settings" && <SettingsManager />}
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      setError("無法載入產品列表");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(product: Product) {
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setImageUrl(product.imageUrl || "");
    setEditingId(product.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("價格必須為正數");
      return;
    }

    setSubmitting(true);
    const body = { name, description, price: priceNum, imageUrl };

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "儲存失敗，請檢查資料後重試");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("網路連線失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    resetForm();
    loadProducts();
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`確定要刪除「${product.name}」嗎？此操作無法復原。`)) return;

    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      loadProducts();
    } catch {
      setError("刪除失敗，請重試");
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  }

  async function batchDelete() {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!window.confirm(`確定要刪除 ${count} 項產品嗎？此操作無法復原。`)) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/admin/products/${id}`, { method: "DELETE" })
        )
      );
      setSelectedIds(new Set());
      loadProducts();
    } catch {
      setError("批次刪除失敗，請重試");
    }
  }

  if (loading) {
    return (
      <p className="text-espresso-light/50 text-center py-16 text-sm" role="status" aria-label="載入中">
        載入中...
      </p>
    );
  }

  if (!loading && error && products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>
        <button
          onClick={() => { setError(""); setLoading(true); loadProducts(); }}
          className="btn-primary-sm"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>
      )}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-serif text-lg font-bold text-espresso">
          產品列表
        </h2>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-espresso-light/50">已選 {selectedIds.size} 項</span>
              <button onClick={batchDelete} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-rose/20 text-rose hover:bg-rose/5 transition-all">
                批次刪除
              </button>
            </>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary-sm"
          >
            + 新增產品
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 mb-8 space-y-5"
        >
          <h3 className="font-serif font-bold text-espresso">
            {editingId ? "編輯產品" : "新增產品"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium text-espresso mb-2">
                名稱
              </label>
              <input
                id="admin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-price" className="block text-sm font-medium text-espresso mb-2">
                價格 (NT$)
              </label>
              <input
                id="admin-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                min="0"
                required
              />
            </div>
          </div>
          <ImageUploader value={imageUrl} onChange={setImageUrl} label="產品圖片" />
          <div>
            <label htmlFor="admin-description" className="block text-sm font-medium text-espresso mb-2">
              說明
            </label>
            <textarea
              id="admin-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field"
            />
          </div>
          {error && (
            <p className="text-rose text-sm font-medium" role="alert">{error}</p>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "儲存" : "新增"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 全選 */}
      {products.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={selectedIds.size === products.length && products.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-rose cursor-pointer"
          />
          <span className="text-xs text-espresso-light/50">全選</span>
        </div>
      )}

      <div className="space-y-3">
        {products.filter((product) => product.id !== editingId).map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 min-w-0">
              <input
                type="checkbox"
                checked={selectedIds.has(product.id)}
                onChange={() => toggleSelect(product.id)}
                className="w-4 h-4 accent-rose cursor-pointer shrink-0"
              />
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-linen-dark flex items-center justify-center text-xl shrink-0">
                  <span role="img" aria-label="草莓">🍓</span>
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-espresso text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-espresso-light/50 line-clamp-1 mt-0.5">
                  {product.description}
                </p>
                <p
                  className="text-rose font-semibold text-sm mt-0.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  NT$ {product.price}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(product)}
                className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-2 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all duration-200"
              >
                編輯
              </button>
              <button
                onClick={() => deleteProduct(product)}
                className="text-xs px-3 py-2 rounded-md ring-1 transition-all duration-200 text-rose ring-rose/20 hover:bg-rose/5"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Banner 管理 ────────────────────── */

interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

function BannerManager() {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  async function loadItems() {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError("無法載入 Banner");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  function resetForm() {
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(item: BannerItem) {
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setImageUrl(item.imageUrl);
    setEditingId(item.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const sortOrder = editingId
      ? items.find(i => i.id === editingId)?.sortOrder ?? items.length
      : items.length;

    const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, imageUrl, sortOrder }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "儲存失敗");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("網路連線失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    resetForm();
    loadItems();
  }

  async function handleDelete(item: BannerItem) {
    if (!window.confirm("確定要刪除此 Banner 嗎？此操作無法復原。")) return;
    try {
      await fetch(`/api/admin/banners/${item.id}`, { method: "DELETE" });
      loadItems();
    } catch {
      setError("刪除失敗，請重試");
    }
  }

  // 快速排序
  async function moveBanner(id: number, target: "first" | "last" | "up" | "down") {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const reordered = [...items];
    const [moved] = reordered.splice(idx, 1);
    if (target === "first") reordered.unshift(moved);
    else if (target === "last") reordered.push(moved);
    else if (target === "up" && idx > 0) reordered.splice(idx - 1, 0, moved);
    else if (target === "down" && idx < items.length - 1) reordered.splice(idx + 1, 0, moved);
    else { reordered.splice(idx, 0, moved); return; }
    setItems(reordered);
    await Promise.all(
      reordered.map((item, i) =>
        fetch(`/api/admin/banners/${item.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    );
    loadItems();
  }

  // 拖曳排序
  function handleDragStart(id: number) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    setDragOverId(id);
  }

  async function handleDrop(targetId: number) {
    if (dragId === null || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const oldIndex = items.findIndex(i => i.id === dragId);
    const newIndex = items.findIndex(i => i.id === targetId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    setItems(reordered);
    setDragId(null);
    setDragOverId(null);

    await Promise.all(
      reordered.map((item, i) =>
        fetch(`/api/admin/banners/${item.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    );
    loadItems();
  }

  if (loading) {
    return <p className="text-espresso-light/50 text-center py-16 text-sm">載入中...</p>;
  }

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-espresso">Banner 列表</h2>
          {items.length > 1 && <p className="text-xs text-espresso-light/40 mt-1">可拖曳或用按鈕調整順序</p>}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary-sm">
          + 新增 Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 mb-8 space-y-5">
          <h3 className="font-serif font-bold text-espresso">
            {editingId ? "編輯 Banner" : "新增 Banner"}
          </h3>
          <div>
            <label htmlFor="banner-title" className="block text-sm font-medium text-espresso mb-2">標題文字</label>
            <input id="banner-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="例：用愛製作，用心傳遞" />
          </div>
          <div>
            <label htmlFor="banner-subtitle" className="block text-sm font-medium text-espresso mb-2">副標題（選填）</label>
            <input id="banner-subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="input-field" placeholder="例：最好的果醬來自最簡單的原料" />
          </div>
          <ImageUploader value={imageUrl} onChange={setImageUrl} label="背景圖片（自動裁切為 21:9）" previewWidth={210} previewHeight={90} targetWidth={1920} targetHeight={823} />
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "儲存" : "新增"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">取消</button>
          </div>
        </form>
      )}

      {items.length === 0 && !showForm ? (
        <div className="text-center py-24">
          <p className="text-espresso-light/50 text-sm">尚無 Banner，點擊上方按鈕新增</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.filter((item) => item.id !== editingId).map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={`bg-white rounded-lg ring-1 overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ${
                dragOverId === item.id && dragId !== item.id ? "ring-rose ring-2 scale-[1.01]" : "ring-linen-dark/60"
              } ${dragId === item.id ? "opacity-50" : ""}`}
            >
              {/* Banner 預覽（21:9 比例） */}
              <div className="relative w-full" style={{ aspectRatio: "21/9" }}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized={item.imageUrl.startsWith("data:")}
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))" }} />
                )}
                <div className="absolute inset-0 bg-black/20" />
                {/* 標題覆蓋在圖片上 */}
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <div>
                    {item.title && (
                      <p className="text-white font-serif text-lg md:text-xl font-bold" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                        {item.title}
                      </p>
                    )}
                    {item.subtitle && (
                      <p className="text-white/70 text-xs mt-1" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                {/* 拖曳提示 */}
                <div className="absolute top-2 left-2 bg-black/40 text-white/70 rounded px-2 py-0.5 text-xs backdrop-blur-sm">
                  ⠿ 拖曳排序
                </div>
              </div>

              {/* 操作列 */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-espresso-light/40 mr-2">#{items.indexOf(item) + 1}</span>
                  <button onClick={() => moveBanner(item.id, "first")} disabled={items.indexOf(item) === 0} className="text-xs text-espresso-light/40 hover:text-espresso px-1.5 py-1 rounded disabled:opacity-20 transition-all" title="移到最前">⇤</button>
                  <button onClick={() => moveBanner(item.id, "up")} disabled={items.indexOf(item) === 0} className="text-xs text-espresso-light/40 hover:text-espresso px-1.5 py-1 rounded disabled:opacity-20 transition-all" title="上移">↑</button>
                  <button onClick={() => moveBanner(item.id, "down")} disabled={items.indexOf(item) === items.length - 1} className="text-xs text-espresso-light/40 hover:text-espresso px-1.5 py-1 rounded disabled:opacity-20 transition-all" title="下移">↓</button>
                  <button onClick={() => moveBanner(item.id, "last")} disabled={items.indexOf(item) === items.length - 1} className="text-xs text-espresso-light/40 hover:text-espresso px-1.5 py-1 rounded disabled:opacity-20 transition-all" title="移到最後">⇥</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-1.5 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all">
                    編輯
                  </button>
                  <button onClick={() => handleDelete(item)} className="text-xs text-rose/60 hover:text-rose px-3 py-1.5 ring-1 ring-rose/20 rounded-md hover:bg-rose/5 transition-all">
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 關於我們管理 ──────────────────── */

function AboutManager() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings?key=about")
      .then((res) => res.json())
      .then((data) => setContent(data.value || ""))
      .catch(() => setError("無法載入內容"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about", value: content }),
      });
      if (!res.ok) {
        setError("儲存失敗");
        setSubmitting(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("網路連線失敗，請稍後再試");
    }
    setSubmitting(false);
  }

  if (loading) {
    return <p className="text-espresso-light/50 text-center py-16 text-sm">載入中...</p>;
  }

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>}
      {saved && <p className="text-sage text-sm font-medium mb-4">已儲存！</p>}
      <h2 className="font-serif text-lg font-bold text-espresso mb-6">編輯「關於我們」</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 space-y-5">
        <div>
          <label htmlFor="about-content" className="block text-sm font-medium text-espresso mb-2">
            內容（支援換行）
          </label>
          <textarea
            id="about-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="input-field"
            placeholder="輸入關於我們的介紹..."
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary-sm">
          {submitting ? "儲存中..." : "儲存"}
        </button>
      </form>
    </div>
  );
}


interface StoryBlock {
  id: number;
  sortOrder: number;
  heading: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

function StoryManager() {
  const [items, setItems] = useState<StoryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  async function loadItems() {
    try {
      const res = await fetch("/api/admin/story");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError("無法載入故事內容");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setHeading("");
    setContent("");
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(item: StoryBlock) {
    setHeading(item.heading);
    setContent(item.content);
    setImageUrl(item.imageUrl);
    setEditingId(item.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const url = editingId
      ? `/api/admin/story/${editingId}`
      : "/api/admin/story";
    const method = editingId ? "PUT" : "POST";

    const sortOrder = editingId
      ? items.find(i => i.id === editingId)?.sortOrder ?? items.length
      : items.length;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading,
          content,
          imageUrl,
          sortOrder,
          ...(!editingId && { isPublished: true }),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "儲存失敗");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("網路連線失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    resetForm();
    loadItems();
  }

  // 拖曳排序
  function handleDragStart(id: number) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    setDragOverId(id);
  }

  async function handleDrop(targetId: number) {
    if (dragId === null || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const oldIndex = items.findIndex(i => i.id === dragId);
    const newIndex = items.findIndex(i => i.id === targetId);
    if (oldIndex === -1 || newIndex === -1) return;

    // 重新排列
    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // 即時更新 UI
    setItems(reordered);
    setDragId(null);
    setDragOverId(null);

    // 批次更新 sortOrder 到後端
    await Promise.all(
      reordered.map((item, i) =>
        fetch(`/api/admin/story/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    );
    loadItems();
  }

  async function handleDelete(item: StoryBlock) {
    if (!window.confirm("確定要刪除此段落嗎？此操作無法復原。")) return;
    try {
      await fetch(`/api/admin/story/${item.id}`, { method: "DELETE" });
      loadItems();
    } catch {
      setError("刪除失敗，請重試");
    }
  }

  if (loading) {
    return (
      <p className="text-espresso-light/50 text-center py-16 text-sm" role="status">
        載入中...
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-espresso">故事段落</h2>
          {items.length > 1 && <p className="text-xs text-espresso-light/40 mt-1">拖曳卡片可調整順序</p>}
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary-sm"
        >
          + 新增段落
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 mb-8 space-y-5"
        >
          <h3 className="font-serif font-bold text-espresso">
            {editingId ? "編輯段落" : "新增段落"}
          </h3>
          <div>
            <label htmlFor="story-heading" className="block text-sm font-medium text-espresso mb-2">
              標題（選填）
            </label>
            <input
              id="story-heading"
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="input-field"
            />
          </div>
          <ImageUploader value={imageUrl} onChange={setImageUrl} label="故事圖片（選填）" />
          <div>
            <label htmlFor="story-content" className="block text-sm font-medium text-espresso mb-2">
              內容
            </label>
            <textarea
              id="story-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="input-field"
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary-sm">
              {submitting ? "儲存中..." : editingId ? "儲存" : "新增"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      )}

      {items.length === 0 && !showForm ? (
        <div className="text-center py-24">
          <p className="text-espresso-light/50 text-sm">尚無段落，點擊上方按鈕新增</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.filter((item) => item.id !== editingId).map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={`bg-white rounded-lg ring-1 p-4 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                dragOverId === item.id && dragId !== item.id ? "ring-rose ring-2" : "ring-linen-dark/60"
              } ${dragId === item.id ? "opacity-50" : ""} ${!item.isPublished ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.heading || "故事圖片"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    {item.heading && (
                      <h3 className="font-serif font-bold text-espresso text-sm truncate">
                        {item.heading}
                      </h3>
                    )}
                    <p className="text-xs text-espresso-light/50 line-clamp-2 mt-0.5">
                      {item.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${item.isPublished ? "bg-sage/15 text-sage" : "bg-espresso-light/10 text-espresso-light/50"}`}>
                    {item.isPublished ? "已發佈" : "隱藏"}
                  </span>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/story/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !item.isPublished }) });
                      loadItems();
                    }}
                    className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-2 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all duration-200"
                  >
                    {item.isPublished ? "隱藏" : "發佈"}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-2 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all duration-200"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs text-rose/60 hover:text-rose px-3 py-2 ring-1 ring-rose/20 rounded-md hover:bg-rose/5 transition-all duration-200"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 訂單編輯表單 ──────────────────── */

function OrderEditForm({
  order,
  onSaved,
  onCancel,
}: {
  order: Order;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const initialItems: OrderItem[] = order.items && order.items.length > 0
    ? order.items
    : [
        ...order.combos.map((c) => ({
          productId: c.id,
          name: `${c.name}（${c.items.join("、")}）`,
          group: "",
          quantity: c.quantity,
          price: c.price,
        })),
        ...order.addons.map((a) => ({
          productId: a.id,
          name: a.name,
          group: "",
          quantity: a.quantity,
          price: a.price,
        })),
      ];

  const [customerName, setCustomerName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.phone);
  const [email, setEmail] = useState(order.email || "");
  const [address, setAddress] = useState(order.address);
  const [notes, setNotes] = useState(order.notes || "");
  const [deliveryMethod, setDeliveryMethod] = useState(order.deliveryMethod || "shipping");
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod || "cash");
  const [transferLast5, setTransferLast5] = useState(order.transferLast5 || "");
  const [status, setStatus] = useState(order.status || "pending");
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [shippingFee, setShippingFee] = useState(order.shippingFee ?? 0);
  const [discountAmount, setDiscountAmount] = useState(order.discountAmount ?? 0);
  const [totalOverride, setTotalOverride] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const autoTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const finalTotal = totalOverride.trim() === "" ? autoTotal : Number(totalOverride) || 0;

  function updateQty(idx: number, qty: number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(0, qty) } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          address,
          notes,
          deliveryMethod,
          paymentMethod,
          transferLast5,
          status,
          items: items.filter((i) => i.quantity > 0),
          shippingFee,
          discountAmount,
          total: finalTotal,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "儲存失敗");
        setSaving(false);
        return;
      }
      setSaving(false);
      onSaved();
    } catch {
      setError("網路連線失敗");
      setSaving(false);
    }
  }

  const labelClass = "block text-xs font-semibold text-espresso-light/60 mb-1";
  const inputClass =
    "w-full px-3 py-2 rounded-md text-sm text-espresso bg-linen/60 ring-1 ring-linen-dark/50 focus:ring-rose outline-none";

  return (
    <div className="space-y-4">
      {error && <p className="text-rose text-sm font-medium">{error}</p>}

      {/* 聯絡資料 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>姓名</label>
          <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>電話</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Email</label>
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>地址</label>
          <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      {/* 選項 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>取貨方式</label>
          <select className={inputClass} value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
            <option value="shipping">郵寄</option>
            <option value="pickup">面交</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>付款方式</label>
          <select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">現金</option>
            <option value="transfer">匯款</option>
          </select>
        </div>
        {paymentMethod === "transfer" && (
          <div>
            <label className={labelClass}>匯款後五碼</label>
            <input
              className={inputClass}
              inputMode="numeric"
              maxLength={5}
              value={transferLast5}
              onChange={(e) => setTransferLast5(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="匯款帳號後五碼"
            />
          </div>
        )}
        <div>
          <label className={labelClass}>狀態</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 品項 */}
      <div>
        <p className={labelClass}>品項</p>
        {items.length === 0 ? (
          <p className="text-xs text-espresso-light/40 py-2">無品項</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-linen/40 rounded-md px-3 py-2 ring-1 ring-linen-dark/30">
                <span className="flex-1 text-sm text-espresso truncate">{item.name}</span>
                <span className="text-xs text-espresso-light/50 tabular-nums">NT$ {item.price}</span>
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) => updateQty(i, Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-md text-sm text-espresso bg-white ring-1 ring-linen-dark/50 focus:ring-rose outline-none text-center"
                />
                <button
                  onClick={() => removeItem(i)}
                  className="text-xs text-rose/60 hover:text-rose px-2 py-1 transition-colors"
                  title="移除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 金額 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>折扣金額</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={discountAmount}
            onChange={(e) => setDiscountAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>運費</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={shippingFee}
            onChange={(e) => setShippingFee(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>自動總計</label>
          <p className="text-sm text-espresso-light/70 py-2 tabular-nums">NT$ {autoTotal}</p>
        </div>
        <div>
          <label className={labelClass}>覆寫總計（選填）</label>
          <input
            type="number"
            min={0}
            placeholder={String(autoTotal)}
            className={inputClass}
            value={totalOverride}
            onChange={(e) => setTotalOverride(e.target.value)}
          />
        </div>
      </div>

      {/* 備註 */}
      <div>
        <label className={labelClass}>備註</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-espresso">
          最終總計：<span className="font-bold text-rose">NT$ {finalTotal}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="text-xs px-4 py-2 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-4 py-2 rounded-md bg-espresso text-linen hover:bg-espresso/90 transition-all disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [campaignList, setCampaignList] = useState<{ id: number; name: string }[]>([]);
  const [filterCampaignId, setFilterCampaignId] = useState<number | "all">("all");
  const [subTab, setSubTab] = useState<"orders" | "analytics" | "modify-requests">("orders");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  async function reloadOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  }

  async function handleDeleteOrder(order: Order) {
    if (!window.confirm(`確定要刪除訂單 #${order.id}（${order.customerName}）嗎？\n此操作無法復原。`)) return;
    const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert("刪除失敗，請重試");
      return;
    }
    if (expandedId === order.id) setExpandedId(null);
    if (editingId === order.id) setEditingId(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(order.id);
      return next;
    });
    await reloadOrders();
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete(ids: number[]) {
    if (ids.length === 0) return;
    if (!window.confirm(`確定要刪除勾選的 ${ids.length} 筆訂單嗎？\n此操作無法復原。`)) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/admin/orders/${id}`, { method: "DELETE" }))
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        window.alert(`已刪除 ${ids.length - failed} 筆，有 ${failed} 筆刪除失敗`);
      }
      setSelectedIds(new Set());
      if (expandedId !== null && ids.includes(expandedId)) setExpandedId(null);
      if (editingId !== null && ids.includes(editingId)) setEditingId(null);
      await reloadOrders();
    } finally {
      setBulkDeleting(false);
    }
  }

  // 修改申請
  const [modifyRequests, setModifyRequests] = useState<ModifyRequest[]>([]);
  const [modifyLoading, setModifyLoading] = useState(false);

  function loadModifyRequests() {
    setModifyLoading(true);
    fetch("/api/admin/modify-requests")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setModifyRequests(data); })
      .catch(() => {})
      .finally(() => setModifyLoading(false));
  }

  async function toggleHandled(id: number, handled: boolean) {
    await fetch("/api/admin/modify-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handled }),
    });
    setModifyRequests((prev) => prev.map((r) => r.id === id ? { ...r, handled } : r));
  }

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("/api/admin/campaigns")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCampaignList(data.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }))); })
      .catch(() => {});

    // 載入修改申請（用於顯示未處理數量）
    loadModifyRequests();
  }, []);

  const filteredOrders = filterCampaignId === "all"
    ? orders
    : orders.filter((o) => o.campaignId === filterCampaignId);

  // 取得訂單的品項列表（新格式 items 或 legacy combos+addons）
  function getOrderItems(o: Order): { name: string; quantity: number; price: number }[] {
    if (o.items && o.items.length > 0) return o.items;
    const legacy = [
      ...o.combos.map((c) => ({ name: `${c.name}（${c.items.join("、")}）`, quantity: c.quantity, price: c.price })),
      ...o.addons.map((a) => ({ name: a.name, quantity: a.quantity, price: a.price })),
    ];
    return legacy;
  }

  function exportToExcel() {
    const data = filteredOrders;
    const header = ["訂單編號", "姓名", "電話", "Email", "地址", "取貨方式", "品項明細", "品項數量", "備註", "總金額", "建立時間"];
    const rows = data.map((o) => {
      const items = getOrderItems(o);
      return [
        o.id, o.customerName, o.phone, o.email, o.address,
        o.deliveryMethod === "pickup" ? "面交" : "郵寄",
        items.map((i) => `${i.name} ×${i.quantity} $${i.price}`).join("; "),
        items.reduce((s, i) => s + i.quantity, 0),
        o.notes, o.total,
        formatDateTimeTW(o.createdAt),
      ];
    });

    const totalAmount = data.reduce((s, o) => s + o.total, 0);
    const shippingCount = data.filter((o) => o.deliveryMethod === "shipping").length;
    const pickupCount = data.filter((o) => o.deliveryMethod === "pickup").length;

    const itemStats: Record<string, number> = {};
    data.forEach((o) => getOrderItems(o).forEach((i) => {
      itemStats[i.name] = (itemStats[i.name] || 0) + i.quantity;
    }));

    const statsRows = [
      [], ["═══ 統計摘要 ═══"],
      ["總訂單數", data.length], ["總金額", `NT$ ${totalAmount}`],
      ["郵寄", shippingCount, "面交", pickupCount],
      [], ["═══ 各品項銷量 ═══"],
      ...Object.entries(itemStats).map(([name, qty]) => [name, qty]),
    ];

    const allRows = [header, ...rows, ...statsRows];
    const csv = allRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `訂單_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  return (
    <div>
      {/* 子分頁切換 */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "orders" as const, label: "訂單列表" },
          { key: "analytics" as const, label: "數據分析" },
          { key: "modify-requests" as const, label: "修改申請" },
        ]).map((t) => {
          const unhandled = t.key === "modify-requests" ? modifyRequests.filter((r) => !r.handled).length : 0;
          return (
          <button
            key={t.key}
            onClick={() => {
              setSubTab(t.key);
              if (t.key === "modify-requests" && modifyRequests.length === 0) loadModifyRequests();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
              subTab === t.key
                ? "bg-espresso text-linen"
                : "text-espresso-light ring-1 ring-linen-dark hover:ring-espresso-light hover:text-espresso"
            }`}
          >
            {t.label}
            {unhandled > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-rose text-white text-[0.65rem] font-bold flex items-center justify-center">{unhandled}</span>
            )}
          </button>
          );
        })}
        {/* 活動篩選（兩個子頁共用）*/}
        {campaignList.length > 0 && (
          <select
            value={filterCampaignId}
            onChange={(e) => setFilterCampaignId(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-2 rounded-md text-sm text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none ml-auto"
          >
            <option value="all">全部活動</option>
            {campaignList.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ─── 數據分析 ─── */}
      {subTab === "analytics" && (
        <OrderAnalytics orders={filteredOrders} campaigns={campaignList} />
      )}

      {/* ─── 修改申請 ─── */}
      {subTab === "modify-requests" && (
        <div>
          <h2 className="font-serif text-lg font-bold text-espresso mb-4">
            修改申請 <span className="text-espresso-light/40 font-normal text-sm">({modifyRequests.filter((r) => !r.handled).length} 筆未處理)</span>
          </h2>

          {modifyLoading ? (
            <p className="text-espresso-light/50 py-8 text-center">載入中...</p>
          ) : modifyRequests.length === 0 ? (
            <p className="text-espresso-light/30 py-12 text-center">尚無修改申請</p>
          ) : (
            <div className="space-y-3">
              {modifyRequests.map((r) => (
                <div key={r.id} className={`bg-white rounded-lg ring-1 p-5 transition-all ${r.handled ? "ring-linen-dark/30 opacity-60" : "ring-rose/30 shadow-sm"}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-espresso" style={{ fontFamily: "var(--font-display)" }}>訂單 #{r.orderId}</span>
                        <span className="text-sm text-espresso-light/50">{r.customerName} / {r.phone}{r.orderEmail ? ` / ${r.orderEmail}` : ""}</span>
                        {r.campaignName && <span className="text-xs text-espresso-light/40">({r.campaignName})</span>}
                      </div>
                      <p className="text-xs text-espresso-light/40 mt-0.5">{formatDateTimeTW(r.createdAt)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${r.handled ? "bg-sage/15 text-sage" : "bg-rose/10 text-rose"}`}>
                      {r.handled ? "已處理" : "未處理"}
                    </span>
                  </div>

                  {/* 原訂單品項 */}
                  <div className="rounded-md bg-linen/50 p-3 mb-3 ring-1 ring-linen-dark/20">
                    <p className="text-xs text-espresso-light/40 mb-1.5">原訂單</p>
                    {r.orderItems.map((item: { name: string; quantity: number; price: number }, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-espresso-light/70">{item.name} × {item.quantity}</span>
                        <span className="text-espresso">NT$ {item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="mt-1.5 pt-1.5 flex justify-between text-sm font-medium" style={{ borderTop: "1px dashed rgba(30,15,8,0.1)" }}>
                      <span className="text-espresso">合計</span>
                      <span className="text-rose">NT$ {r.orderTotal}</span>
                    </div>
                  </div>

                  {/* 修改內容 */}
                  <div className="rounded-md bg-rose/[0.03] p-3 mb-3 ring-1 ring-rose/15">
                    <p className="text-xs text-rose/60 mb-1">修改內容</p>
                    <p className="text-espresso text-sm whitespace-pre-wrap">{r.message}</p>
                  </div>

                  {/* 操作按鈕 */}
                  <button
                    onClick={() => toggleHandled(r.id, !r.handled)}
                    className={`text-xs px-4 py-1.5 rounded-md transition-all ${
                      r.handled
                        ? "ring-1 ring-linen-dark text-espresso-light hover:text-espresso"
                        : "bg-sage text-white hover:bg-sage/80"
                    }`}
                  >
                    {r.handled ? "標為未處理" : "標為已處理"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 訂單列表 ─── */}
      {subTab === "orders" && (<>
      {(() => {
        const visibleIds = filteredOrders.map((o) => o.id);
        const visibleSelectedCount = visibleIds.filter((id) => selectedIds.has(id)).length;
        const allSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;
        const someSelected = visibleSelectedCount > 0 && !allSelected;

        return (
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <h2 className="font-serif text-lg font-bold text-espresso">
              訂單列表 <span className="text-espresso-light/40 font-normal text-sm">({filteredOrders.length} 筆)</span>
            </h2>
            <div className="flex items-center gap-3">
              {filteredOrders.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-espresso-light cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={() => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (allSelected) {
                          visibleIds.forEach((id) => next.delete(id));
                        } else {
                          visibleIds.forEach((id) => next.add(id));
                        }
                        return next;
                      });
                    }}
                    className="w-4 h-4 accent-rose cursor-pointer"
                  />
                  全選
                </label>
              )}
              {selectedIds.size > 0 && (
                <button
                  onClick={() => handleBulkDelete([...selectedIds])}
                  disabled={bulkDeleting}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-rose text-white hover:bg-rose-dark disabled:opacity-50"
                >
                  {bulkDeleting ? "刪除中..." : `刪除選取（${selectedIds.size}）`}
                </button>
              )}
              <button
                onClick={exportToExcel}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all text-espresso-light ring-1 ring-linen-dark hover:ring-espresso-light hover:text-espresso"
              >
                匯出 Excel
              </button>
            </div>
          </div>
        );
      })()}

      {/* 統計面板 */}
      {filteredOrders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 text-center">
            <p className="text-2xl font-bold text-espresso">{filteredOrders.length}</p>
            <p className="text-xs text-espresso-light/50 mt-1">總訂單數</p>
          </div>
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 text-center">
            <p className="text-2xl font-bold text-rose">NT$ {filteredOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}</p>
            <p className="text-xs text-espresso-light/50 mt-1">總金額</p>
          </div>
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 text-center">
            <p className="text-2xl font-bold text-honey">{filteredOrders.reduce((s, o) => s + getOrderItems(o).reduce((is, i) => is + i.quantity, 0), 0)}</p>
            <p className="text-xs text-espresso-light/50 mt-1">品項總數</p>
          </div>
          <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 text-center">
            <p className="text-2xl font-bold text-sage">{filteredOrders.filter((o) => o.deliveryMethod === "shipping").length} / {filteredOrders.filter((o) => o.deliveryMethod === "pickup").length}</p>
            <p className="text-xs text-espresso-light/50 mt-1">郵寄 / 面交</p>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <p className="text-espresso-light/40 text-sm py-8 text-center">目前共 0 筆訂單</p>
      ) : (
        <div className="space-y-3">
          {[...filteredOrders].reverse().map((order) => {
            const isExpanded = expandedId === order.id;
            const isSelected = selectedIds.has(order.id);
            return (
              <div
                key={order.id}
                className={`bg-white rounded-lg ring-1 overflow-hidden transition-all ${
                  isSelected ? "ring-rose/50 bg-rose/[0.02]" : "ring-linen-dark/60"
                }`}
              >
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-linen/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelected(order.id)}
                    className="w-4 h-4 accent-rose cursor-pointer shrink-0"
                    aria-label={`選取訂單 #${order.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-espresso text-sm">#{order.id}</span>
                      <span className="text-espresso text-sm">{order.customerName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-sage/15 text-sage">
                        已下單
                      </span>
                      <span className="text-espresso-light/30 text-xs">
                        {order.deliveryMethod === "pickup" ? "面交" : "郵寄"}
                      </span>
                    </div>
                    <p className="text-espresso-light/40 text-xs mt-0.5">
                      {formatDateTimeTW(order.createdAt)} · {order.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-rose font-bold text-sm">NT$ {order.total}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform text-espresso-light/30 ${isExpanded ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-linen-dark/30 pt-3">
                    {editingId === order.id ? (
                      <OrderEditForm
                        order={order}
                        onSaved={async () => {
                          setEditingId(null);
                          await reloadOrders();
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        {(() => {
                          const items = getOrderItems(order);
                          if (items.length > 0) {
                            return (
                              <div className="mb-3">
                                <p className="text-xs font-bold text-espresso-light/40 tracking-wider uppercase mb-1.5">品項</p>
                                {items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm py-0.5">
                                    <span className="text-espresso-light">{item.name} × {item.quantity}</span>
                                    <span className="text-espresso font-medium tabular-nums">NT$ {item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="mb-3 text-sm text-espresso-light/60 space-y-0.5">
                          <p>地址：{order.address}</p>
                          {order.email && <p>Email：{order.email}</p>}
                          {order.paymentMethod === "transfer" && (
                            <p>匯款後五碼：{order.transferLast5 || <span className="text-rose/70">尚未填寫</span>}</p>
                          )}
                          {order.notes && <p>備註：{order.notes}</p>}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setEditingId(order.id)}
                            className="text-xs px-4 py-2 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="text-xs px-4 py-2 rounded-md ring-1 ring-rose/25 text-rose/80 hover:text-rose hover:bg-rose/5 transition-all"
                          >
                            刪除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>)}
    </div>
  );
}

/* ═══ 設定管理 ═══ */

function SettingsManager() {
  const [notifyEmails, setNotifyEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [bankInfoSaved, setBankInfoSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/site-settings?key=order_notify_emails").then((r) => r.json()),
      fetch("/api/site-settings?key=bank_transfer_info").then((r) => r.json()),
    ]).then(([emailData, bankData]) => {
      if (emailData.value) {
        try { setNotifyEmails(JSON.parse(emailData.value)); } catch { /* ignore */ }
      }
      if (bankData.value) { setBankInfo(bankData.value); setBankInfoSaved(bankData.value); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function saveEmails(emails: string[]) {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "order_notify_emails", value: JSON.stringify(emails) }),
      });
      if (!res.ok) { setError("儲存失敗"); setSaving(false); return; }
      setNotifyEmails(emails);
      setSuccess("已儲存");
      setTimeout(() => setSuccess(""), 2000);
    } catch { setError("網路連線失敗"); }
    setSaving(false);
  }

  function addEmail() {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Email 格式不正確"); return; }
    if (notifyEmails.includes(email)) { setError("此信箱已存在"); return; }
    setError("");
    const updated = [...notifyEmails, email];
    setNewEmail("");
    saveEmails(updated);
  }

  function removeEmail(index: number) {
    const updated = notifyEmails.filter((_, i) => i !== index);
    saveEmails(updated);
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  const inputClass = "w-full px-3 py-2 rounded-md text-lg text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none";

  return (
    <div>
      <h2 className="font-serif text-lg font-bold text-espresso mb-6">設定</h2>

      {error && <p className="text-rose text-sm font-medium mb-4">{error}</p>}
      {success && <p className="text-sage text-sm font-medium mb-4">{success}</p>}

      <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5">
        <h3 className="font-serif font-bold text-espresso mb-1">訂單通知信箱</h3>
        <p className="text-espresso-light/50 text-sm mb-4">用戶提交訂單修改時，會同時通知以下所有信箱</p>

        {notifyEmails.length > 0 && (
          <div className="space-y-2 mb-4">
            {notifyEmails.map((email, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md bg-linen/50 ring-1 ring-linen-dark/30">
                <span className="text-espresso text-sm">{email}</span>
                <button
                  onClick={() => removeEmail(i)}
                  disabled={saving}
                  className="text-rose/40 hover:text-rose text-xs transition-colors disabled:opacity-50"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        )}

        {notifyEmails.length === 0 && (
          <p className="text-espresso-light/30 text-sm mb-4 py-3 text-center rounded-md bg-linen/30">尚未設定通知信箱</p>
        )}

        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
            className={`${inputClass} flex-1`}
            placeholder="輸入 Email 信箱"
          />
          <button
            onClick={addEmail}
            disabled={saving || !newEmail.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all shrink-0 disabled:opacity-40"
          >
            {saving ? "儲存中..." : "新增"}
          </button>
        </div>
      </div>

      {/* 匯款資訊 */}
      <div className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5 mt-6">
        <h3 className="font-serif font-bold text-espresso mb-1">匯款資訊</h3>
        <p className="text-espresso-light/50 text-sm mb-4">選擇匯款付款時，消費者會看到以下資訊</p>
        <textarea
          value={bankInfo}
          onChange={(e) => setBankInfo(e.target.value)}
          rows={4}
          className={`${inputClass} resize-none mb-3`}
          placeholder={"例：\n銀行：台灣銀行（004）\n帳號：012-345-678-901\n戶名：Jam for Love"}
        />
        <button
          onClick={async () => {
            setSaving(true); setError(""); setSuccess("");
            try {
              const res = await fetch("/api/admin/site-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "bank_transfer_info", value: bankInfo }),
              });
              if (!res.ok) { setError("儲存失敗"); } else { setBankInfoSaved(bankInfo); setSuccess("已儲存"); setTimeout(() => setSuccess(""), 2000); }
            } catch { setError("網路連線失敗"); }
            setSaving(false);
          }}
          disabled={saving || bankInfo === bankInfoSaved}
          className="px-4 py-2 rounded-md text-sm font-medium ring-1 ring-linen-dark text-espresso-light hover:text-espresso transition-all disabled:opacity-40"
        >
          {saving ? "儲存中..." : "儲存"}
        </button>
      </div>
    </div>
  );
}
