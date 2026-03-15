"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  productName: string | null;
}

interface Order {
  id: number;
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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-honey/15 text-honey",
  confirmed: "bg-sage/10 text-sage",
  shipped: "bg-rose/10 text-rose",
  completed: "bg-sage/15 text-sage",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data.reverse() : []);
        setLoading(false);
      })
      .catch(() => {
        setError("無法載入訂單，請稍後再試");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-3xl mb-3 animate-float" role="status" aria-label="載入中">🍓</p>
        <p className="text-espresso-light/50 text-sm">正在翻找你的訂單...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          My Orders
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          我的訂單
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      {error && (
        <p className="text-rose text-sm font-medium mb-6" role="alert">{error}</p>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-24 animate-reveal-up">
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
          <p className="font-serif text-espresso text-lg mb-2">
            還沒有訂單紀錄
          </p>
          <p className="text-espresso-light/50 text-sm mb-8">
            來挑一罐用愛熬煮的果醬吧！
          </p>
          <a href="/order" className="btn-primary">
            去逛逛果醬
          </a>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, i) => (
            <div
              key={order.id}
              className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5 sm:p-6 animate-reveal-up"
              style={{ animationDelay: `${0.05 + i * 0.06}s` }}
            >
              {/* 標題列 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="font-bold text-espresso"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
                  >
                    #{order.id}
                  </span>
                  <span className="text-xs text-espresso-light/40">
                    {order.createdAt}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    STATUS_STYLES[order.status] || "bg-linen-dark text-espresso-light"
                  }`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* 產品明細 */}
              <div className="border-t border-linen-dark/40 pt-4 space-y-1.5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-espresso-light/70">
                      {item.productName || `產品 #${item.productId}`} ×{" "}
                      {item.quantity}
                    </span>
                    <span className="font-medium text-espresso">
                      NT$ {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* 收件資訊 + 總計 */}
              <div className="border-t border-linen-dark/40 mt-4 pt-4 flex items-start justify-between gap-4">
                <div className="text-xs text-espresso-light/50 space-y-0.5 min-w-0 break-words">
                  <p>
                    {order.customerName} / {order.phone}
                  </p>
                  <p className="break-words">{order.address}</p>
                  {order.notes && (
                    <p className="opacity-60 break-words">備註：{order.notes}</p>
                  )}
                </div>
                <p
                  className="text-rose font-bold text-xl shrink-0"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  NT$ {order.total}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
