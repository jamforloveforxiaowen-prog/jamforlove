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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-honey/20 text-honey",
  confirmed: "bg-leaf/10 text-leaf",
  shipped: "bg-berry/10 text-berry",
  completed: "bg-leaf/20 text-leaf",
};

type Tab = "products" | "orders";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-serif text-4xl font-bold text-warm-brown mb-8">
        後台管理
      </h1>

      <div className="flex gap-2 mb-10">
        <button
          onClick={() => setTab("products")}
          className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors ${
            tab === "products"
              ? "bg-warm-brown text-cream"
              : "text-warm-brown-light hover:text-warm-brown border-2 border-cream-dark"
          }`}
        >
          產品管理
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors ${
            tab === "orders"
              ? "bg-warm-brown text-cream"
              : "text-warm-brown-light hover:text-warm-brown border-2 border-cream-dark"
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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (Array.isArray(data)) setProducts(data);
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

    const body = { name, description, price: priceNum, imageUrl };

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "操作失敗");
      return;
    }

    resetForm();
    loadProducts();
  }

  async function toggleActive(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    loadProducts();
  }

  const inputClass =
    "w-full border-2 border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-bold text-warm-brown">
          產品列表
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-berry text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-berry-dark transition-colors"
        >
          + 新增產品
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-cream-dark p-6 mb-8 space-y-5"
        >
          <h3 className="font-serif font-bold text-warm-brown text-lg">
            {editingId ? "編輯產品" : "新增產品"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-2">
                名稱
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-2">
                價格 (NT$)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-brown mb-2">
              圖片網址
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
              placeholder="https://example.com/jam.jpg"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="預覽"
                className="mt-3 w-24 h-24 object-cover rounded-xl border-2 border-cream-dark"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-brown mb-2">
              說明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          {error && <p className="text-berry text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-berry text-white px-6 py-2.5 rounded-full font-semibold hover:bg-berry-dark transition-colors"
            >
              {editingId ? "儲存" : "新增"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border-2 border-cream-dark text-warm-brown-light px-6 py-2.5 rounded-full hover:border-warm-brown hover:text-warm-brown transition-colors"
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
            className={`bg-white rounded-2xl border-2 border-cream-dark p-4 flex items-center justify-between transition-opacity ${
              !product.isActive ? "opacity-40" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-cream-dark flex items-center justify-center text-2xl shrink-0">
                  🍓
                </div>
              )}
              <div>
                <h3 className="font-serif font-bold text-warm-brown">
                  {product.name}
                  {!product.isActive && (
                    <span className="ml-2 text-xs text-berry font-sans font-normal">
                      已下架
                    </span>
                  )}
                </h3>
                <p className="text-sm text-warm-brown-light line-clamp-1">
                  {product.description}
                </p>
                <p className="text-berry font-semibold">
                  NT$ {product.price}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(product)}
                className="text-sm text-warm-brown-light hover:text-warm-brown px-3 py-1.5 border-2 border-cream-dark rounded-full hover:border-warm-brown transition-colors"
              >
                編輯
              </button>
              <button
                onClick={() => toggleActive(product)}
                className={`text-sm px-3 py-1.5 rounded-full border-2 transition-colors ${
                  product.isActive
                    ? "text-berry border-berry/30 hover:bg-berry/5"
                    : "text-leaf border-leaf/30 hover:bg-leaf/5"
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

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data.reverse());
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId: number, status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  if (loading) {
    return (
      <p className="text-warm-brown-light text-center py-12">載入中...</p>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-warm-brown mb-6">
        訂單列表
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-warm-brown-light text-lg">目前沒有訂單</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-cream-dark p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-serif font-bold text-warm-brown">
                    #{order.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || ""}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-xs text-warm-brown-light">
                    {order.createdAt}
                  </span>
                  <span className="text-xs text-warm-brown-light">
                    {order.username || `#${order.userId}`}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border-2 border-cream-dark rounded-xl px-3 py-1.5 text-sm text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-sm space-y-1">
                  <p className="text-warm-brown">
                    <span className="text-warm-brown-light">收件人</span>{" "}
                    {order.customerName}
                  </p>
                  <p className="text-warm-brown">
                    <span className="text-warm-brown-light">電話</span>{" "}
                    {order.phone}
                  </p>
                  <p className="text-warm-brown">
                    <span className="text-warm-brown-light">地址</span>{" "}
                    {order.address}
                  </p>
                  {order.notes && (
                    <p className="text-warm-brown-light opacity-60">
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
                      <span className="text-warm-brown-light">
                        {item.productName || `產品 #${item.productId}`} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="text-warm-brown font-medium">
                        NT$ {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-cream-dark mt-2 pt-2 flex justify-between font-bold">
                    <span className="text-warm-brown">總計</span>
                    <span className="text-berry">NT$ {order.total}</span>
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
