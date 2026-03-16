"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [productsLoading, setProductsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => setError("無法載入產品，請稍後再試"))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("jamforlove-cart", JSON.stringify(cart));
    } catch {
      /* storage full */
    }
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

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      setError("請至少選擇一項產品");
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
          items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
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

    setCart([]);
    try {
      sessionStorage.removeItem("jamforlove-cart");
    } catch {
      /* ok */
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-8 animate-reveal-scale"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-sage"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            className="font-serif text-3xl font-bold text-espresso mb-4 animate-reveal-up"
            style={{ animationDelay: "0.15s" }}
          >
            訂單已送出！
          </h1>
          <p
            className="text-espresso-light/60 mb-10 leading-relaxed animate-reveal-up"
            style={{ animationDelay: "0.25s" }}
          >
            感謝你的訂購！我們正用滿滿的愛心為你準備果醬，
            <br className="hidden sm:block" />
            請期待甜蜜的包裹送到你手中。
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center animate-reveal-up"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={() => router.push("/my-orders")}
              className="btn-primary"
            >
              查看我的訂單
            </button>
            <button
              onClick={() => router.push("/")}
              className="btn-secondary"
            >
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
          Order
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          訂購果醬
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
        {/* 產品選擇 */}
        <div className="lg:col-span-3">
          <h2 className="font-serif text-lg font-bold text-espresso mb-5">
            選擇產品
          </h2>
          <div className="space-y-3">
            {products.map((product) => {
              const qty = getQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className={`rounded-lg p-4 flex items-center gap-4 transition-all duration-200 ${
                    qty > 0
                      ? "bg-rose/[0.04] ring-1 ring-rose/20"
                      : "bg-white ring-1 ring-linen-dark/60"
                  }`}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
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
                      {product.name}
                    </h3>
                    <p
                      className="text-rose font-semibold text-sm mt-0.5"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      NT$ {product.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product, qty - 1)}
                      className="w-11 h-11 rounded-md border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all duration-150 flex items-center justify-center text-lg"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-semibold text-espresso tabular-nums text-sm">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product, qty + 1)}
                      className="w-11 h-11 rounded-md border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all duration-150 flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            {productsLoading && (
              <div className="text-center py-16">
                <div
                  className="w-8 h-8 border-2 border-rose/20 border-t-rose rounded-full animate-spin mx-auto mb-3"
                  role="status"
                  aria-label="載入產品中"
                />
                <p className="text-espresso-light/50 text-sm">載入產品中...</p>
              </div>
            )}
            {!productsLoading && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-3xl mb-3 animate-float">🍓</p>
                <p className="text-espresso-light/60 text-sm">
                  新口味正在熬煮中，請稍後再來逛逛
                </p>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-8 bg-white rounded-lg p-6 ring-1 ring-linen-dark/60 animate-reveal-scale">
              <h3 className="font-serif font-bold text-espresso mb-4 text-sm">
                購物清單
              </h3>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm text-espresso-light/70 py-1"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-espresso">
                    NT$ {item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t border-linen-dark/60 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-serif font-bold text-espresso">
                  總計
                </span>
                <span
                  className="text-rose font-bold text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  NT$ {total}
                </span>
              </div>
            </div>
          )}
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
              <label
                htmlFor="order-name"
                className="block text-sm font-medium text-espresso mb-2"
              >
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
              <label
                htmlFor="order-phone"
                className="block text-sm font-medium text-espresso mb-2"
              >
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
              <label
                htmlFor="order-address"
                className="block text-sm font-medium text-espresso mb-2"
              >
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
              <label
                htmlFor="order-notes"
                className="block text-sm font-medium text-espresso mb-2"
              >
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
              disabled={loading || cart.length === 0}
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
                `確認訂購 — NT$ ${total}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
