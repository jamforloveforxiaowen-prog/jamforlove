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

type Tab = "products" | "orders";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">後台管理</h1>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "products"
              ? "bg-amber-600 text-white"
              : "bg-white text-amber-700 hover:bg-amber-50"
          }`}
        >
          產品管理
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "orders"
              ? "bg-amber-600 text-white"
              : "bg-white text-amber-700 hover:bg-amber-50"
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-800">產品列表</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm"
        >
          新增產品
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6 mb-6 space-y-4"
        >
          <h3 className="font-bold text-amber-900">
            {editingId ? "編輯產品" : "新增產品"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名稱
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                價格 (NT$)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              圖片網址
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="https://example.com/jam.jpg"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="預覽"
                className="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              說明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              {editingId ? "儲存" : "新增"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
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
            className={`bg-white rounded-xl shadow-sm p-4 flex items-center justify-between ${
              !product.isActive ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-xl shrink-0">
                  🍓
                </div>
              )}
              <div>
                <h3 className="font-semibold text-amber-900">
                  {product.name}
                  {!product.isActive && (
                    <span className="ml-2 text-xs text-red-500 font-normal">
                      (已下架)
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {product.description}
                </p>
                <p className="text-amber-700 font-medium">
                  NT$ {product.price}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(product)}
                className="text-sm text-amber-700 hover:text-amber-900 px-3 py-1 border border-amber-300 rounded-lg hover:bg-amber-50 transition"
              >
                編輯
              </button>
              <button
                onClick={() => toggleActive(product)}
                className={`text-sm px-3 py-1 rounded-lg border transition ${
                  product.isActive
                    ? "text-red-600 border-red-300 hover:bg-red-50"
                    : "text-green-600 border-green-300 hover:bg-green-50"
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
    return <p className="text-gray-500 text-center py-8">載入中...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-4">訂單列表</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">目前沒有訂單</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-amber-900">
                    訂單 #{order.id}
                  </span>
                  <span className="text-sm text-gray-400 ml-3">
                    {order.createdAt}
                  </span>
                  <span className="text-sm text-gray-500 ml-3">
                    會員：{order.username || `#${order.userId}`}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">收件人：</span>
                    {order.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">電話：</span>
                    {order.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">地址：</span>
                    {order.address}
                  </p>
                  {order.notes && (
                    <p className="text-sm text-gray-400 mt-1">
                      備註：{order.notes}
                    </p>
                  )}
                </div>
                <div>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.productName || `產品 #${item.productId}`} x{" "}
                        {item.quantity}
                      </span>
                      <span>NT$ {item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-amber-900">
                    <span>總計</span>
                    <span>NT$ {order.total}</span>
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
