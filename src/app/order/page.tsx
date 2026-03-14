"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
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
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = sessionStorage.getItem("jamforlove-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
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
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => setError("無法載入產品，請稍後再試"));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("jamforlove-cart", JSON.stringify(cart));
    } catch { /* storage full */ }
  }, [cart]);

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
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-6 animate-pop-in">🎉</p>
          <h1 className="font-serif text-3xl font-bold text-warm-brown mb-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            訂單已送出！
          </h1>
          <p className="text-warm-brown-light mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.35s" }}>
            感謝您的訂購，我們會盡快處理您的訂單。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <button
              onClick={() => router.push("/my-orders")}
              className="bg-berry text-white px-6 py-3 rounded-full font-semibold hover:bg-berry-dark hover:shadow-lg active:scale-[0.97] transition-all duration-200"
            >
              查看我的訂單
            </button>
            <button
              onClick={() => router.push("/")}
              className="border-2 border-cream-dark text-warm-brown px-6 py-3 rounded-full font-semibold hover:border-warm-brown active:scale-[0.97] transition-all duration-200"
            >
              回到首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="font-serif text-4xl font-bold text-warm-brown mb-10 animate-fade-up">
        訂購果醬
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* 產品選擇 */}
        <div className="lg:col-span-3">
          <h2 className="font-serif text-xl font-bold text-warm-brown mb-5">
            選擇產品
          </h2>
          <div className="space-y-3">
            {products.map((product) => {
              const qty = getQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className={`rounded-2xl p-4 flex items-center gap-4 transition-colors ${
                    qty > 0
                      ? "bg-berry/5 border-2 border-berry/20"
                      : "bg-white border-2 border-transparent"
                  }`}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-cream-dark flex items-center justify-center text-2xl shrink-0">
                      🍓
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-warm-brown">
                      {product.name}
                    </h3>
                    <p className="text-berry font-semibold">
                      NT$ {product.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product, qty - 1)}
                      className="w-10 h-10 rounded-full border-2 border-cream-dark text-warm-brown hover:border-berry hover:text-berry active:scale-90 transition-all duration-150 flex items-center justify-center font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-warm-brown tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product, qty + 1)}
                      className="w-10 h-10 rounded-full border-2 border-cream-dark text-warm-brown hover:border-berry hover:text-berry active:scale-90 transition-all duration-150 flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-warm-brown-light text-center py-12">
                目前沒有可訂購的產品
              </p>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-cream-dark animate-scale-in">
              <h3 className="font-serif font-bold text-warm-brown mb-3">購物清單</h3>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm text-warm-brown-light py-1"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">NT$ {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-cream-dark mt-3 pt-3 flex justify-between font-bold text-warm-brown text-lg">
                <span>總計</span>
                <span className="text-berry">NT$ {total}</span>
              </div>
            </div>
          )}
        </div>

        {/* 收件資料 */}
        <div className="lg:col-span-2">
          <h2 className="font-serif text-xl font-bold text-warm-brown mb-5">
            收件資料
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="order-name" className="block text-sm font-medium text-warm-brown mb-2">
                收件人姓名
              </label>
              <input
                id="order-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border-2 border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
                required
              />
            </div>
            <div>
              <label htmlFor="order-phone" className="block text-sm font-medium text-warm-brown mb-2">
                聯絡電話
              </label>
              <input
                id="order-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border-2 border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
                required
              />
            </div>
            <div>
              <label htmlFor="order-address" className="block text-sm font-medium text-warm-brown mb-2">
                收件地址
              </label>
              <input
                id="order-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-2 border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
                required
              />
            </div>
            <div>
              <label htmlFor="order-notes" className="block text-sm font-medium text-warm-brown mb-2">
                備註
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border-2 border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
                placeholder="有任何特殊需求請在此說明"
              />
            </div>

            {error && <p className="text-berry text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full bg-berry text-white py-4 rounded-full font-semibold text-lg hover:bg-berry-dark hover:shadow-lg active:scale-[0.97] disabled:opacity-40 transition-all duration-200"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" style={{ animationDuration: "0.8s" }} />
                  送出中...
                </span>
              ) : `確認訂購 — NT$ ${total}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
