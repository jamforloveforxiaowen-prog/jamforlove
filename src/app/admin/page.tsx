"use client";

import { useEffect, useState } from "react";

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

type Tab = "products" | "orders";

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

      <div className="flex gap-2 mb-10">
        <button
          onClick={() => setTab("products")}
          className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
            tab === "products"
              ? "bg-espresso text-linen"
              : "text-espresso-light ring-1 ring-linen-dark hover:ring-espresso-light hover:text-espresso"
          }`}
        >
          產品管理
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
            tab === "orders"
              ? "bg-espresso text-linen"
              : "text-espresso-light ring-1 ring-linen-dark hover:ring-espresso-light hover:text-espresso"
          }`}
        >
          訂單管理
        </button>
      </div>

      {tab === "products" ? <ProductManager /> : <OrderManager />}
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
          className="btn-primary !py-2 !px-5 !text-sm"
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
          className="btn-primary !py-2 !px-5 !text-sm"
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
              <label className="block text-sm font-medium text-espresso mb-2">
                名稱
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso mb-2">
                價格 (NT$)
              </label>
              <input
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
            <label className="block text-sm font-medium text-espresso mb-2">
              圖片網址
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/jam.jpg"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="預覽"
                className="mt-3 w-20 h-20 object-cover rounded-md ring-1 ring-linen-dark/60"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-espresso mb-2">
              說明
            </label>
            <textarea
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
            <button type="submit" disabled={submitting} className="btn-primary !py-2.5 !px-6">
              {submitting ? "儲存中..." : editingId ? "儲存" : "新增"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary !py-2.5 !px-6"
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
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-linen-dark flex items-center justify-center text-xl shrink-0">
                  🍓
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
          className="btn-primary !py-2 !px-5 !text-sm"
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
