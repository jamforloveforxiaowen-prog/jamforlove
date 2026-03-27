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

/* ─── 主頁面 ────────────────────────────────────── */

export default function OrderPage() {
  const router = useRouter();

  const [comboSelections, setComboSelections] = useState<Record<number, number>>({});
  const [addonSelections, setAddonSelections] = useState<Record<number, number>>({});

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    setComboSelections((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  function updateAddon(id: number, delta: number) {
    setAddonSelections((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSelection) { setError("請至少選擇一項產品組合或加購商品"); return; }
    setError(""); setLoading(true);

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
        body: JSON.stringify({ customerName, phone, email, address, deliveryMethod, combos, addons, notes, total: grandTotal }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
    } catch {
      setError("網路連線失敗，請稍後再試"); setLoading(false); return;
    }
    setLoading(false); setSubmitted(true);
  }

  /* ─── 送出成功 ──────────────────────────────────── */

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl animate-reveal-up" style={{ background: "var(--color-rose)", color: "white" }}>✓</div>
          <h1 className="font-serif text-3xl font-bold text-espresso mb-4 animate-reveal-up" style={{ animationDelay: "0.1s", fontStyle: "italic" }}>訂單已送出！</h1>
          <p className="text-espresso-light/60 mb-3 leading-relaxed animate-reveal-up" style={{ animationDelay: "0.2s" }}>感謝你支持 Jam for Love！</p>
          <p className="text-espresso-light/40 text-sm mb-10 animate-reveal-up" style={{ animationDelay: "0.25s" }}>
            訂單金額 <span className="text-rose font-bold">NT$ {grandTotal}</span>，我們會盡快與你確認。
          </p>
          <button onClick={() => router.push("/")} className="btn-primary animate-reveal-up" style={{ animationDelay: "0.35s" }}>回到首頁</button>
        </div>
      </div>
    );
  }

  /* ─── 輸入欄位 ──────────────────────────────────── */

  const inputClass = "w-full py-3 px-0 bg-transparent text-sm text-espresso outline-none placeholder:text-espresso-light/30 transition-colors focus:border-rose";
  const inputBorder = { borderBottom: "2px dashed rgba(30,15,8,0.12)" };
  const inputBorderFocus = "focus-within:[border-bottom-color:var(--color-rose)]";

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-16">
      {/* ─── 標頭 ─ 手感風 ─────────────────────────── */}
      <div className="text-center mb-10 animate-reveal-up">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso" style={{ fontStyle: "italic" }}>
          Jam for Love
        </h1>
        <p className="text-espresso-light/40 text-sm mt-1">~ 用愛手工熬煮 ~</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="w-10 h-px bg-rose/30" />
          <span className="text-rose text-sm">♥</span>
          <span className="w-10 h-px bg-rose/30" />
        </div>
        <p className="text-espresso-light/50 text-sm mt-4 leading-relaxed max-w-md mx-auto">
          每一瓶果醬、每一塊手工皂，都由學生親手製作。<br />你的支持，是我們最大的動力。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ─── 時間軸容器 ─────────────────────────── */}
        <div className="relative pl-11 md:pl-14">
          {/* 垂直虛線 */}
          <div
            className="absolute left-[17px] md:left-[21px] top-0 bottom-0 w-0"
            style={{ borderLeft: "2px dashed rgba(30,15,8,0.1)" }}
          />

          {/* ─── Step 1：產品組合 ─────────────────── */}
          <div className="relative mb-10 animate-reveal-up">
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-rose)", border: "3px dashed rgba(196,80,106,0.3)", boxShadow: "0 2px 8px rgba(196,80,106,0.2)" }}
            >
              1
            </div>
            <div className="mb-1">
              <h2 className="font-serif text-xl font-bold text-espresso">選擇產品組合</h2>
              <p className="text-espresso-light/40 text-sm">每組 NT$500，可複選多組</p>
            </div>

            <div className="space-y-2.5 mt-4">
              {COMBOS.map((combo) => {
                const qty = comboSelections[combo.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={combo.id}
                    className={`rounded-lg p-4 transition-all duration-300 ${isSelected ? "bg-rose/[0.04]" : "bg-white/50"}`}
                    style={{
                      border: isSelected ? "2px dashed var(--color-rose)" : "2px dashed rgba(30,15,8,0.1)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-serif font-bold text-espresso">{combo.name}</span>
                          <span className="text-espresso-light/30 text-xs">限 {combo.limit} 組</span>
                        </div>
                        <p className="text-espresso-light/50 text-sm">{combo.items.join(" + ")}</p>
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => updateCombo(combo.id, -1)} className="w-8 h-8 rounded-lg text-espresso-light hover:text-rose active:scale-90 transition-all flex items-center justify-center" style={{ border: "2px dashed rgba(30,15,8,0.12)" }}>−</button>
                            <span className="w-6 text-center font-bold text-espresso tabular-nums text-sm">{qty}</span>
                            <button type="button" onClick={() => updateCombo(combo.id, 1)} className="w-8 h-8 rounded-lg text-espresso-light hover:text-rose active:scale-90 transition-all flex items-center justify-center" style={{ border: "2px dashed rgba(30,15,8,0.12)" }}>+</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => updateCombo(combo.id, 1)} className="px-3 py-1.5 rounded-lg text-[0.8rem] font-medium text-rose hover:bg-rose hover:text-white active:scale-95 transition-all" style={{ border: "2px dashed rgba(196,80,106,0.3)" }}>
                            選擇
                          </button>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
                        <span className="text-espresso-light/40 text-xs">{qty} 組 × NT$500</span>
                        <span className="text-rose font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>NT$ {qty * combo.price}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Step 2：加購商品 ─────────────────── */}
          <div className="relative mb-10 animate-reveal-up" style={{ animationDelay: "0.05s" }}>
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-honey)", border: "3px dashed rgba(200,149,48,0.3)", boxShadow: "0 2px 8px rgba(200,149,48,0.2)" }}
            >
              2
            </div>
            <div className="mb-1">
              <h2 className="font-serif text-xl font-bold text-espresso">加購好物</h2>
              <p className="text-espresso-light/40 text-sm">可自由搭配，不限數量</p>
            </div>

            <div className="space-y-2 mt-4">
              {ADDONS.map((addon) => {
                const qty = addonSelections[addon.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between py-3 gap-3"
                    style={{ borderBottom: "1px dashed rgba(30,15,8,0.08)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-espresso text-sm font-medium">{addon.name}</span>
                        {addon.spec && <span className="text-espresso-light/30 text-xs">({addon.spec})</span>}
                        {addon.limit && <span className="text-sage text-[0.65rem] font-semibold">限量 {addon.limit}{addon.unit}</span>}
                      </div>
                      {addon.note && <p className="text-rose/60 text-xs mt-0.5">{addon.note}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold tabular-nums" style={{ color: "var(--color-honey)", fontFamily: "var(--font-display)" }}>${addon.price}</span>
                      {isSelected ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => updateAddon(addon.id, -1)} className="w-7 h-7 rounded-md text-espresso-light hover:text-[var(--color-honey)] active:scale-90 transition-all flex items-center justify-center text-sm" style={{ border: "1.5px dashed rgba(30,15,8,0.12)" }}>−</button>
                          <span className="w-5 text-center font-bold text-espresso tabular-nums text-sm">{qty}</span>
                          <button type="button" onClick={() => updateAddon(addon.id, 1)} className="w-7 h-7 rounded-md text-espresso-light hover:text-[var(--color-honey)] active:scale-90 transition-all flex items-center justify-center text-sm" style={{ border: "1.5px dashed rgba(30,15,8,0.12)" }}>+</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => updateAddon(addon.id, 1)} className="w-7 h-7 rounded-md text-espresso-light/40 hover:text-[var(--color-honey)] active:scale-90 transition-all flex items-center justify-center text-base" style={{ border: "1.5px dashed rgba(30,15,8,0.1)" }}>+</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Step 3：收件資料 ─────────────────── */}
          <div className="relative mb-10 animate-reveal-up" style={{ animationDelay: "0.1s" }}>
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-sage)", border: "3px dashed rgba(107,142,95,0.3)", boxShadow: "0 2px 8px rgba(107,142,95,0.2)" }}
            >
              3
            </div>
            <h2 className="font-serif text-xl font-bold text-espresso mb-1">填寫資料</h2>
            <p className="text-espresso-light/40 text-sm mb-5">請填寫正確資訊以便寄送</p>

            <div className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <div className={inputBorderFocus} style={inputBorder}>
                  <label className="block text-[0.65rem] font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">姓名 *</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} required />
                </div>
                <div className={inputBorderFocus} style={inputBorder}>
                  <label className="block text-[0.65rem] font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">電話 *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-[0.65rem] font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="選填，用於訂單通知" />
              </div>

              {/* 取貨方式 */}
              <div className="pt-4 pb-2">
                <label className="block text-[0.65rem] font-semibold tracking-wider uppercase text-espresso-light/40 mb-3">取貨方式 *</label>
                <div className="flex gap-3">
                  {([
                    { value: "shipping" as const, label: "郵寄", icon: "📦" },
                    { value: "pickup" as const, label: "面交 / 暨大取貨", icon: "🤝" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryMethod(opt.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        deliveryMethod === opt.value ? "bg-rose/5 text-rose" : "text-espresso-light hover:text-espresso"
                      }`}
                      style={{ border: deliveryMethod === opt.value ? "2px dashed var(--color-rose)" : "2px dashed rgba(30,15,8,0.1)" }}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-[0.65rem] font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">
                  {deliveryMethod === "shipping" ? "收件地址" : "取貨地點"} *
                </label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder={deliveryMethod === "shipping" ? "請填寫完整地址" : "例：暨大校內取貨"} required />
              </div>

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-[0.65rem] font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">備註</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="例如：金盞花或玫瑰花乳霜的偏好" />
              </div>
            </div>
          </div>

          {/* ─── Step 4：訂單摘要 ─────────────────── */}
          {hasSelection && (
            <div className="relative mb-8 animate-reveal-up">
              <div
                className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center text-sm"
                style={{ background: "var(--color-espresso)", color: "var(--color-linen)", border: "3px dashed rgba(30,15,8,0.2)", fontFamily: "var(--font-display)" }}
              >
                ♥
              </div>
              <div
                className="rounded-lg p-5"
                style={{ border: "2px dashed rgba(30,15,8,0.1)", background: "rgba(255,255,255,0.4)" }}
              >
                <h3 className="font-serif text-lg font-bold text-espresso mb-3">訂單摘要</h3>
                <div className="space-y-1.5">
                  {Object.entries(comboSelections).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                    const combo = COMBOS.find((c) => c.id === Number(id))!;
                    return (
                      <div key={`c${id}`} className="flex justify-between text-sm">
                        <span className="text-espresso-light">{combo.name}（{combo.items.join("、")}）× {qty}</span>
                        <span className="text-espresso font-medium tabular-nums">NT$ {combo.price * qty}</span>
                      </div>
                    );
                  })}
                  {Object.entries(addonSelections).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                    const addon = ADDONS.find((a) => a.id === Number(id))!;
                    return (
                      <div key={`a${id}`} className="flex justify-between text-sm">
                        <span className="text-espresso-light">{addon.name} × {qty}</span>
                        <span className="text-espresso font-medium tabular-nums">NT$ {addon.price * qty}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 flex justify-between items-baseline" style={{ borderTop: "2px dashed rgba(30,15,8,0.08)" }}>
                  <span className="font-serif font-bold text-espresso">合計</span>
                  <span className="text-rose font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>NT$ {grandTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── 送出 ──────────────────────────────── */}
        {error && <p className="text-rose text-sm font-medium mb-4 animate-shake" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading || !hasSelection}
          className="w-full py-4 bg-rose text-white font-serif font-bold text-[0.95rem] rounded-lg transition-all hover:bg-rose-dark active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          style={{ border: "2px dashed rgba(196,80,106,0.3)", boxShadow: "0 4px 16px rgba(196,80,106,0.2)" }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
              送出中...
            </span>
          ) : hasSelection ? `確認訂購 — NT$ ${grandTotal}` : "請先選擇產品"}
        </button>
        <p className="text-center text-espresso-light/30 text-xs mt-4">送出後我們會以電話或 Email 確認訂單 ♥</p>
      </form>
    </div>
  );
}
