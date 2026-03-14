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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-honey/20 text-honey border-honey/30",
  confirmed: "bg-leaf/10 text-leaf border-leaf/30",
  shipped: "bg-berry/10 text-berry border-berry/30",
  completed: "bg-leaf/20 text-leaf border-leaf/40",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data.reverse() : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center text-warm-brown-light">
        載入中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-serif text-4xl font-bold text-warm-brown mb-10">
        我的訂單
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-warm-brown-light text-lg">
            目前沒有訂單紀錄
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-cream-dark p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-warm-brown">
                    #{order.id}
                  </span>
                  <span className="text-sm text-warm-brown-light">
                    {order.createdAt}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status] || "bg-cream-dark text-warm-brown-light"}`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="border-t border-cream-dark pt-4 space-y-1.5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-warm-brown-light">
                      {item.productName || `產品 #${item.productId}`} × {item.quantity}
                    </span>
                    <span className="font-medium text-warm-brown">
                      NT$ {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-cream-dark mt-4 pt-4 flex items-start justify-between">
                <div className="text-xs text-warm-brown-light space-y-0.5">
                  <p>{order.customerName} / {order.phone}</p>
                  <p>{order.address}</p>
                  {order.notes && <p className="opacity-60">備註：{order.notes}</p>}
                </div>
                <p className="font-serif font-bold text-berry text-xl">
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
