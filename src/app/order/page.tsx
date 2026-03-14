"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setError("Failed to load products"));
  }, []);

  function updateQuantity(product: Product, quantity: number) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (quantity <= 0) {
        return prev.filter((item) => item.productId !== product.id);
      }
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ];
    });
  }

  function getQuantity(productId: number) {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      setError("請至少選擇一項產品");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone,
        address,
        notes,
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-4">
            訂單已送出！
          </h1>
          <p className="text-gray-600 mb-8">
            感謝您的訂購，我們會盡快處理您的訂單。
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/my-orders")}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              查看我的訂單
            </button>
            <button
              onClick={() => router.push("/")}
              className="border border-amber-600 text-amber-700 px-6 py-2 rounded-lg hover:bg-amber-50 transition"
            >
              回到首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">訂購果醬</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 產品選擇 */}
        <div>
          <h2 className="text-xl font-bold text-amber-800 mb-4">選擇產品</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">
                    {product.name}
                  </h3>
                  <p className="text-amber-700 font-medium">
                    NT$ {product.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(product, getQuantity(product.id) - 1)
                    }
                    className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {getQuantity(product.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(product, getQuantity(product.id) + 1)
                    }
                    className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                目前沒有可訂購的產品
              </p>
            )}
          </div>

          {/* 小計 */}
          {cart.length > 0 && (
            <div className="mt-6 bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-amber-900 mb-2">購物清單</h3>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>NT$ {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-bold text-amber-900">
                <span>總計</span>
                <span>NT$ {total}</span>
              </div>
            </div>
          )}
        </div>

        {/* 收件資料 */}
        <div>
          <h2 className="text-xl font-bold text-amber-800 mb-4">收件資料</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                收件人姓名
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                聯絡電話
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                收件地址
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="有任何特殊需求請在此說明"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition font-medium text-lg"
            >
              {loading ? "送出中..." : `確認訂購 (NT$ ${total})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
