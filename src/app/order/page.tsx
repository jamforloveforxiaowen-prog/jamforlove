"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

  // 預購期間
  const [fundraiseStart, setFundraiseStart] = useState("");
  const [fundraiseEnd, setFundraiseEnd] = useState("");
  const [timeChecked, setTimeChecked] = useState(false);

  // 庫存 & 限制
  const [comboStock, setComboStock] = useState<Record<number, number | null>>({});
  const [addonStock, setAddonStock] = useState<Record<number, number | null>>({});
  const [maxOrders, setMaxOrders] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);

  // 已下過單（每人限一次）
  const [existingOrderId, setExistingOrderId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 預購說明圖
  const [fundraiseBanner, setFundraiseBanner] = useState("");

  // 欄位驗證
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 訂單確認頁資料
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: number;
    combos: { id: number; name: string; items: string[]; quantity: number; price: number }[];
    addons: { id: number; name: string; quantity: number; price: number }[];
    total: number;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    deliveryMethod: string;
    notes: string;
  } | null>(null);

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

  // 載入預購期間、庫存、既有訂單
  useEffect(() => {
    Promise.all([
      fetch("/api/site-settings?key=fundraise_start").then(r => r.json()),
      fetch("/api/site-settings?key=fundraise_end").then(r => r.json()),
    ]).then(([s, e]) => {
      if (s.value) setFundraiseStart(s.value);
      if (e.value) setFundraiseEnd(e.value);
    }).finally(() => setTimeChecked(true));

    // 預購說明圖
    fetch("/api/site-settings?key=fundraise_banner").then(r => r.json()).then(data => {
      if (data.value) setFundraiseBanner(data.value);
    }).catch(() => {});

    // 庫存
    fetch("/api/orders/stock").then(r => r.json()).then(data => {
      if (data.comboStock) setComboStock(data.comboStock);
      if (data.addonStock) setAddonStock(data.addonStock);
      if (data.maxOrders != null) setMaxOrders(data.maxOrders);
      if (data.totalOrders != null) setTotalOrders(data.totalOrders);
    }).catch(() => {});

    // 檢查是否已下過單
    fetch("/api/orders").then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const order = data[0];
        setExistingOrderId(order.id);
      }
    }).catch(() => {});
  }, []);

  const now = new Date();
  const fundraiseActive = fundraiseStart && fundraiseEnd
    && new Date(fundraiseStart) <= now && now <= new Date(fundraiseEnd + "T23:59:59");
  const ordersFull = maxOrders !== null && totalOrders >= maxOrders;

  // 頁面載入時自動帶入個人資料
  useEffect(() => { loadProfile(); }, []);

  // 帶入既有訂單資料（編輯模式）
  function loadExistingOrder() {
    fetch("/api/orders").then(r => r.json()).then(data => {
      if (!Array.isArray(data) || data.length === 0) return;
      const order = data[0];
      setCustomerName(order.customerName);
      setPhone(order.phone);
      setEmail(order.email || "");
      setDeliveryMethod(order.deliveryMethod || "shipping");
      setNotes(order.notes || "");
      if (order.deliveryMethod === "shipping" && order.address) {
        parseAndFillAddress(order.address);
      }
      const comboSel: Record<number, number> = {};
      for (const c of order.combos) comboSel[c.id] = c.quantity;
      setComboSelections(comboSel);
      const addonSel: Record<number, number> = {};
      for (const a of order.addons) addonSel[a.id] = a.quantity;
      setAddonSelections(addonSel);
      setIsEditMode(true);
    }).catch(() => {});
  }

  // 欄位驗證 helpers
  function markTouched(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }
  const fieldErrors: Record<string, string> = {};
  if (touched.customerName && !customerName.trim()) fieldErrors.customerName = "請填寫姓名";
  if (touched.phone && !phone.trim()) fieldErrors.phone = "請填寫電話";
  if (touched.phone && phone.trim() && !/^0\d{8,9}$/.test(phone.trim())) fieldErrors.phone = "電話格式不正確";
  if (touched.email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) fieldErrors.email = "Email 格式不正確";
  if (touched.addressDetail && deliveryMethod === "shipping" && !addressDetail.trim()) fieldErrors.addressDetail = "請填寫詳細地址";

  // 從 sessionStorage 恢復之前的選擇（從編輯個人資料回來時）
  useEffect(() => {
    const saved = sessionStorage.getItem("order_selections");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.combos) setComboSelections(data.combos);
        if (data.addons) setAddonSelections(data.addons);
        if (data.deliveryMethod) setDeliveryMethod(data.deliveryMethod);
        if (data.notes) setNotes(data.notes);
      } catch { /* ignore */ }
      sessionStorage.removeItem("order_selections");
    }
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
  const hasCombo = Object.values(comboSelections).some((q) => q > 0);
  const hasSelection = hasCombo;

  function updateCombo(id: number, delta: number) {
    setComboSelections((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const stock = comboStock[id];
      // 庫存限制（編輯模式下庫存已排除自己的訂單，由 API 把關）
      if (stock !== null && stock !== undefined && next > stock) return prev;
      return { ...prev, [id]: next };
    });
  }

  function updateAddon(id: number, delta: number) {
    setAddonSelections((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const stock = addonStock[id];
      if (stock !== null && stock !== undefined && next > stock) return prev;
      return { ...prev, [id]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasCombo) { setError("請至少選擇一項產品組合"); return; }

    // 觸發所有欄位驗證
    setTouched({ customerName: true, phone: true, email: true, addressDetail: true });
    if (!customerName.trim() || !phone.trim()) {
      setError("請填寫必填欄位"); return;
    }
    if (deliveryMethod === "shipping" && !addressDetail.trim()) {
      setError("請填寫收件地址"); return;
    }

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

    const finalAddress = deliveryMethod === "shipping"
      ? `${zipcode} ${city}${district}${addressDetail}`.trim()
      : "面交 / 暨大取貨";

    try {
      const method = isEditMode ? "PUT" : "POST";
      const payload: Record<string, unknown> = {
        customerName, phone, email,
        address: finalAddress,
        deliveryMethod, combos, addons, notes, total: grandTotal,
      };
      if (isEditMode && existingOrderId) {
        payload.orderId = existingOrderId;
      }

      const res = await fetch("/api/orders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      setConfirmedOrder({
        orderId: data.orderId,
        combos, addons, total: grandTotal,
        customerName, phone, email,
        address: finalAddress, deliveryMethod, notes,
      });
    } catch {
      setError("網路連線失敗，請稍後再試"); setLoading(false); return;
    }
    setLoading(false); setSubmitted(true);
  }

  /* ─── 送出成功 ──────────────────────────────────── */

  if (submitted && confirmedOrder) {
    const order = confirmedOrder;
    return (
      <div className="max-w-2xl mx-auto px-5 py-10 md:py-16 relative overflow-hidden">
        {/* 愛心煙火 */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * 360;
            const colors = ["var(--color-rose)", "var(--color-honey)", "var(--color-sage)"];
            return (
              <span
                key={i}
                className="absolute left-1/2 top-[15%] text-lg animate-[sparkFly_1s_cubic-bezier(0.16,1,0.3,1)_forwards]"
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

        {/* 標題區 */}
        <div className="text-center mb-8 relative z-10 animate-[bakeBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-sage-dark, #6b8f71))" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2" style={{ fontStyle: "italic" }}>
            收到你的心意了！
          </h1>
          <p className="text-espresso-light/50 text-sm">
            訂單編號 <span className="font-medium text-espresso">#{order.orderId}</span>
          </p>
        </div>

        {/* 訂單明細卡片 */}
        <div
          className="rounded-2xl p-6 mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(235,226,212,0.8)",
            boxShadow: "0 4px 24px rgba(30,15,8,0.06)",
          }}
        >
          <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2">
            <span className="text-rose">♥</span> 訂單明細
          </h2>

          {/* 產品組合 */}
          {order.combos.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-2">產品組合</p>
              <div className="space-y-2">
                {order.combos.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px dashed rgba(30,15,8,0.06)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso font-medium">{c.name}</p>
                      <p className="text-espresso-light/50 text-xs mt-0.5">{c.items.join("、")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-espresso text-sm">x{c.quantity}</p>
                      <p className="text-espresso-light/60 text-xs">NT$ {c.price * c.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 加購商品 */}
          {order.addons.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-2">加購商品</p>
              <div className="space-y-2">
                {order.addons.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px dashed rgba(30,15,8,0.06)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso font-medium">{a.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-espresso text-sm">x{a.quantity}</p>
                      <p className="text-espresso-light/60 text-xs">NT$ {a.price * a.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 合計 */}
          <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
            <p className="font-serif font-bold text-espresso">合計</p>
            <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
          </div>
        </div>

        {/* 收件資訊卡片 */}
        <div
          className="rounded-2xl p-6 mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.35s_both]"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(235,226,212,0.8)",
            boxShadow: "0 4px 24px rgba(30,15,8,0.06)",
          }}
        >
          <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2">
            <span className="text-rose">♥</span> 收件資訊
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="text-espresso-light/40 shrink-0 w-16">收件人</span>
              <span className="text-espresso">{order.customerName}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-espresso-light/40 shrink-0 w-16">電話</span>
              <span className="text-espresso">{order.phone}</span>
            </div>
            {order.email && (
              <div className="flex gap-3">
                <span className="text-espresso-light/40 shrink-0 w-16">Email</span>
                <span className="text-espresso">{order.email}</span>
              </div>
            )}
            <div className="flex gap-3">
              <span className="text-espresso-light/40 shrink-0 w-16">取貨方式</span>
              <span className="text-espresso">{order.deliveryMethod === "shipping" ? "郵寄" : "面交 / 暨大取貨"}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-espresso-light/40 shrink-0 w-16">地址</span>
              <span className="text-espresso">{order.address}</span>
            </div>
            {order.notes && (
              <div className="flex gap-3">
                <span className="text-espresso-light/40 shrink-0 w-16">備註</span>
                <span className="text-espresso">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* 提示訊息 */}
        <div className="text-center mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]">
          <p className="text-espresso-light/50 text-sm leading-relaxed mb-2">
            訂單已收到囉，我們會用心為你準備
          </p>
          {order.email && (
            <p className="text-espresso-light/40 text-xs">
              確認信已寄送至 <span className="text-espresso font-medium">{order.email}</span>
            </p>
          )}
        </div>

        {/* 按鈕 */}
        <div className="flex gap-3 justify-center animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.6s_both]">
          <Link href="/my-orders" className="px-6 py-3 rounded-lg font-serif font-bold text-base text-rose hover:bg-rose hover:text-white active:scale-95 transition-all" style={{ border: "2px dashed var(--color-rose)" }}>
            查看我的訂單
          </Link>
          <button onClick={() => router.push("/")} className="btn-primary">回到首頁</button>
        </div>
      </div>
    );
  }

  /* ─── 預購未開放 / 額滿 ──────────────────────────── */

  if (timeChecked && !fundraiseActive) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🍯</div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-4">
            預購尚未開放
          </h1>
          {fundraiseStart && fundraiseEnd ? (
            <p className="text-espresso-light/60 text-base leading-relaxed mb-2">
              預購期間為 <span className="font-medium text-espresso">{fundraiseStart}</span> ~ <span className="font-medium text-espresso">{fundraiseEnd}</span>
            </p>
          ) : (
            <p className="text-espresso-light/60 text-base leading-relaxed mb-2">
              預購時間尚未公佈，敬請期待！
            </p>
          )}
          <p className="text-espresso-light/40 text-sm mb-8">
            {fundraiseStart && new Date(fundraiseStart) > now
              ? "再等等，馬上就開放囉！"
              : "本次預購已結束，感謝你的支持！"}
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            回到首頁
          </button>
        </div>
      </div>
    );
  }

  if (timeChecked && ordersFull && !existingOrderId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-4">
            預購已額滿！
          </h1>
          <p className="text-espresso-light/60 text-base leading-relaxed mb-8">
            感謝大家熱情支持，本次預購名額已滿。<br />期待下次再見！
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            回到首頁
          </button>
        </div>
      </div>
    );
  }

  // 已下過單：顯示提示，可選擇編輯或查看訂單
  if (timeChecked && existingOrderId && !isEditMode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-sage-dark, #6b8f71))" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-3">
            你已經下過訂單了
          </h1>
          <p className="text-espresso-light/60 text-base leading-relaxed mb-2">
            訂單編號 <span className="font-medium text-espresso">#{existingOrderId}</span>
          </p>
          <p className="text-espresso-light/40 text-sm mb-8">
            如需修改訂單內容，可點擊下方「修改訂單」
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadExistingOrder}
              className="px-6 py-3 rounded-lg font-serif font-bold text-base text-rose hover:bg-rose hover:text-white active:scale-95 transition-all"
              style={{ border: "2px dashed var(--color-rose)" }}
            >
              修改訂單
            </button>
            <button onClick={() => router.push("/my-orders")} className="btn-primary">
              查看我的訂單
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── 輸入欄位 ──────────────────────────────────── */

  const inputClass = "w-full py-3 px-0 bg-transparent text-lg text-espresso outline-none placeholder:text-espresso-light/30 transition-colors focus:border-rose";
  const inputBorder = { borderBottom: "2px dashed rgba(30,15,8,0.12)" };
  const inputBorderFocus = "focus-within:[border-bottom-color:var(--color-rose)]";

  if (!timeChecked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
      </div>
    );
  }

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
          {isEditMode ? (
            <>正在修改訂單 <span className="font-medium text-espresso">#{existingOrderId}</span>，修改完成後請重新送出</>
          ) : (
            <>每一瓶果醬、每一塊手工皂，都由學生親手製作。<br />你的支持，是我們最大的動力。</>
          )}
        </p>
      </div>

      {/* ─── 預購說明圖 ──────────────────────────── */}
      {fundraiseBanner && (
        <div className="mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.05s_both]">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 8px 32px rgba(30,15,8,0.08), 0 2px 8px rgba(30,15,8,0.04)",
              border: "1px solid rgba(235,226,212,0.8)",
            }}
          >
            <Image
              src={fundraiseBanner}
              alt="預購活動說明"
              width={800}
              height={800}
              className="w-full h-auto"
              unoptimized={fundraiseBanner.startsWith("data:")}
            />
          </div>
        </div>
      )}

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
                const remaining = comboStock[combo.id];
                const soldOut = remaining !== null && remaining !== undefined && remaining <= 0 && qty === 0;
                return (
                  <div
                    key={combo.id}
                    className={`rounded-lg p-4 transition-all duration-300 ${soldOut ? "opacity-50" : ""} ${isSelected ? "bg-rose/[0.04] animate-[bakeSelect_0.4s_cubic-bezier(0.34,1.56,0.64,1)]" : "bg-white/50 hover:translate-y-[-2px]"}`}
                    style={{
                      border: isSelected ? "2px dashed var(--color-rose)" : "2px dashed rgba(30,15,8,0.1)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-serif font-bold text-espresso text-lg">{combo.name}</span>
                          {soldOut ? (
                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-espresso-light/10 text-espresso-light/50">已售完</span>
                          ) : remaining !== null && remaining !== undefined ? (
                            <span className={`text-base ${remaining <= 5 ? "text-rose font-semibold" : "text-espresso-light/30"}`}>
                              剩 {remaining} 組
                            </span>
                          ) : (
                            <span className="text-espresso-light/30 text-base">限 {combo.limit} 組</span>
                          )}
                        </div>
                        <p className="text-espresso-light/50 text-[1.05rem]">{combo.items.join(" + ")}</p>
                      </div>
                      <div className="shrink-0">
                        {soldOut ? (
                          <span className="px-4 py-2 rounded-lg text-base font-medium text-espresso-light/30" style={{ border: "2px dashed rgba(30,15,8,0.08)" }}>售完</span>
                        ) : isSelected ? (
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
                const remaining = addonStock[addon.id];
                const soldOut = remaining !== null && remaining !== undefined && remaining <= 0 && qty === 0;
                return (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between py-3 gap-3 ${soldOut ? "opacity-50" : ""}`}
                    style={{ borderBottom: "1px dashed rgba(30,15,8,0.08)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-espresso text-[1.05rem] font-medium">{addon.name}</span>
                        {addon.spec && <span className="text-espresso-light/30 text-sm">({addon.spec})</span>}
                        {soldOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-espresso-light/10 text-espresso-light/50">已售完</span>
                        ) : remaining !== null && remaining !== undefined ? (
                          <span className={`text-sm font-semibold ${remaining <= 3 ? "text-rose" : "text-sage"}`}>
                            剩 {remaining}{addon.unit}
                          </span>
                        ) : addon.limit ? (
                          <span className="text-sage text-sm font-semibold">限量 {addon.limit}{addon.unit}</span>
                        ) : null}
                      </div>
                      {addon.note && <p className="text-rose/60 text-sm mt-0.5">{addon.note}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold tabular-nums" style={{ color: "var(--color-honey)", fontFamily: "var(--font-display)" }}>${addon.price}</span>
                      {soldOut ? (
                        <span className="w-7 h-7 rounded-md flex items-center justify-center text-espresso-light/20 text-xs">—</span>
                      ) : isSelected ? (
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
                  onClick={() => {
                    sessionStorage.setItem("order_selections", JSON.stringify({
                      combos: comboSelections,
                      addons: addonSelections,
                      deliveryMethod,
                      notes,
                    }));
                  }}
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
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} onBlur={() => markTouched("customerName")} className={inputClass} required />
                  {fieldErrors.customerName && <p className="text-rose text-xs mt-1">{fieldErrors.customerName}</p>}
                </div>
                <div className={inputBorderFocus} style={inputBorder}>
                  <label className="block text-sm font-semibold text-espresso-light/50 pt-2">電話 *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => markTouched("phone")} className={inputClass} required />
                  {fieldErrors.phone && <p className="text-rose text-xs mt-1">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-sm font-semibold text-espresso-light/50 pt-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => markTouched("email")} className={inputClass} placeholder="選填，用於訂單通知" />
                {fieldErrors.email && <p className="text-rose text-xs mt-1">{fieldErrors.email}</p>}
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
                    onChangeDistrict={handleChangeDistrict} onChangeDetail={(v) => { handleChangeDetail(v); markTouched("addressDetail"); }}
                  />
                  {fieldErrors.addressDetail && <p className="text-rose text-xs mt-1">{fieldErrors.addressDetail}</p>}
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
          ) : hasCombo ? (isEditMode ? `更新訂單 — NT$ ${grandTotal}` : `確認訂購 — NT$ ${grandTotal}`) : "請先選擇產品組合"}
        </button>
        <p className="text-center text-espresso-light/30 text-sm mt-4">
          {isEditMode ? "修改後請重新送出，我們會以最新版本為準 ♥" : "送出後我們會以電話或 Email 確認訂單 ♥"}
        </p>
      </form>
    </div>
  );
}
