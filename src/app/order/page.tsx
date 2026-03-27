"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/* ─── 資料定義 ─────────────────────────────────── */

interface Combo {
  id: number;
  name: string;
  items: string[];
  price: number;
  limit: number;
}

interface Addon {
  id: number;
  name: string;
  spec: string;
  price: number;
  unit: string;
  limit: number | null;
  note: string;
}

const COMBOS: Combo[] = [
  { id: 1, name: "組合 1", items: ["香辣香菇醬", "馬告菜圃醬", "手工皂"], price: 500, limit: 25 },
  { id: 2, name: "組合 2", items: ["覆盆子果醬", "綜合莓果醬", "手工皂"], price: 500, limit: 25 },
  { id: 3, name: "組合 3", items: ["香辣香菇醬", "覆盆子果醬", "手工皂"], price: 500, limit: 25 },
  { id: 4, name: "組合 4", items: ["香辣香菇醬", "綜合莓果醬", "手工皂"], price: 500, limit: 25 },
  { id: 5, name: "組合 5", items: ["馬告菜圃醬", "覆盆子果醬", "手工皂"], price: 500, limit: 25 },
  { id: 6, name: "組合 6", items: ["馬告菜圃醬", "綜合莓果醬", "手工皂"], price: 500, limit: 25 },
  { id: 7, name: "組合 7", items: ["手工皂 ×3"], price: 500, limit: 20 },
];

const ADDONS: Addon[] = [
  { id: 1, name: "金盞花乳霜 / 玫瑰花乳霜", spec: "40ml", price: 300, unit: "瓶", limit: null, note: "" },
  { id: 2, name: "洋甘菊護手霜（馬卡龍隨行盒）", spec: "30ml", price: 100, unit: "瓶", limit: null, note: "" },
  { id: 3, name: "洋甘菊護手霜", spec: "50ml", price: 180, unit: "瓶", limit: null, note: "" },
  { id: 4, name: "手工洗頭皂", spec: "", price: 200, unit: "塊", limit: null, note: "" },
  { id: 5, name: "草莓果醬", spec: "", price: 150, unit: "瓶", limit: 20, note: "" },
  { id: 6, name: "蘋果桑葚醬", spec: "", price: 150, unit: "瓶", limit: null, note: "" },
  { id: 7, name: "堅果蔓越莓雪Q餅", spec: "10塊/盒", price: 180, unit: "盒", limit: 10, note: "限面交 & 暨大取貨" },
];

/* ─── 表單區塊標題 ─────────────────────────────── */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
          style={{ background: "var(--color-rose)" }}
        >
          {number}
        </span>
        <h2 className="font-serif text-xl font-bold text-espresso">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-espresso-light/50 text-sm ml-10">{subtitle}</p>
      )}
    </div>
  );
}

/* ─── 標籤膠囊 ──────────────────────────────────── */

function Tag({ children, color = "rose" }: { children: React.ReactNode; color?: "rose" | "honey" | "sage" }) {
  const colors = {
    rose: "bg-rose/10 text-rose",
    honey: "text-[var(--color-honey)] bg-[rgba(200,149,48,0.1)]",
    sage: "bg-sage/10 text-sage",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

/* ─── 主頁面 ────────────────────────────────────── */

export default function OrderPage() {
  const router = useRouter();

  // 組合選擇 { comboId: quantity }
  const [comboSelections, setComboSelections] = useState<Record<number, number>>({});
  // 加購選擇 { addonId: quantity }
  const [addonSelections, setAddonSelections] = useState<Record<number, number>>({});

  // 表單
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
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
          if (data.user.name) setCustomerName(data.user.name);
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.address) setAddress(data.user.address);
        }
      })
      .catch(() => {});
  }, []);

  // 計算
  const comboTotal = useMemo(
    () => Object.entries(comboSelections).reduce((sum, [id, qty]) => {
      const combo = COMBOS.find((c) => c.id === Number(id));
      return sum + (combo ? combo.price * qty : 0);
    }, 0),
    [comboSelections]
  );

  const addonTotal = useMemo(
    () => Object.entries(addonSelections).reduce((sum, [id, qty]) => {
      const addon = ADDONS.find((a) => a.id === Number(id));
      return sum + (addon ? addon.price * qty : 0);
    }, 0),
    [addonSelections]
  );

  const grandTotal = comboTotal + addonTotal;
  const hasSelection = Object.values(comboSelections).some((q) => q > 0) ||
    Object.values(addonSelections).some((q) => q > 0);

  function updateCombo(id: number, delta: number) {
    setComboSelections((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  }

  function updateAddon(id: number, delta: number) {
    setAddonSelections((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSelection) {
      setError("請至少選擇一項產品組合或加購商品");
      return;
    }

    setError("");
    setLoading(true);

    const combos = Object.entries(comboSelections)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const combo = COMBOS.find((c) => c.id === Number(id))!;
        return { id: combo.id, name: combo.name, items: combo.items, quantity: qty, price: combo.price };
      });

    const addons = Object.entries(addonSelections)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const addon = ADDONS.find((a) => a.id === Number(id))!;
        return { id: addon.id, name: addon.name, quantity: qty, price: addon.price };
      });

    try {
      const res = await fetch("/api/fundraise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          address,
          deliveryMethod,
          combos,
          addons,
          notes,
          total: grandTotal,
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
    setSubmitted(true);
  }

  /* ─── 送出成功畫面 ─────────────────────────────── */

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl animate-reveal-up"
            style={{ background: "var(--color-rose)", color: "white" }}
          >
            ✓
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso mb-4 animate-reveal-up" style={{ animationDelay: "0.1s" }}>
            訂單已送出！
          </h1>
          <p className="text-espresso-light/60 mb-3 leading-relaxed animate-reveal-up" style={{ animationDelay: "0.2s" }}>
            感謝你支持 Jam for Love 114-2 募資活動！
          </p>
          <p className="text-espresso-light/40 text-sm mb-10 animate-reveal-up" style={{ animationDelay: "0.25s" }}>
            訂單金額 <span className="text-rose font-bold">NT$ {grandTotal}</span>，我們會盡快與你確認。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-reveal-up" style={{ animationDelay: "0.35s" }}>
            <button onClick={() => router.push("/")} className="btn-primary">
              回到首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── 輸入欄位樣式 ─────────────────────────────── */

  const inputClass =
    "w-full rounded-xl border border-linen-dark/60 bg-white/80 px-4 py-3 text-espresso text-[0.9375rem] outline-none transition-all placeholder:text-espresso-light/30 focus:border-rose focus:bg-white focus:shadow-[0_0_0_3px_var(--color-rose-muted)]";

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      {/* ─── 活動標頭 ───────────────────────────── */}
      <div className="mb-12 animate-reveal-up">
        <div className="flex items-center gap-2 mb-3">
          <Tag color="rose">114-2 學期</Tag>
          <Tag color="honey">募資活動</Tag>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso leading-tight">
          Jam for Love 2026
        </h1>
        <p className="text-espresso-light/50 text-sm mt-3 leading-relaxed max-w-lg">
          每一瓶果醬、每一塊手工皂，都由學生親手製作。你的支持，是我們最大的動力。
          所有收入將用於公益捐助。
        </p>
        <div className="w-16 h-[2px] bg-rose mt-5 origin-left animate-underline-grow" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* ─── 第一區：產品組合 ─────────────────── */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-6 animate-reveal-up"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(235,226,212,0.6)",
            boxShadow: "0 2px 16px rgba(30,15,8,0.04)",
          }}
        >
          <SectionHeader
            number="1"
            title="選擇產品組合"
            subtitle="每組 NT$500，可複選多組"
          />

          <div className="space-y-3">
            {COMBOS.map((combo) => {
              const qty = comboSelections[combo.id] || 0;
              const isSelected = qty > 0;
              return (
                <div
                  key={combo.id}
                  className={`rounded-xl p-4 transition-all duration-300 ${
                    isSelected
                      ? "ring-2 ring-rose bg-rose/[0.03]"
                      : "ring-1 ring-linen-dark/40 hover:ring-espresso-light/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-serif font-bold text-espresso text-[0.95rem]">
                          {combo.name}
                        </span>
                        <Tag color="sage">限量 {combo.limit} 組</Tag>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {combo.items.map((item) => (
                          <span
                            key={item}
                            className="inline-block px-2.5 py-1 rounded-lg text-[0.78rem] font-medium"
                            style={{
                              background: "var(--color-linen)",
                              color: "var(--color-espresso-light)",
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-0 shrink-0">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateCombo(combo.id, -1)}
                            className="w-8 h-8 rounded-lg border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all flex items-center justify-center text-base"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-bold text-espresso tabular-nums text-sm">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCombo(combo.id, 1)}
                            className="w-8 h-8 rounded-lg border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all flex items-center justify-center text-base"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateCombo(combo.id, 1)}
                          className="px-3.5 py-1.5 rounded-lg text-[0.8rem] font-medium transition-all duration-200 text-rose border border-rose/30 hover:bg-rose hover:text-white active:scale-95"
                        >
                          選擇
                        </button>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-linen-dark/20 flex justify-between items-center">
                      <span className="text-espresso-light/50 text-xs">
                        {qty} 組 × NT${combo.price}
                      </span>
                      <span className="text-rose font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                        NT$ {qty * combo.price}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 第二區：加購商品 ─────────────────── */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-6 animate-reveal-up"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(235,226,212,0.6)",
            boxShadow: "0 2px 16px rgba(30,15,8,0.04)",
            animationDelay: "0.05s",
          }}
        >
          <SectionHeader
            number="2"
            title="加購商品"
            subtitle="可自由搭配，不限數量"
          />

          <div className="space-y-2.5">
            {ADDONS.map((addon) => {
              const qty = addonSelections[addon.id] || 0;
              const isSelected = qty > 0;
              return (
                <div
                  key={addon.id}
                  className={`rounded-xl px-4 py-3 transition-all duration-300 ${
                    isSelected
                      ? "ring-2 ring-[var(--color-honey)] bg-[rgba(200,149,48,0.02)]"
                      : "ring-1 ring-linen-dark/40 hover:ring-espresso-light/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-espresso text-[0.9rem]">
                          {addon.name}
                        </span>
                        {addon.spec && (
                          <span className="text-espresso-light/40 text-xs">{addon.spec}</span>
                        )}
                        {addon.limit && (
                          <Tag color="sage">限量 {addon.limit}{addon.unit}</Tag>
                        )}
                      </div>
                      {addon.note && (
                        <p className="text-rose/70 text-xs mt-0.5">{addon.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-sm font-bold tabular-nums whitespace-nowrap"
                        style={{ color: "var(--color-honey)", fontFamily: "var(--font-display)" }}
                      >
                        ${addon.price}
                      </span>

                      {isSelected ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateAddon(addon.id, -1)}
                            className="w-7 h-7 rounded-md border border-linen-dark text-espresso-light hover:border-[var(--color-honey)] hover:text-[var(--color-honey)] active:scale-90 transition-all flex items-center justify-center text-sm"
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-bold text-espresso tabular-nums text-sm">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateAddon(addon.id, 1)}
                            className="w-7 h-7 rounded-md border border-linen-dark text-espresso-light hover:border-[var(--color-honey)] hover:text-[var(--color-honey)] active:scale-90 transition-all flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateAddon(addon.id, 1)}
                          className="w-7 h-7 rounded-md border border-linen-dark/60 text-espresso-light/50 hover:border-[var(--color-honey)] hover:text-[var(--color-honey)] active:scale-90 transition-all flex items-center justify-center text-base"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 第三區：收件資料 ─────────────────── */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-6 animate-reveal-up"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(235,226,212,0.6)",
            boxShadow: "0 2px 16px rgba(30,15,8,0.04)",
            animationDelay: "0.1s",
          }}
        >
          <SectionHeader
            number="3"
            title="收件資料"
            subtitle="請填寫正確資訊以便寄送"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fr-name" className="block text-sm font-medium text-espresso mb-1.5">
                  姓名 <span className="text-rose">*</span>
                </label>
                <input
                  id="fr-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="fr-phone" className="block text-sm font-medium text-espresso mb-1.5">
                  電話 <span className="text-rose">*</span>
                </label>
                <input
                  id="fr-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="fr-email" className="block text-sm font-medium text-espresso mb-1.5">
                Email
              </label>
              <input
                id="fr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="選填，用於訂單通知"
              />
            </div>

            {/* 取貨方式 */}
            <div>
              <label className="block text-sm font-medium text-espresso mb-2.5">
                取貨方式 <span className="text-rose">*</span>
              </label>
              <div className="flex gap-3">
                {([
                  { value: "shipping" as const, label: "郵寄", icon: "📦" },
                  { value: "pickup" as const, label: "面交 / 暨大取貨", icon: "🤝" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDeliveryMethod(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      deliveryMethod === opt.value
                        ? "ring-2 ring-rose bg-rose/5 text-rose"
                        : "ring-1 ring-linen-dark/50 text-espresso-light hover:ring-espresso-light/40"
                    }`}
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="fr-address" className="block text-sm font-medium text-espresso mb-1.5">
                {deliveryMethod === "shipping" ? "收件地址" : "取貨地點或約定方式"} <span className="text-rose">*</span>
              </label>
              <input
                id="fr-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
                placeholder={deliveryMethod === "shipping" ? "請填寫完整地址" : "例：暨大校內取貨"}
                required
              />
            </div>

            <div>
              <label htmlFor="fr-notes" className="block text-sm font-medium text-espresso mb-1.5">
                備註
              </label>
              <textarea
                id="fr-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="有任何特殊需求請在此說明（例如：金盞花或玫瑰花乳霜的偏好）"
              />
            </div>
          </div>
        </div>

        {/* ─── 訂單摘要（固定底部 or 區塊） ─────── */}
        {hasSelection && (
          <div
            className="rounded-2xl p-6 md:p-8 mb-6 animate-reveal-up"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,243,235,0.9))",
              border: "1px solid rgba(235,226,212,0.6)",
              boxShadow: "0 2px 16px rgba(30,15,8,0.04)",
            }}
          >
            <h3 className="font-serif text-lg font-bold text-espresso mb-4">訂單摘要</h3>
            <div className="space-y-2">
              {Object.entries(comboSelections)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const combo = COMBOS.find((c) => c.id === Number(id))!;
                  return (
                    <div key={`c${id}`} className="flex justify-between text-sm">
                      <span className="text-espresso-light">
                        {combo.name}（{combo.items.join("、")}）× {qty}
                      </span>
                      <span className="text-espresso font-medium tabular-nums">
                        NT$ {combo.price * qty}
                      </span>
                    </div>
                  );
                })}
              {Object.entries(addonSelections)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const addon = ADDONS.find((a) => a.id === Number(id))!;
                  return (
                    <div key={`a${id}`} className="flex justify-between text-sm">
                      <span className="text-espresso-light">
                        {addon.name} × {qty}
                      </span>
                      <span className="text-espresso font-medium tabular-nums">
                        NT$ {addon.price * qty}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div
              className="mt-4 pt-4 flex justify-between items-baseline"
              style={{ borderTop: "1px solid rgba(235,226,212,0.6)" }}
            >
              <span className="font-serif font-bold text-espresso">合計</span>
              <span className="text-rose font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>
                NT$ {grandTotal}
              </span>
            </div>
          </div>
        )}

        {/* ─── 錯誤訊息 & 送出 ─────────────────── */}
        {error && (
          <p className="text-rose text-sm font-medium mb-4 animate-shake" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !hasSelection}
          className="w-full py-4 bg-rose text-white font-semibold text-[0.95rem] rounded-xl transition-all hover:bg-rose-dark hover:shadow-[0_4px_20px_rgba(196,80,106,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
              送出中...
            </span>
          ) : hasSelection ? (
            `確認訂購 — NT$ ${grandTotal}`
          ) : (
            "請先選擇產品"
          )}
        </button>

        <p className="text-center text-espresso-light/30 text-xs mt-4">
          送出後我們會以電話或 Email 確認訂單
        </p>
      </form>
    </div>
  );
}
