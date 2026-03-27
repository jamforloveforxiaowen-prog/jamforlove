"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  productName: string | null;
}

interface Order {
  id: number;
  userId: number;
  username: string | null;
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
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

type Tab = "products" | "orders" | "fundraise" | "banners" | "news" | "about" | "story";

const TABS: { key: Tab; label: string }[] = [
  { key: "products", label: "產品管理" },
  { key: "orders", label: "訂單管理" },
  { key: "fundraise", label: "預購表單" },
  { key: "banners", label: "Banner 管理" },
  { key: "news", label: "最新消息" },
  { key: "about", label: "關於我們" },
  { key: "story", label: "果醬的故事" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");

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

      {tab === "products" && <ProductManager />}
      {tab === "orders" && <OrderManager />}
      {tab === "fundraise" && <FundraiseManager />}
      {tab === "banners" && <BannerManager />}
      {tab === "news" && <NewsManager />}
      {tab === "about" && <AboutManager />}
      {tab === "story" && <StoryManager />}
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

  async function toggleActive(product: Product) {
    const action = product.isActive ? "下架" : "上架";
    if (!window.confirm(`確定要${action}「${product.name}」嗎？`)) return;

    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      loadProducts();
    } catch {
      setError(`${action}失敗，請重試`);
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">
          產品列表
        </h2>
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
          <div>
            <label htmlFor="admin-imageUrl" className="block text-sm font-medium text-espresso mb-2">
              圖片網址
            </label>
            <input
              id="admin-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/jam.jpg"
            />
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="預覽"
                width={80}
                height={80}
                className="mt-3 w-20 h-20 object-cover rounded-md ring-1 ring-linen-dark/60"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
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

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 flex items-center justify-between transition-opacity duration-200 ${
              !product.isActive ? "opacity-40" : ""
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
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
                  {!product.isActive && (
                    <span className="ml-2 text-xs text-rose font-sans font-normal">
                      已下架
                    </span>
                  )}
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
                onClick={() => toggleActive(product)}
                className={`text-xs px-3 py-2 rounded-md ring-1 transition-all duration-200 ${
                  product.isActive
                    ? "text-rose ring-rose/20 hover:bg-rose/5"
                    : "text-sage ring-sage/20 hover:bg-sage/5"
                }`}
              >
                {product.isActive ? "下架" : "上架"}
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
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState("");

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
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(item: BannerItem) {
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setImageUrl(item.imageUrl);
    setSortOrder(item.sortOrder);
    setEditingId(item.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

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

  async function toggleActive(item: BannerItem) {
    const action = item.isActive ? "隱藏" : "顯示";
    if (!window.confirm(`確定要${action}此 Banner 嗎？`)) return;
    try {
      await fetch(`/api/admin/banners/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      loadItems();
    } catch {
      setError(`${action}失敗，請重試`);
    }
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

  if (loading) {
    return <p className="text-espresso-light/50 text-center py-16 text-sm">載入中...</p>;
  }

  return (
    <div>
      {error && <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">Banner 列表</h2>
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
            <label htmlFor="banner-title" className="block text-sm font-medium text-espresso mb-2">
              標題文字
            </label>
            <input
              id="banner-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="例：用愛製作，用心傳遞"
            />
          </div>
          <div>
            <label htmlFor="banner-subtitle" className="block text-sm font-medium text-espresso mb-2">
              副標題（選填）
            </label>
            <input
              id="banner-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="input-field"
              placeholder="例：最好的果醬來自最簡單的原料"
            />
          </div>
          <div>
            <label htmlFor="banner-imageUrl" className="block text-sm font-medium text-espresso mb-2">
              背景圖片網址
            </label>
            <input
              id="banner-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/banner.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <Image
                  src={imageUrl}
                  alt="預覽"
                  width={320}
                  height={120}
                  className="rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="banner-sortOrder" className="block text-sm font-medium text-espresso mb-2">
              排序（數字越小越前面）
            </label>
            <input
              id="banner-sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="input-field w-32"
            />
          </div>
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
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 transition-opacity duration-200 ${!item.isActive ? "opacity-40" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={120}
                    height={48}
                    className="rounded-lg object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif font-bold text-espresso text-sm truncate">
                    {item.title || "(無標題)"}
                    {!item.isActive && <span className="ml-2 text-xs text-rose font-sans font-normal">已隱藏</span>}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-espresso-light/50 truncate mt-0.5">{item.subtitle}</p>
                  )}
                  <p className="text-xs text-espresso-light/40 mt-1">排序：{item.sortOrder}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-2 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all duration-200">
                    編輯
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    className={`text-xs px-3 py-2 rounded-md ring-1 transition-all duration-200 ${item.isActive ? "text-rose ring-rose/20 hover:bg-rose/5" : "text-sage ring-sage/20 hover:bg-sage/5"}`}
                  >
                    {item.isActive ? "隱藏" : "顯示"}
                  </button>
                  <button onClick={() => handleDelete(item)} className="text-xs text-rose/60 hover:text-rose px-3 py-2 ring-1 ring-rose/20 rounded-md hover:bg-rose/5 transition-all duration-200">
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

/* ── 最新消息管理 ──────────────────── */

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
}

function NewsManager() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      const res = await fetch("/api/admin/news");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      setError("無法載入最新消息");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(item: NewsItem) {
    setTitle(item.title);
    setContent(item.content);
    setImageUrl(item.imageUrl || "");
    setEditingId(item.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const url = editingId
      ? `/api/admin/news/${editingId}`
      : "/api/admin/news";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl }),
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

  async function togglePublish(item: NewsItem) {
    const action = item.isPublished ? "取消發佈" : "發佈";
    if (!window.confirm(`確定要${action}「${item.title}」嗎？`)) return;
    try {
      await fetch(`/api/admin/news/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      loadItems();
    } catch {
      setError(`${action}失敗，請重試`);
    }
  }

  async function handleDelete(item: NewsItem) {
    if (!window.confirm(`確定要刪除「${item.title}」嗎？此操作無法復原。`)) return;
    try {
      await fetch(`/api/admin/news/${item.id}`, { method: "DELETE" });
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
        <h2 className="font-serif text-lg font-bold text-espresso">消息列表</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary-sm"
        >
          + 新增消息
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 mb-8 space-y-5"
        >
          <h3 className="font-serif font-bold text-espresso">
            {editingId ? "編輯消息" : "新增消息"}
          </h3>
          <div>
            <label htmlFor="news-title" className="block text-sm font-medium text-espresso mb-2">
              標題
            </label>
            <input
              id="news-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="news-content" className="block text-sm font-medium text-espresso mb-2">
              內容
            </label>
            <textarea
              id="news-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="news-imageUrl" className="block text-sm font-medium text-espresso mb-2">
              圖片網址（選填）
            </label>
            <input
              id="news-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <Image
                  src={imageUrl}
                  alt="預覽"
                  width={160}
                  height={100}
                  className="rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
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
          <p className="text-espresso-light/50 text-sm">尚無消息，點擊上方按鈕新增</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 transition-opacity duration-200 ${
                !item.isPublished ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif font-bold text-espresso text-sm truncate">
                    {item.title}
                    {!item.isPublished && (
                      <span className="ml-2 text-xs text-rose font-sans font-normal">未發佈</span>
                    )}
                  </h3>
                  <p className="text-xs text-espresso-light/50 line-clamp-2 mt-1">
                    {item.content}
                  </p>
                  <p className="text-xs text-espresso-light/40 mt-1">{item.createdAt}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-2 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all duration-200"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => togglePublish(item)}
                    className={`text-xs px-3 py-2 rounded-md ring-1 transition-all duration-200 ${
                      item.isPublished
                        ? "text-rose ring-rose/20 hover:bg-rose/5"
                        : "text-sage ring-sage/20 hover:bg-sage/5"
                    }`}
                  >
                    {item.isPublished ? "取消發佈" : "發佈"}
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
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");

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
    setSortOrder("0");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(item: StoryBlock) {
    setHeading(item.heading);
    setContent(item.content);
    setImageUrl(item.imageUrl);
    setSortOrder(String(item.sortOrder));
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

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading,
          content,
          imageUrl,
          sortOrder: Number(sortOrder),
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

  async function togglePublish(item: StoryBlock) {
    const action = item.isPublished ? "取消發佈" : "發佈";
    if (!window.confirm(`確定要${action}此段落嗎？`)) return;
    try {
      await fetch(`/api/admin/story/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      loadItems();
    } catch {
      setError(`${action}失敗，請重試`);
    }
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
        <h2 className="font-serif text-lg font-bold text-espresso">故事段落</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label htmlFor="story-sortOrder" className="block text-sm font-medium text-espresso mb-2">
                排序（數字越小越前面）
              </label>
              <input
                id="story-sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="story-imageUrl" className="block text-sm font-medium text-espresso mb-2">
              圖片網址（選填）
            </label>
            <input
              id="story-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/photo.jpg"
            />
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="預覽"
                width={80}
                height={80}
                className="mt-3 w-20 h-20 object-cover rounded-md ring-1 ring-linen-dark/60"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
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
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 transition-opacity duration-200 ${
                !item.isPublished ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <span className="text-xs text-espresso-light/40 font-mono shrink-0 pt-0.5">
                    #{item.sortOrder}
                  </span>
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
                        {!item.isPublished && (
                          <span className="ml-2 text-xs text-rose font-sans font-normal">未發佈</span>
                        )}
                      </h3>
                    )}
                    {!item.heading && !item.isPublished && (
                      <span className="text-xs text-rose font-sans">未發佈</span>
                    )}
                    <p className="text-xs text-espresso-light/50 line-clamp-2 mt-0.5">
                      {item.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-espresso-light/60 hover:text-espresso px-3 py-2 ring-1 ring-linen-dark rounded-md hover:ring-espresso-light transition-all duration-200"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => togglePublish(item)}
                    className={`text-xs px-3 py-2 rounded-md ring-1 transition-all duration-200 ${
                      item.isPublished
                        ? "text-rose ring-rose/20 hover:bg-rose/5"
                        : "text-sage ring-sage/20 hover:bg-sage/5"
                    }`}
                  >
                    {item.isPublished ? "取消發佈" : "發佈"}
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

function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data.reverse());
    } catch {
      setError("無法載入訂單列表");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId: number, status: string) {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch {
      setError("更新狀態失敗，請重試");
    }
  }

  if (loading) {
    return (
      <p className="text-espresso-light/50 text-center py-16 text-sm" role="status" aria-label="載入中">
        載入中...
      </p>
    );
  }

  if (!loading && error && orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>
        <button
          onClick={() => { setError(""); setLoading(true); loadOrders(); }}
          className="btn-primary-sm"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-lg font-bold text-espresso mb-6">
        訂單列表
      </h2>
      {error && (
        <p className="text-rose text-sm font-medium mb-4" role="alert">{error}</p>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-linen-dark/50 flex items-center justify-center mx-auto mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-espresso-light/40"
            >
              <path
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7l8 4M4 7v10l8 4m0-10v10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-serif text-espresso text-lg">
            還沒有訂單，等待第一位客人上門
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="font-bold text-espresso"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                    }}
                  >
                    #{order.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      STATUS_STYLES[order.status] || ""
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-xs text-espresso-light/40">
                    {order.createdAt}
                  </span>
                  <span className="text-xs text-espresso-light/40">
                    {order.username || `#${order.userId}`}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="input-field !w-auto !py-2 !px-3 !text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-sm space-y-1 min-w-0 break-words">
                  <p className="text-espresso">
                    <span className="text-espresso-light/50">收件人</span>{" "}
                    {order.customerName}
                  </p>
                  <p className="text-espresso">
                    <span className="text-espresso-light/50">電話</span>{" "}
                    {order.phone}
                  </p>
                  <p className="text-espresso break-words">
                    <span className="text-espresso-light/50">地址</span>{" "}
                    {order.address}
                  </p>
                  {order.notes && (
                    <p className="text-espresso-light/40 break-words">
                      備註：{order.notes}
                    </p>
                  )}
                </div>
                <div>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm py-0.5"
                    >
                      <span className="text-espresso-light/60">
                        {item.productName || `產品 #${item.productId}`} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="text-espresso font-medium">
                        NT$ {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-linen-dark/40 mt-2 pt-2 flex justify-between font-bold">
                    <span className="text-espresso text-sm">總計</span>
                    <span
                      className="text-rose"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      NT$ {order.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 預購表單管理 ──────────────────────── */

interface FundraiseOrder {
  id: number;
  userId: number;
  username: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deliveryMethod: string;
  combos: { id: number; name: string; items: string[]; quantity: number; price: number }[];
  addons: { id: number; name: string; quantity: number; price: number }[];
  notes: string;
  total: number;
  status: string;
  createdAt: string;
}

function FundraiseManager() {
  const [orders, setOrders] = useState<FundraiseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/fundraise")
      .then((res) => res.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/admin/fundraise/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  }

  if (loading) return <p className="text-espresso-light/50 py-8 text-center">載入中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-espresso">
          預購表單訂單 <span className="text-espresso-light/40 font-normal text-sm">({orders.length} 筆)</span>
        </h2>
      </div>

      {orders.length === 0 ? (
        <p className="text-espresso-light/40 text-sm py-8 text-center">目前沒有預購訂單</p>
      ) : (
        <div className="space-y-3">
          {[...orders].reverse().map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white rounded-lg ring-1 ring-linen-dark/60 overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-linen/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-espresso text-sm">#{order.id}</span>
                      <span className="text-espresso text-sm">{order.customerName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${STATUS_STYLES[order.status] || ""}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-espresso-light/30 text-xs">
                        {order.deliveryMethod === "pickup" ? "面交" : "郵寄"}
                      </span>
                    </div>
                    <p className="text-espresso-light/40 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleString("zh-TW")} · {order.phone}
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
                    {order.combos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-espresso-light/40 tracking-wider uppercase mb-1.5">組合</p>
                        {order.combos.map((c, i) => (
                          <div key={i} className="flex justify-between text-sm py-0.5">
                            <span className="text-espresso-light">{c.name}（{c.items.join("、")}）× {c.quantity}</span>
                            <span className="text-espresso font-medium tabular-nums">NT$ {c.price * c.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {order.addons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-espresso-light/40 tracking-wider uppercase mb-1.5">加購</p>
                        {order.addons.map((a, i) => (
                          <div key={i} className="flex justify-between text-sm py-0.5">
                            <span className="text-espresso-light">{a.name} × {a.quantity}</span>
                            <span className="text-espresso font-medium tabular-nums">NT$ {a.price * a.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mb-3 text-sm text-espresso-light/60 space-y-0.5">
                      <p>地址：{order.address}</p>
                      {order.email && <p>Email：{order.email}</p>}
                      {order.notes && <p>備註：{order.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-espresso-light/40">狀態：</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-sm border border-linen-dark rounded-md px-2 py-1 outline-none focus:border-rose bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
