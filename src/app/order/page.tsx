"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function OrderPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalPrice, loading: cartLoading } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 自動帶入用戶資料
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.name && !customerName) setCustomerName(data.user.name);
          if (data.user.phone && !phone) setPhone(data.user.phone);
          if (data.user.address && !address) setAddress(data.user.address);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("購物車是空的");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          notes,
          items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch {
      setError("網路連線失敗，請稍後再試");
      setLoading(false);
      return;
    }

    setLoading(false);
    clearCart();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-8 animate-reveal-scale">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-sage">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso mb-4 animate-reveal-up" style={{ animationDelay: "0.15s" }}>
            訂單已送出！
          </h1>
          <p className="text-espresso-light/60 mb-10 leading-relaxed animate-reveal-up" style={{ animationDelay: "0.25s" }}>
            感謝你的訂購！我們正用滿滿的愛心為你準備果醬，
            <br className="hidden sm:block" />
            請期待甜蜜的包裹送到你手中。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-reveal-up" style={{ animationDelay: "0.4s" }}>
            <button onClick={() => router.push("/my-orders")} className="btn-primary">
              查看我的訂單
            </button>
            <button onClick={() => router.push("/")} className="btn-secondary">
              回到首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Cart & Checkout
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          購物車
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      {cartLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-rose/20 border-t-rose rounded-full animate-spin mx-auto mb-3" role="status" aria-label="載入中" />
          <p className="text-espresso-light/50 text-sm">載入購物車...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-linen-dark/50 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-espresso-light/40">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-serif text-espresso text-lg mb-2">購物車是空的</p>
          <p className="text-espresso-light/50 text-sm mb-8">去看看有什麼好吃的果醬吧</p>
          <Link href="/" className="btn-primary-sm">
            瀏覽產品
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* 購物車清單 */}
          <div className="lg:col-span-3">
            <h2 className="font-serif text-lg font-bold text-espresso mb-5">
              購物清單
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-4 flex items-center gap-4"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-md bg-linen-dark flex items-center justify-center text-2xl shrink-0">
                      <span role="img" aria-label="草莓">🍓</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-espresso text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-rose font-semibold text-sm mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                      NT$ {item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-9 h-9 rounded-md border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all duration-150 flex items-center justify-center text-lg"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-semibold text-espresso tabular-nums text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-9 h-9 rounded-md border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all duration-150 flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className="text-espresso font-medium text-sm" style={{ fontFamily: "var(--font-display)" }}>
                      NT$ {item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-espresso-light/40 hover:text-rose transition-colors duration-200 mt-1"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-lg p-6 ring-1 ring-linen-dark/60">
              <div className="flex justify-between items-baseline">
                <span className="font-serif font-bold text-espresso">總計</span>
                <span className="text-rose font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>
                  NT$ {totalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* 收件資料 */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-lg font-bold text-espresso mb-1">
              收件資料
            </h2>
            <p className="text-espresso-light/40 text-xs mb-6">
              我們會用心包裝，讓果醬安全送到你手中
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="order-name" className="block text-sm font-medium text-espresso mb-2">
                  收件人姓名
                </label>
                <input
                  id="order-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="order-phone" className="block text-sm font-medium text-espresso mb-2">
                  聯絡電話
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  pattern="[0-9\-\+\s]{8,15}"
                  title="請輸入有效的電話號碼（8-15 碼）"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label htmlFor="order-address" className="block text-sm font-medium text-espresso mb-2">
                  收件地址
                </label>
                <input
                  id="order-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  minLength={5}
                  required
                />
              </div>
              <div>
                <label htmlFor="order-notes" className="block text-sm font-medium text-espresso mb-2">
                  備註
                </label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="有任何特殊需求請在此說明"
                />
              </div>

              {error && (
                <p className="text-rose text-sm font-medium" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="btn-primary-lg w-full"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"
                      style={{ animationDuration: "0.8s" }}
                      role="status"
                      aria-label="送出中"
                    />
                    送出中...
                  </span>
                ) : (
                  `確認訂購 — NT$ ${totalPrice}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
