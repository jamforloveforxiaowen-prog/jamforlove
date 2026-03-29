"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TaiwanAddressSelector from "@/components/TaiwanAddressSelector";

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
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [pickupNote, setPickupNote] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
  const [notes, setNotes] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChangeZipcode = useCallback((v: string) => setZipcode(v), []);
  const handleChangeCity = useCallback((v: string) => setCity(v), []);
  const handleChangeDistrict = useCallback((v: string) => setDistrict(v), []);
  const handleChangeDetail = useCallback((v: string) => setAddressDetail(v), []);

  function parseAndFillAddress(addr: string) {
    if (!addr) return;
    let remaining = addr;
    const zipMatch = remaining.match(/^(\d{3})\s*/);
    if (zipMatch) {
      setZipcode(zipMatch[1]);
      remaining = remaining.slice(zipMatch[0].length);
    }
    const cityMatch = remaining.match(/^([\u4e00-\u9fff]{2,3}[市縣])/);
    if (cityMatch) {
      setCity(cityMatch[1]);
      remaining = remaining.slice(cityMatch[0].length);
      const distMatch = remaining.match(/^([\u4e00-\u9fff]{2,4}[區鄉鎮市])/);
      if (distMatch) {
        setDistrict(distMatch[1]);
        remaining = remaining.slice(distMatch[0].length);
      }
    }
    setAddressDetail(remaining.trim());
  }

  function loadProfile() {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.name) setCustomerName(data.user.name);
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.address) parseAndFillAddress(data.user.address);
          setProfileLoaded(true);
          setTimeout(() => setProfileLoaded(false), 2000);
        }
      })
      .catch(() => {});
  }

  // 頁面載入時自動帶入
  useEffect(() => { loadProfile(); }, []);

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
  const hasCombo = Object.values(comboSelections).some((q) => q > 0);
  const hasSelection = hasCombo;

  function updateCombo(id: number, delta: number) {
    setComboSelections((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  function updateAddon(id: number, delta: number) {
    setAddonSelections((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasCombo) { setError("請至少選擇一項產品組合"); return; }
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
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, phone, email,
          address: deliveryMethod === "shipping"
            ? `${zipcode} ${city}${district}${addressDetail}`.trim()
            : "面交 / 暨大取貨",
          deliveryMethod, combos, addons, notes, total: grandTotal,
        }),
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
      <div className="min-h-[70vh] flex items-center justify-center px-6 relative overflow-hidden">
        {/* 愛心煙火 — 從中心向四周飛出 */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * 360;
            const colors = ["var(--color-rose)", "var(--color-honey)", "var(--color-sage)"];
            return (
              <span
                key={i}
                className="absolute left-1/2 top-[40%] text-lg animate-[sparkFly_1s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{
                  color: colors[i % 3],
                  animationDelay: `${0.3 + i * 0.06}s`,
                  opacity: 0,
                  // @ts-expect-error CSS custom properties
                  "--spark-x": `${Math.cos(angle * Math.PI / 180) * 120}px`,
                  "--spark-y": `${Math.sin(angle * Math.PI / 180) * 120}px`,
                }}
              >
                ♥
              </span>
            );
          })}
        </div>

        <div className="text-center max-w-md relative z-10">
          {/* 蛋糕彈跳出場 */}
          <div className="mb-6 animate-[bakeBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
            <div className="relative inline-block">
              {/* 蛋糕體 */}
              <div className="w-20 h-12 rounded-t-2xl mx-auto" style={{ background: "linear-gradient(to bottom, var(--color-honey), var(--color-rose))" }} />
              <div className="w-24 h-6 rounded-b-xl mx-auto" style={{ background: "var(--color-rose)", boxShadow: "0 4px 12px rgba(196,80,106,0.3)" }} />
              {/* 蠟燭火焰 */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-sm animate-[flicker_0.5s_ease-in-out_infinite_alternate]">🔥</span>
                <div className="w-1 h-3 rounded-full" style={{ background: "var(--color-espresso)" }} />
              </div>
              {/* 打勾覆蓋 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-[check-draw_0.4s_ease_0.5s_forwards]" style={{ strokeDasharray: 24, strokeDashoffset: 24 }}>
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold text-espresso mb-4 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_both]" style={{ fontStyle: "italic" }}>收到你的心意了！</h1>
          <p className="text-espresso-light/60 mb-3 leading-relaxed animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_both]">你的每一份支持，都是我們繼續做下去的動力</p>
          <p className="text-espresso-light/40 text-base mb-3 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]">
            訂單金額 <span className="text-rose font-bold text-lg">NT$ {grandTotal}</span>
          </p>
          <p className="text-espresso-light/40 text-base mb-3 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.55s_both]">
            訂單已收到囉，我們會用心為你準備
          </p>
          {email && (
            <p className="text-espresso-light/40 text-sm mb-3 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.6s_both]">
              確認信已寄送至 <span className="text-espresso font-medium">{email}</span>
            </p>
          )}

          {/* 愛心搖擺跳動 */}
          <div className="text-3xl mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.65s_both]">
            <span className="inline-block animate-[heartbeat_1.2s_ease-in-out_infinite]">♥</span>
          </div>

          <div className="flex gap-3 justify-center animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.75s_both]">
            <button onClick={() => { setSubmitted(false); window.scrollTo(0, 0); }} className="px-6 py-3 rounded-lg font-serif font-bold text-base text-rose hover:bg-rose hover:text-white active:scale-95 transition-all" style={{ border: "2px dashed var(--color-rose)" }}>繼續逛逛</button>
            <button onClick={() => router.push("/")} className="btn-primary">回到首頁</button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── 輸入欄位 ──────────────────────────────────── */

  const inputClass = "w-full py-3 px-0 bg-transparent text-lg text-espresso outline-none placeholder:text-espresso-light/30 transition-colors focus:border-rose";
  const inputBorder = { borderBottom: "2px dashed rgba(30,15,8,0.12)" };
  const inputBorderFocus = "focus-within:[border-bottom-color:var(--color-rose)]";

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-16">
      {/* ─── 標頭 ─ 手感風 ─────────────────────────── */}
      <div className="text-center mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso" style={{ fontStyle: "italic" }}>
          Jam for Love
        </h1>
        <p className="text-espresso-light/40 text-base mt-1">~ 用愛手工熬煮 ~</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="w-10 h-px bg-rose/30" />
          <span className="text-rose text-sm">♥</span>
          <span className="w-10 h-px bg-rose/30" />
        </div>
        <p className="text-espresso-light/50 text-base mt-4 leading-relaxed max-w-md mx-auto">
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
          <div className="relative mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-rose)", border: "3px dashed rgba(196,80,106,0.3)", boxShadow: "0 2px 8px rgba(196,80,106,0.2)" }}
            >
              1
            </div>
            <div className="mb-1">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso">選擇產品組合</h2>
              <p className="text-espresso-light/40 text-base">每組 NT$500，可複選多組</p>
            </div>

            <div className="space-y-2.5 mt-4">
              {COMBOS.map((combo) => {
                const qty = comboSelections[combo.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={combo.id}
                    className={`rounded-lg p-4 transition-all duration-300 ${isSelected ? "bg-rose/[0.04] animate-[bakeSelect_0.4s_cubic-bezier(0.34,1.56,0.64,1)]" : "bg-white/50 hover:translate-y-[-2px]"}`}
                    style={{
                      border: isSelected ? "2px dashed var(--color-rose)" : "2px dashed rgba(30,15,8,0.1)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-serif font-bold text-espresso text-lg">{combo.name}</span>
                          <span className="text-espresso-light/30 text-base">限 {combo.limit} 組</span>
                        </div>
                        <p className="text-espresso-light/50 text-[1.05rem]">{combo.items.join(" + ")}</p>
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => updateCombo(combo.id, -1)} className="w-9 h-9 rounded-lg text-espresso-light hover:text-rose active:animate-[bakeDing_0.3s_ease] transition-all flex items-center justify-center text-lg" style={{ border: "2px dashed rgba(30,15,8,0.12)" }}>−</button>
                            <span key={qty} className="w-7 text-center font-bold text-espresso tabular-nums text-base animate-[number-pop_0.3s_ease]">{qty}</span>
                            <button type="button" onClick={() => updateCombo(combo.id, 1)} className="w-9 h-9 rounded-lg text-espresso-light hover:text-rose active:animate-[bakeDing_0.3s_ease] transition-all flex items-center justify-center text-lg" style={{ border: "2px dashed rgba(30,15,8,0.12)" }}>+</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => updateCombo(combo.id, 1)} className="px-4 py-2 rounded-lg text-base font-medium text-rose hover:bg-rose hover:text-white active:scale-95 transition-all" style={{ border: "2px dashed rgba(196,80,106,0.3)" }}>
                            選擇
                          </button>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: "1px dashed rgba(30,15,8,0.08)" }}>
                        <span className="text-espresso-light/40 text-base">{qty} 組 × NT$500</span>
                        <span className="text-rose font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>NT$ {qty * combo.price}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Step 2：加購商品（需先選組合） ───── */}
          {hasCombo && (
          <>
          <div className="relative mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]">
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-honey)", border: "3px dashed rgba(200,149,48,0.3)", boxShadow: "0 2px 8px rgba(200,149,48,0.2)" }}
            >
              2
            </div>
            <div className="mb-1">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso">加購好物</h2>
              <p className="text-espresso-light/40 text-base">可自由搭配，不限數量</p>
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
                        <span className="text-espresso text-[1.05rem] font-medium">{addon.name}</span>
                        {addon.spec && <span className="text-espresso-light/30 text-sm">({addon.spec})</span>}
                        {addon.limit && <span className="text-sage text-sm font-semibold">限量 {addon.limit}{addon.unit}</span>}
                      </div>
                      {addon.note && <p className="text-rose/60 text-sm mt-0.5">{addon.note}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold tabular-nums" style={{ color: "var(--color-honey)", fontFamily: "var(--font-display)" }}>${addon.price}</span>
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
          <div className="relative mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_both]">
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-sage)", border: "3px dashed rgba(107,142,95,0.3)", boxShadow: "0 2px 8px rgba(107,142,95,0.2)" }}
            >
              3
            </div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso">填寫資料</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadProfile}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-sage hover:bg-sage/10 transition-all"
                  style={{ border: "1.5px dashed rgba(107,142,95,0.3)" }}
                >
                  {profileLoaded ? "✓ 已帶入" : "帶入個人資料"}
                </button>
                <Link
                  href="/profile?from=order"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-espresso-light/40 hover:text-espresso hover:bg-linen-dark/20 transition-all"
                  style={{ border: "1.5px dashed rgba(30,15,8,0.08)" }}
                >
                  編輯
                </Link>
              </div>
            </div>
            <p className="text-espresso-light/40 text-base mb-5">請填寫正確資訊以便寄送</p>

            <div className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <div className={inputBorderFocus} style={inputBorder}>
                  <label className="block text-sm font-semibold text-espresso-light/50 pt-2">姓名 *</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} required />
                </div>
                <div className={inputBorderFocus} style={inputBorder}>
                  <label className="block text-sm font-semibold text-espresso-light/50 pt-2">電話 *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-sm font-semibold text-espresso-light/50 pt-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="選填，用於訂單通知" />
              </div>

              {/* 取貨方式 */}
              <div className="pt-4 pb-2">
                <label className="block text-sm font-semibold text-espresso-light/50 mb-3">取貨方式 *</label>
                <div className="flex gap-3">
                  {([
                    { value: "shipping" as const, label: "郵寄", icon: "📦" },
                    { value: "pickup" as const, label: "面交 / 暨大取貨", icon: "🤝" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryMethod(opt.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg text-lg font-medium transition-all duration-200 ${
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

              {/* 地址（僅郵寄時顯示） */}
              {deliveryMethod === "shipping" && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-espresso-light/50 mb-2">收件地址 *</label>
                  <TaiwanAddressSelector
                    zipcode={zipcode} city={city} district={district} detail={addressDetail}
                    onChangeZipcode={handleChangeZipcode} onChangeCity={handleChangeCity}
                    onChangeDistrict={handleChangeDistrict} onChangeDetail={handleChangeDetail}
                  />
                </div>
              )}

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-sm font-semibold text-espresso-light/50 pt-2">備註</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="例如：金盞花或玫瑰花乳霜的偏好" />
              </div>
            </div>
          </div>

          {/* ─── Step 4：訂單摘要 ─────────────────── */}
          {hasSelection && (
            <div className="relative mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_both]">
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
                <h3 className="font-serif text-2xl font-bold text-espresso mb-3">訂單摘要</h3>
                <div className="space-y-1.5">
                  {Object.entries(comboSelections).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                    const combo = COMBOS.find((c) => c.id === Number(id))!;
                    return (
                      <div key={`c${id}`} className="flex justify-between text-base">
                        <span className="text-espresso-light">{combo.name}（{combo.items.join("、")}）× {qty}</span>
                        <span className="text-espresso font-medium tabular-nums">NT$ {combo.price * qty}</span>
                      </div>
                    );
                  })}
                  {Object.entries(addonSelections).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                    const addon = ADDONS.find((a) => a.id === Number(id))!;
                    return (
                      <div key={`a${id}`} className="flex justify-between text-base">
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
          </>
          )}
        </div>

        {/* ─── 送出 ──────────────────────────────── */}
        {error && <p className="text-rose text-sm font-medium mb-4 animate-shake" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading || !hasSelection}
          className="w-full py-4 bg-rose text-white font-serif font-bold text-lg rounded-lg transition-all hover:bg-rose-dark hover:scale-[1.01] hover:shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]"
          style={{ border: "2px dashed rgba(196,80,106,0.3)", boxShadow: "0 4px 16px rgba(196,80,106,0.2)" }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
              送出中...
            </span>
          ) : hasCombo ? `確認訂購 — NT$ ${grandTotal}` : "請先選擇產品組合"}
        </button>
        <p className="text-center text-espresso-light/30 text-sm mt-4">送出後我們會以電話或 Email 確認訂單 ♥</p>
      </form>
    </div>
  );
}
