"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import LottieAnimation, { LOTTIE_URLS } from "@/components/LottieAnimation";

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  campaignName: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deliveryMethod: string;
  items: OrderItem[];
  combos: { id: number; name: string; items: string[]; quantity: number; price: number }[];
  addons: { id: number; name: string; quantity: number; price: number }[];
  isSupporter: boolean;
  discountAmount: number;
  notes: string;
  status: string;
  total: number;
  createdAt: string;
}

const CUSTOMER_SERVICE_EMAIL = "jamforloveforxiaowen@gmail.com";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 修改訂單 Modal
  const [modifyOrder, setModifyOrder] = useState<Order | null>(null);
  const [modifyMessage, setModifyMessage] = useState("");
  const [modifySubmitting, setModifySubmitting] = useState(false);
  const [modifySuccess, setModifySuccess] = useState(false);
  const [modifyError, setModifyError] = useState("");

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

  async function handleModifySubmit() {
    if (!modifyOrder || !modifyMessage.trim()) { setModifyError("請填寫修改內容"); return; }
    setModifySubmitting(true); setModifyError("");
    try {
      const res = await fetch("/api/orders/modify-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: modifyOrder.id, message: modifyMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setModifyError(data.error || "送出失敗"); setModifySubmitting(false); return; }
      setModifySuccess(true);
    } catch { setModifyError("網路連線失敗"); }
    setModifySubmitting(false);
  }

  function closeModifyModal() {
    setModifyOrder(null);
    setModifyMessage("");
    setModifySuccess(false);
    setModifyError("");
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <LottieAnimation
          src={LOTTIE_URLS.loading}
          className="w-24 h-24 mx-auto mb-3"
        />
        <p className="text-espresso-light/50 text-sm">正在翻找你的訂單...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">

      {/* ═══ 修改訂單 Modal ═══ */}
      {modifyOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={closeModifyModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-linen-dark/30 px-6 py-4 rounded-t-2xl">
              <h2 className="font-serif text-lg font-bold text-espresso">修改訂單 #{modifyOrder.id}</h2>
              {modifyOrder.campaignName && <p className="text-espresso-light/50 text-sm">{modifyOrder.campaignName}</p>}
            </div>

            <div className="px-6 py-5">
              {modifySuccess ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: "linear-gradient(135deg, var(--color-sage), #6b8f71)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <p className="font-serif text-lg font-bold text-espresso mb-2">已送出修改需求</p>
                  <p className="text-espresso-light/50 text-sm">我們會盡快處理，謝謝你！</p>
                  <button onClick={closeModifyModal} className="mt-6 px-6 py-2.5 rounded-lg text-sm font-medium bg-espresso text-linen hover:bg-espresso-light transition-colors">關閉</button>
                </div>
              ) : (
                <>
                  {/* 原訂單摘要 */}
                  <div className="mb-5 rounded-lg p-4 bg-linen/50 ring-1 ring-linen-dark/30">
                    <p className="text-xs font-semibold text-espresso-light/40 mb-2">原訂單內容</p>
                    <div className="space-y-1">
                      {modifyOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-espresso-light/70">{item.name} × {item.quantity}</span>
                          <span className="text-espresso">NT$ {item.price * item.quantity}</span>
                        </div>
                      ))}
                      {modifyOrder.combos.map((c, i) => (
                        <div key={`c${i}`} className="flex justify-between text-sm">
                          <span className="text-espresso-light/70">{c.name} × {c.quantity}</span>
                          <span className="text-espresso">NT$ {c.price * c.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 flex justify-between font-medium" style={{ borderTop: "1px dashed rgba(30,15,8,0.1)" }}>
                      <span className="text-espresso text-sm">合計</span>
                      <span className="text-rose text-sm">NT$ {modifyOrder.total}</span>
                    </div>
                  </div>

                  {/* 修改內容 */}
                  <div>
                    <label className="block text-sm font-semibold text-espresso mb-2">修改內容 *</label>
                    <textarea
                      value={modifyMessage}
                      onChange={(e) => setModifyMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg text-base text-espresso bg-linen ring-1 ring-linen-dark/60 focus:ring-rose outline-none resize-none"
                      placeholder="例：草莓果醬改為蘋果桑葚醬，數量改為 2"
                    />
                  </div>

                  {modifyError && <p className="text-rose text-sm mt-3">{modifyError}</p>}

                  <div className="flex gap-3 mt-5">
                    <button onClick={closeModifyModal} className="flex-1 py-3 rounded-lg text-sm font-medium text-espresso-light ring-1 ring-linen-dark hover:text-espresso transition-all">取消</button>
                    <button
                      onClick={handleModifySubmit}
                      disabled={modifySubmitting || !modifyMessage.trim()}
                      className="flex-1 py-3 rounded-lg text-sm font-medium bg-rose text-white hover:bg-rose-dark transition-all disabled:opacity-40"
                    >
                      {modifySubmitting ? "送出中..." : "送出"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          My Orders
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          我的訂單
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5 origin-left animate-underline-grow" />
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
            <ScrollReveal
              key={order.id}
              delay={i * 0.06}
            >
            <div
              className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-5 sm:p-6 hover:ring-rose/20 hover:shadow-lg hover:shadow-rose/[0.04] transition-all duration-300"
            >
              {/* 標題列 */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span
                    className="font-bold text-espresso"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
                  >
                    #{order.id}
                  </span>
                  <span className="text-xs text-espresso-light/40">
                    {new Date(order.createdAt).toLocaleString("zh-TW")}
                  </span>
                  <span className="text-xs text-espresso-light/30">
                    {order.deliveryMethod === "pickup" ? "面交" : "郵寄"}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-sage/15 text-sage">
                  已下單
                </span>
              </div>
              {order.campaignName && (
                <p className="text-sm text-espresso-light/50 mb-3">
                  <span className="text-rose/60">♥</span> {order.campaignName}
                </p>
              )}

              {/* 品項明細 */}
              <div className="border-t border-linen-dark/40 pt-4 space-y-1.5">
                {order.items.map((item, ii) => (
                  <div key={ii} className="flex justify-between text-sm">
                    <span className="text-espresso-light/70">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-espresso">NT$ {item.price * item.quantity}</span>
                  </div>
                ))}
                {order.combos.map((c, ci) => (
                  <div key={`c${ci}`} className="flex justify-between text-sm">
                    <span className="text-espresso-light/70">
                      {c.name}（{c.items.join("、")}）× {c.quantity}
                    </span>
                    <span className="font-medium text-espresso">
                      NT$ {c.price * c.quantity}
                    </span>
                  </div>
                ))}
                {order.addons.map((a, ai) => (
                  <div key={`a${ai}`} className="flex justify-between text-sm">
                    <span className="text-espresso-light/70">
                      {a.name} × {a.quantity}
                    </span>
                    <span className="font-medium text-espresso">
                      NT$ {a.price * a.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* 折扣 */}
              {order.discountAmount > 0 && (
                <div className="border-t border-linen-dark/40 mt-4 pt-3 flex justify-between text-sm">
                  <span className="text-rose/70">♥ 舊朋友折扣</span>
                  <span className="text-rose font-medium">-NT$ {order.discountAmount}</span>
                </div>
              )}

              {/* 收件資訊 + 總計 */}
              <div className={`border-t border-linen-dark/40 ${order.discountAmount > 0 ? "mt-2 pt-3" : "mt-4 pt-4"} flex items-start justify-between gap-4`}>
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

              {/* 修改按鈕 */}
              <div className="border-t border-linen-dark/40 mt-4 pt-3">
                <button
                  onClick={() => { setModifyOrder(order); setModifyMessage(""); setModifySuccess(false); setModifyError(""); }}
                  className="text-xs px-4 py-1.5 rounded-md ring-1 ring-rose/20 text-rose/70 hover:text-rose hover:bg-rose/5 transition-all"
                >
                  修改訂單
                </button>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* 客服聯繫 */}
      <div className="mt-12 text-center animate-reveal-up" style={{ animationDelay: "0.3s" }}>
        <p className="text-espresso-light/40 text-sm">
          訂單問題？歡迎來信{" "}
          <a href={`mailto:${CUSTOMER_SERVICE_EMAIL}`} className="text-rose hover:underline">
            {CUSTOMER_SERVICE_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
