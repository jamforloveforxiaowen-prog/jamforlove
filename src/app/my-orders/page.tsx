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
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        載入中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">我的訂單</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          目前沒有訂單紀錄
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">
                    訂單 #{order.id}
                  </span>
                  <span className="text-sm text-gray-400 ml-3">
                    {order.createdAt}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
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
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
                <div className="text-sm text-gray-500">
                  <p>{order.customerName} / {order.phone}</p>
                  <p>{order.address}</p>
                  {order.notes && (
                    <p className="text-gray-400 mt-1">備註：{order.notes}</p>
                  )}
                </div>
                <p className="font-bold text-amber-900 text-lg">
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
