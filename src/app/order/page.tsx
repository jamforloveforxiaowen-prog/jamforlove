"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TaiwanAddressSelector from "@/components/TaiwanAddressSelector";

/* ─── 型別定義 ─────────────────────────────────── */

interface CampaignProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  limit: number | null;
  unit: string;
  sortOrder: number;
  note: string;
  isActive: boolean;
  sold: number;
  remaining: number | null;
}

interface CampaignGroup {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
  isRequired: boolean;
  products: CampaignProduct[];
}

interface ActiveCampaign {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  formStyle: string;
  supporterDiscount: number;
  pickupOptions: string[];
  groups: CampaignGroup[];
  totalOrders: number;
}

interface OrderItem {
  productId: number;
  name: string;
  description: string;
  group: string;
  quantity: number;
  price: number;
}

/* ─── Legacy 商品（fallback 用） ──────────────── */

const LEGACY_COMBOS = [
  { id: 9001, name: "組合 1", desc: "香辣香菇醬 + 馬告菜圃醬 + 手工皂", price: 500, limit: 25 },
  { id: 9002, name: "組合 2", desc: "覆盆子果醬 + 綜合莓果醬 + 手工皂", price: 500, limit: 25 },
  { id: 9003, name: "組合 3", desc: "香辣香菇醬 + 覆盆子果醬 + 手工皂", price: 500, limit: 25 },
  { id: 9004, name: "組合 4", desc: "香辣香菇醬 + 綜合莓果醬 + 手工皂", price: 500, limit: 25 },
  { id: 9005, name: "組合 5", desc: "馬告菜圃醬 + 覆盆子果醬 + 手工皂", price: 500, limit: 25 },
  { id: 9006, name: "組合 6", desc: "馬告菜圃醬 + 綜合莓果醬 + 手工皂", price: 500, limit: 25 },
  { id: 9007, name: "組合 7", desc: "手工皂 ×3", price: 500, limit: 20 },
];

const LEGACY_ADDONS = [
  { id: 9101, name: "金盞花乳霜 / 玫瑰花乳霜 (40ml)", price: 300, limit: null },
  { id: 9102, name: "洋甘菊護手霜 馬卡龍隨行盒 (30ml)", price: 100, limit: null },
  { id: 9103, name: "洋甘菊護手霜 (50ml)", price: 180, limit: null },
  { id: 9104, name: "手工洗頭皂", price: 200, limit: null },
  { id: 9105, name: "草莓果醬", price: 150, limit: 20 },
  { id: 9106, name: "蘋果桑葚醬", price: 150, limit: null },
  { id: 9107, name: "堅果蔓越莓雪Q餅 (10塊/盒)", price: 180, limit: 10 },
];

function buildLegacyCampaign(startDate: string, endDate: string): ActiveCampaign {
  const toProduct = (item: { id: number; name: string; desc?: string; price: number; limit: number | null }): CampaignProduct => ({
    id: item.id, name: item.name, description: item.desc || "", price: item.price,
    limit: item.limit, unit: "份", sortOrder: 0, note: "", isActive: true,
    sold: 0, remaining: item.limit,
  });
  return {
    id: 0, name: "Jam for Love", status: "active", startDate, endDate,
    bannerUrl: "", formStyle: "classic", supporterDiscount: 0, pickupOptions: ["小川阿姨", "台大面交", "宜蘭面交"],
    groups: [
      { id: 1, name: "產品組合", description: "每組 NT$500，可複選多組", sortOrder: 0, isRequired: true, products: LEGACY_COMBOS.map(toProduct) },
      { id: 2, name: "加購好物", description: "可自由搭配", sortOrder: 1, isRequired: false, products: LEGACY_ADDONS.map(toProduct) },
    ],
    totalOrders: 0,
  };
}

/* ─── 表單風格配色 ─────────────────────────────── */

const FORM_STYLE_THEMES: Record<string, { accent: string; accentLight: string; bg: string; cardBg: string; border: string; stepColors: string[] }> = {
  classic:  { accent: "#c4506a", accentLight: "#d87a90", bg: "transparent", cardBg: "rgba(255,255,255,0.5)", border: "rgba(30,15,8,0.12)", stepColors: ["#c4506a", "#c89530", "#5a7c52", "#1e0f08"] },
  minimal:  { accent: "#333333", accentLight: "#666666", bg: "#fafafa", cardBg: "rgba(255,255,255,0.9)", border: "rgba(0,0,0,0.08)", stepColors: ["#333333", "#555555", "#777777", "#999999"] },
  warm:     { accent: "#d4764e", accentLight: "#e8a07a", bg: "#fdf6ee", cardBg: "rgba(255,248,238,0.8)", border: "rgba(180,140,100,0.2)", stepColors: ["#d4764e", "#c89530", "#8b7355", "#6b4e37"] },
  elegant:  { accent: "#9b6b9e", accentLight: "#c49cc6", bg: "#faf5fb", cardBg: "rgba(255,250,255,0.7)", border: "rgba(155,107,158,0.15)", stepColors: ["#9b6b9e", "#c4849b", "#7b9b8e", "#6b5b7b"] },
  rustic:   { accent: "#8b5e3c", accentLight: "#a87d5a", bg: "#f8f1e8", cardBg: "rgba(248,241,232,0.8)", border: "rgba(139,94,60,0.2)", stepColors: ["#8b5e3c", "#a07040", "#6b7b52", "#5c4033"] },
  playful:  { accent: "#e85d75", accentLight: "#ff8fa0", bg: "#fff8f5", cardBg: "rgba(255,255,255,0.7)", border: "rgba(232,93,117,0.15)", stepColors: ["#e85d75", "#f5a623", "#4ecdc4", "#7b68ee"] },
  modern:   { accent: "#2d3436", accentLight: "#636e72", bg: "#f5f5f5", cardBg: "rgba(255,255,255,0.95)", border: "rgba(0,0,0,0.1)", stepColors: ["#2d3436", "#636e72", "#00b894", "#0984e3"] },
  vintage:  { accent: "#8b4513", accentLight: "#a0522d", bg: "#f5efe0", cardBg: "rgba(245,239,224,0.8)", border: "rgba(139,69,19,0.2)", stepColors: ["#8b4513", "#b8860b", "#556b2f", "#4a3728"] },
  nature:   { accent: "#2d6a4f", accentLight: "#52b788", bg: "#f0f7f0", cardBg: "rgba(240,247,240,0.7)", border: "rgba(45,106,79,0.15)", stepColors: ["#2d6a4f", "#52b788", "#95d5b2", "#1b4332"] },
  festival: { accent: "#c41e3a", accentLight: "#e74c3c", bg: "#fff8f0", cardBg: "rgba(255,252,245,0.8)", border: "rgba(196,30,58,0.15)", stepColors: ["#c41e3a", "#d4a017", "#c41e3a", "#8b0000"] },
};

/* ─── 主頁面 ────────────────────────────────────── */

export default function OrderPage() {
  const router = useRouter();

  // 活動資料
  const [campaign, setCampaign] = useState<ActiveCampaign | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<"loading" | "none" | "out_of_range" | "active">("loading");
  const [outOfRangeInfo, setOutOfRangeInfo] = useState<{ startDate: string; endDate: string; name: string } | null>(null);

  // 是否支持過 Jam for Love
  const [isSupporter, setIsSupporter] = useState(false);

  // 選購數量：key = productId
  const [selections, setSelections] = useState<Record<number, number>>({});

  // 收件資料
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("shipping");
  const [notes, setNotes] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  // 欄位驗證
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 訂單確認頁（尚未送出，僅預覽）
  const [pendingOrder, setPendingOrder] = useState<{
    items: OrderItem[];
    total: number;
    discountAmount: number;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    deliveryMethod: string;
    notes: string;
    isSupporter: boolean;
  } | null>(null);

  // 送出成功
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: number;
    items: OrderItem[];
    total: number;
    discountAmount: number;
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
    if (zipMatch) { setZipcode(zipMatch[1]); remaining = remaining.slice(zipMatch[0].length); }
    const cityMatch = remaining.match(/^([\u4e00-\u9fff]{2,3}[市縣])/);
    if (cityMatch) {
      setCity(cityMatch[1]); remaining = remaining.slice(cityMatch[0].length);
      const distMatch = remaining.match(/^([\u4e00-\u9fff]{2,4}[區鄉鎮市])/);
      if (distMatch) { setDistrict(distMatch[1]); remaining = remaining.slice(distMatch[0].length); }
    }
    setAddressDetail(remaining.trim());
  }

  function loadProfile() {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (data.user) {
        if (data.user.name) setCustomerName(data.user.name);
        if (data.user.phone) setPhone(data.user.phone);
        if (data.user.email) setEmail(data.user.email);
        if (data.user.address) parseAndFillAddress(data.user.address);
        setProfileLoaded(true);
        setTimeout(() => setProfileLoaded(false), 2000);
      }
    }).catch(() => {});
  }

  // 載入活動與既有訂單
  useEffect(() => {
    const campaignUrl = previewCampaignId
      ? `/api/admin/campaigns/${previewCampaignId}`
      : "/api/campaigns/active";

    const loadCampaign = previewCampaignId
      ? fetch(campaignUrl).then((r) => r.json()).then((detail) => {
          // 預覽模式：admin API 回傳 detail 格式，轉換為 ActiveCampaign
          if (!detail || detail.error) { setCampaignStatus("none"); return; }
          const pickupOpts = typeof detail.pickupOptions === "string" ? JSON.parse(detail.pickupOptions) : detail.pickupOptions || [];
          setCampaign({
            ...detail,
            pickupOptions: pickupOpts,
            groups: detail.groups?.map((g: Record<string, unknown>) => ({
              ...g,
              products: (g.products as Record<string, unknown>[])?.map((p: Record<string, unknown>) => ({
                ...p, sold: 0, remaining: p.limit != null ? p.limit : null,
              })) || [],
            })) || [],
            totalOrders: 0,
          });
          setCampaignStatus("active");
        })
      : fetch(campaignUrl).then((r) => r.json()).then(async (data) => {
      if (data.campaign && data.campaign.status !== "out_of_range") {
        setCampaign(data.campaign);
        setCampaignStatus("active");
      } else if (data.campaign?.status === "out_of_range") {
        setCampaignStatus("out_of_range");
        setOutOfRangeInfo({ startDate: data.campaign.startDate, endDate: data.campaign.endDate, name: data.campaign.name });
      } else {
        // Fallback：用 site_settings 的預購期間
        const [sRes, eRes] = await Promise.all([
          fetch("/api/site-settings?key=fundraise_start").then((r) => r.json()),
          fetch("/api/site-settings?key=fundraise_end").then((r) => r.json()),
        ]);
        const now = new Date();
        const start = sRes.value ? new Date(sRes.value) : null;
        const end = eRes.value ? new Date(eRes.value + "T23:59:59") : null;

        if (start && end && now >= start && now <= end) {
          // 用 hardcoded 商品建立虛擬 campaign
          setCampaign(buildLegacyCampaign(sRes.value, eRes.value));
          setCampaignStatus("active");
        } else if (sRes.value && eRes.value) {
          setCampaignStatus("out_of_range");
          setOutOfRangeInfo({ startDate: sRes.value, endDate: eRes.value, name: "預購" });
        } else {
          setCampaignStatus("none");
        }
      }
    }).catch(() => setCampaignStatus("none"));

    loadCampaign.catch(() => setCampaignStatus("none"));

    if (!previewCampaignId) loadProfile();
  }, []);

  // 從 sessionStorage 恢復
  useEffect(() => {
    const saved = sessionStorage.getItem("order_selections");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.selections) setSelections(data.selections);
        if (data.deliveryMethod) setDeliveryMethod(data.deliveryMethod);
        if (data.notes) setNotes(data.notes);
        if (data.isSupporter) setIsSupporter(data.isSupporter);
      } catch { /* ignore */ }
      sessionStorage.removeItem("order_selections");
    }
  }, []);

  // 計算
  const allProducts = useMemo(() => campaign?.groups.flatMap((g) => g.products) ?? [], [campaign]);

  const subtotal = useMemo(
    () => Object.entries(selections).reduce((sum, [id, qty]) => {
      const p = allProducts.find((p) => p.id === Number(id));
      return sum + (p ? p.price * qty : 0);
    }, 0),
    [selections, allProducts]
  );

  const discountAmount = useMemo(
    () => isSupporter && campaign?.supporterDiscount ? Math.round(subtotal * campaign.supporterDiscount / 100) : 0,
    [isSupporter, campaign, subtotal]
  );

  const grandTotal = subtotal - discountAmount;

  const hasRequiredSelection = useMemo(() => {
    if (!campaign) return false;
    return campaign.groups.filter((g) => g.isRequired).every((g) =>
      g.products.some((p) => (selections[p.id] || 0) > 0)
    );
  }, [campaign, selections]);

  const hasAnySelection = Object.values(selections).some((q) => q > 0);
  // 預覽模式
  const [searchParams] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams());
  const previewCampaignId = searchParams.get("preview");

  function updateSelection(productId: number, delta: number, remaining: number | null) {
    setSelections((prev) => {
      const next = Math.max(0, (prev[productId] || 0) + delta);
      if (remaining !== null && next > remaining) return prev;
      return { ...prev, [productId]: next };
    });
  }

  // 欄位驗證
  function markTouched(field: string) { setTouched((prev) => ({ ...prev, [field]: true })); }
  const fieldErrors: Record<string, string> = {};
  if (touched.customerName && !customerName.trim()) fieldErrors.customerName = "請填寫姓名";
  if (touched.phone && !phone.trim()) fieldErrors.phone = "請填寫電話";
  if (touched.phone && phone.trim() && !/^0\d{8,9}$/.test(phone.trim())) fieldErrors.phone = "電話格式不正確";
  if (touched.email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) fieldErrors.email = "Email 格式不正確";
  if (touched.addressDetail && deliveryMethod === "shipping" && !addressDetail.trim()) fieldErrors.addressDetail = "請填寫詳細地址";

  // 進入確認頁（不送 API）
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;
    if (!hasRequiredSelection) { setError("請至少從必填分組中選擇一項"); return; }

    setTouched({ customerName: true, phone: true, email: true, addressDetail: true });
    if (!customerName.trim() || !phone.trim()) { setError("請填寫必填欄位"); return; }
    if (deliveryMethod === "shipping" && !addressDetail.trim()) { setError("請填寫收件地址"); return; }

    setError("");

    const items: OrderItem[] = Object.entries(selections)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const p = allProducts.find((p) => p.id === Number(id))!;
        const g = campaign.groups.find((g) => g.products.some((gp) => gp.id === p.id))!;
        return { productId: p.id, name: p.name, description: p.description, group: g.name, quantity: qty, price: p.price };
      });

    const isShipping = deliveryMethod === "shipping";
    const finalAddress = isShipping
      ? `${zipcode} ${city}${district}${addressDetail}`.trim()
      : deliveryMethod.startsWith("pickup:") ? deliveryMethod.replace("pickup:", "") : "面交";

    setPendingOrder({
      items, total: grandTotal, discountAmount,
      customerName, phone, email, address: finalAddress, deliveryMethod, notes, isSupporter,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 真正送出訂單
  async function handleConfirmSubmit() {
    if (!campaign || !pendingOrder) return;
    setError(""); setLoading(true);

    try {
      const method = "POST";
      const isShipping = pendingOrder.deliveryMethod === "shipping";
      const payload: Record<string, unknown> = {
        campaignId: campaign.id,
        customerName: pendingOrder.customerName,
        phone: pendingOrder.phone,
        email: pendingOrder.email,
        address: pendingOrder.address,
        deliveryMethod: isShipping ? "shipping" : "pickup",
        items: pendingOrder.items,
        notes: pendingOrder.notes,
        total: pendingOrder.total,
        isSupporter: pendingOrder.isSupporter,
      };

      const res = await fetch("/api/orders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      setConfirmedOrder({
        orderId: data.orderId,
        items: pendingOrder.items,
        total: pendingOrder.total,
        discountAmount: pendingOrder.discountAmount,
        customerName: pendingOrder.customerName,
        phone: pendingOrder.phone,
        email: pendingOrder.email,
        address: pendingOrder.address,
        deliveryMethod: pendingOrder.deliveryMethod,
        notes: pendingOrder.notes,
      });
      setPendingOrder(null);
      setSubmitted(true);
    } catch {
      setError("網路連線失敗，請稍後再試");
    }
    setLoading(false);
  }

  /* ─── 載入中 ─── */
  if (campaignStatus === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-3" />
          <p className="text-espresso-light/40 text-sm">載入中...</p>
        </div>
      </div>
    );
  }

  /* ─── 無活動 / 不在期間 ─── */
  if (campaignStatus === "none" || campaignStatus === "out_of_range") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6 animate-[bakeBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">🍯</div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-4 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both]">
            預購尚未開放
          </h1>
          {outOfRangeInfo ? (
            <div className="animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.25s_both]">
              <p className="text-espresso-light/60 text-base leading-relaxed mb-2">
                <span className="font-medium text-espresso">{outOfRangeInfo.name}</span> 的預購期間為
              </p>
              <p className="text-espresso-light/60 text-base mb-2">
                <span className="font-medium text-espresso">{outOfRangeInfo.startDate}</span> ~ <span className="font-medium text-espresso">{outOfRangeInfo.endDate}</span>
              </p>
              <p className="text-espresso-light/40 text-sm mb-8">
                {new Date() < new Date(outOfRangeInfo.startDate) ? "再等等，馬上就開放囉！" : "本次預購已結束，感謝你的支持！"}
              </p>
            </div>
          ) : (
            <p className="text-espresso-light/60 text-base leading-relaxed mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.25s_both]">預購時間尚未公佈，敬請期待！</p>
          )}
          <div className="animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_both]">
            <button onClick={() => router.push("/")} className="btn-primary">回到首頁</button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── 確認訂單（預覽，尚未送出）─── */
  if (pendingOrder) {
    const order = pendingOrder;
    const groupedItems = order.items.reduce<Record<string, OrderItem[]>>((acc, item) => {
      (acc[item.group] ??= []).push(item);
      return acc;
    }, {});

    return (
      <div className="max-w-2xl mx-auto px-5 py-10 md:py-16 relative overflow-hidden">
        <div className="text-center mb-8 relative z-10 animate-[bakeBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "linear-gradient(135deg, var(--color-honey), var(--color-honey-light))" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2" style={{ fontStyle: "italic" }}>請確認訂單內容</h1>
          <p className="text-espresso-light/50 text-sm">確認無誤後，請點擊下方按鈕送出訂單</p>
        </div>

        {/* 訂單明細 */}
        <div className="rounded-2xl p-6 mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(235,226,212,0.8)", boxShadow: "0 4px 24px rgba(30,15,8,0.06)" }}>
          <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2"><span className="text-rose">♥</span> 訂單明細</h2>
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-4">
              <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-2">{groupName}</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px dashed rgba(30,15,8,0.06)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso font-medium">{item.name}</p>
                      {item.description && <p className="text-espresso-light/50 text-xs mt-0.5">{item.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-espresso text-sm">x{item.quantity}</p>
                      <p className="text-espresso-light/60 text-xs">NT$ {item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {order.discountAmount > 0 && (
            <div className="pt-3 mt-2 space-y-1" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-light/60">小計</span>
                <span className="text-espresso">NT$ {order.total + order.discountAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rose/70">♥ 舊朋友折扣</span>
                <span className="text-rose">-NT$ {order.discountAmount}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="font-serif font-bold text-espresso">合計</p>
                <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
              </div>
            </div>
          )}
          {order.discountAmount === 0 && (
            <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
              <p className="font-serif font-bold text-espresso">合計</p>
              <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
            </div>
          )}
        </div>

        {/* 收件資訊 */}
        <div className="rounded-2xl p-6 mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.35s_both]" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(235,226,212,0.8)", boxShadow: "0 4px 24px rgba(30,15,8,0.06)" }}>
          <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2"><span className="text-rose">♥</span> 收件資訊</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">收件人</span><span className="text-espresso">{order.customerName}</span></div>
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">電話</span><span className="text-espresso">{order.phone}</span></div>
            {order.email && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">Email</span><span className="text-espresso">{order.email}</span></div>}
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">取貨方式</span><span className="text-espresso">{order.deliveryMethod === "shipping" ? "郵寄" : order.address}</span></div>
            {order.deliveryMethod === "shipping" && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">地址</span><span className="text-espresso">{order.address}</span></div>}
            {order.notes && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">備註</span><span className="text-espresso">{order.notes}</span></div>}
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && <p className="text-rose text-sm font-medium mb-4 text-center animate-shake" role="alert">{error}</p>}

        {/* 按鈕 */}
        <div className="flex gap-3 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]">
          <button
            onClick={() => { setPendingOrder(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex-1 py-4 rounded-lg font-serif font-bold text-base text-espresso-light hover:text-espresso active:scale-[0.97] transition-all"
            style={{ border: "2px dashed rgba(30,15,8,0.15)" }}
            disabled={loading}
          >
            返回修改
          </button>
          <button
            onClick={handleConfirmSubmit}
            disabled={loading}
            className="flex-1 py-4 text-white font-serif font-bold text-lg rounded-lg transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.97] disabled:opacity-60"
            style={{ background: "var(--color-rose)", border: "2px dashed rgba(196,80,106,0.3)", boxShadow: "0 4px 16px rgba(196,80,106,0.2)" }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
                送出中...
              </span>
            ) : "確認送出訂單"}
          </button>
        </div>
        <p className="text-center text-espresso-light/30 text-sm mt-4">
          如有需要修改，請點擊「返回修改」
        </p>
      </div>
    );
  }

  /* ─── 送出成功 ─── */
  if (submitted && confirmedOrder) {
    const order = confirmedOrder;
    // 按 group 分組顯示
    const groupedItems = order.items.reduce<Record<string, OrderItem[]>>((acc, item) => {
      (acc[item.group] ??= []).push(item);
      return acc;
    }, {});

    return (
      <div className="max-w-2xl mx-auto px-5 py-10 md:py-16 relative overflow-hidden">
        <div className="text-center mb-8 relative z-10 animate-[bakeBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-sage-dark, #6b8f71))" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2" style={{ fontStyle: "italic" }}>收到你的心意了！</h1>
          <p className="text-espresso-light/50 text-sm">訂單編號 <span className="font-medium text-espresso">#{order.orderId}</span></p>
        </div>

        <div className="rounded-2xl p-6 mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(235,226,212,0.8)", boxShadow: "0 4px 24px rgba(30,15,8,0.06)" }}>
          <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2"><span className="text-rose">♥</span> 訂單明細</h2>
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-4">
              <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-2">{groupName}</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px dashed rgba(30,15,8,0.06)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso font-medium">{item.name}</p>
                      {item.description && <p className="text-espresso-light/50 text-xs mt-0.5">{item.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-espresso text-sm">x{item.quantity}</p>
                      <p className="text-espresso-light/60 text-xs">NT$ {item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {order.discountAmount > 0 && (
            <div className="pt-3 mt-2 space-y-1" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-light/60">小計</span>
                <span className="text-espresso">NT$ {order.total + order.discountAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rose/70">♥ 舊朋友折扣</span>
                <span className="text-rose">-NT$ {order.discountAmount}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="font-serif font-bold text-espresso">合計</p>
                <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
              </div>
            </div>
          )}
          {order.discountAmount === 0 && (
            <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
              <p className="font-serif font-bold text-espresso">合計</p>
              <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6 mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.35s_both]" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(235,226,212,0.8)", boxShadow: "0 4px 24px rgba(30,15,8,0.06)" }}>
          <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2"><span className="text-rose">♥</span> 收件資訊</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">收件人</span><span className="text-espresso">{order.customerName}</span></div>
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">電話</span><span className="text-espresso">{order.phone}</span></div>
            {order.email && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">Email</span><span className="text-espresso">{order.email}</span></div>}
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">取貨方式</span><span className="text-espresso">{order.deliveryMethod === "shipping" ? "郵寄" : order.address}</span></div>
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">地址</span><span className="text-espresso">{order.address}</span></div>
            {order.notes && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">備註</span><span className="text-espresso">{order.notes}</span></div>}
          </div>
        </div>

        <div className="text-center mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]">
          <p className="text-espresso-light/50 text-sm leading-relaxed mb-2">訂單已收到囉，我們會用心為你準備</p>
          {order.email && <p className="text-espresso-light/40 text-xs">確認信已寄送至 <span className="text-espresso font-medium">{order.email}</span></p>}
        </div>

        <div className="flex gap-3 justify-center animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.6s_both]">
          <Link href="/my-orders" className="px-6 py-3 rounded-lg font-serif font-bold text-base text-rose hover:bg-rose hover:text-white active:scale-95 transition-all" style={{ border: "2px dashed var(--color-rose)" }}>查看我的訂單</Link>
          <button onClick={() => router.push("/")} className="btn-primary">回到首頁</button>
        </div>
      </div>
    );
  }

  /* ─── 表單 ─── */
  if (!campaign) return null;

  const theme = FORM_STYLE_THEMES[campaign.formStyle] || FORM_STYLE_THEMES.classic;

  const inputClass = "w-full py-3 px-0 bg-transparent text-lg text-espresso outline-none placeholder:text-espresso-light/30 transition-colors";
  const inputBorder = { borderBottom: `2px dashed ${theme.border}` };
  const inputBorderFocus = `focus-within:[border-bottom-color:${theme.accent}]`;

  const stepColors = theme.stepColors;
  // Steps: each group + 收件資料 + 訂單摘要
  let stepIdx = 0;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-16" style={{ background: theme.bg }}>
      {/* 標頭 */}
      <div className="text-center mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso" style={{ fontStyle: "italic" }}>
          {campaign.name}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="w-10 h-px" style={{ background: `${theme.accent}50` }} /><span className="text-sm" style={{ color: theme.accent }}>♥</span><span className="w-10 h-px" style={{ background: `${theme.accent}50` }} />
        </div>
        <p className="text-espresso-light/50 text-base mt-4 leading-relaxed max-w-md mx-auto">
          每一瓶果醬、每一塊手工皂，都由學生親手製作。<br />你的支持，是我們最大的動力。
        </p>
      </div>

      {/* 說明圖 */}
      {campaign.bannerUrl && (
        <div className="mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.05s_both]">
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(30,15,8,0.08)", border: "1px solid rgba(235,226,212,0.8)" }}>
            <Image src={campaign.bannerUrl} alt="活動說明" width={800} height={800} className="w-full h-auto" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 是否支持過 Jam for Love */}
        {campaign.supporterDiscount > 0 && (
          <div className="mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.08s_both]">
            <button
              type="button"
              onClick={() => setIsSupporter((v) => !v)}
              className={`w-full rounded-xl p-5 text-left transition-all duration-300 ${isSupporter ? "shadow-md" : "hover:bg-white/80"}`}
              style={isSupporter ? { background: `${theme.accent}0a`, border: `2px solid ${theme.accent}`, boxShadow: `0 4px 12px ${theme.accent}15` } : { background: theme.cardBg, border: `2px dashed ${theme.border}` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all" style={isSupporter ? { background: theme.accent, color: "#fff" } : { background: "var(--color-linen)", border: "1px solid rgba(30,15,8,0.15)" }}>
                  {isSupporter && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div className="flex-1">
                  <p className="font-serif text-lg font-bold text-espresso">是否支持過 Jam for Love 呢？</p>
                  <p className="text-espresso-light/50 text-sm mt-0.5">
                    曾經購買過的朋友，感謝你的持續支持！勾選即享 <span className="font-semibold" style={{ color: theme.accent }}>{campaign.supporterDiscount}% 折扣</span>
                  </p>
                </div>
                {isSupporter && <span className="text-2xl" style={{ color: theme.accent }}>♥</span>}
              </div>
            </button>
          </div>
        )}

        <div className="relative pl-11 md:pl-14">
          <div className="absolute left-[17px] md:left-[21px] top-0 bottom-0 w-0" style={{ borderLeft: "2px dashed rgba(30,15,8,0.1)" }} />

          {/* 動態分組 */}
          {campaign.groups.map((group) => {
            const currentStep = ++stepIdx;
            const color = stepColors[(currentStep - 1) % stepColors.length];
            const hasGroupSelection = group.products.some((p) => (selections[p.id] || 0) > 0);

            return (
              <div key={group.id} className="relative mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
                <div
                  className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
                  style={{ background: color, border: `3px dashed ${color}40`, boxShadow: `0 2px 8px ${color}30` }}
                >
                  {currentStep}
                </div>
                <div className="mb-1">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso">
                    {group.name} {group.isRequired && <span className="text-rose text-sm font-normal">*</span>}
                  </h2>
                  {group.description && <p className="text-espresso-light/40 text-base">{group.description}</p>}
                </div>

                <div className="space-y-2.5 mt-4">
                  {group.products.map((product) => {
                    const qty = selections[product.id] || 0;
                    const isSelected = qty > 0;
                    const soldOut = product.remaining !== null && product.remaining <= 0 && qty === 0;

                    return (
                      <div
                        key={product.id}
                        className={`rounded-lg p-4 transition-all duration-300 ${soldOut ? "opacity-50" : ""} ${isSelected ? "" : "hover:translate-y-[-2px]"}`}
                        style={{ border: isSelected ? `2px dashed ${theme.accent}` : `2px dashed ${theme.border}`, background: isSelected ? `${theme.accent}08` : theme.cardBg }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-serif font-bold text-espresso text-lg">{product.name}</span>
                              <span className="text-lg font-bold tabular-nums" style={{ color: "var(--color-honey)" }}>
                                ${product.price}
                              </span>
                              {soldOut ? (
                                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-espresso-light/10 text-espresso-light/50">已售完</span>
                              ) : product.remaining !== null ? (
                                <span className={`text-sm ${product.remaining <= 5 ? "text-rose font-semibold" : "text-espresso-light/30"}`}>
                                  剩 {product.remaining} {product.unit}
                                </span>
                              ) : product.limit ? (
                                <span className="text-espresso-light/30 text-sm">限 {product.limit} {product.unit}</span>
                              ) : null}
                            </div>
                            {product.description && <p className="text-espresso-light/50 text-[1.05rem]">{product.description}</p>}
                            {product.note && <p className="text-rose/60 text-sm mt-0.5">{product.note}</p>}
                          </div>
                          <div className="shrink-0">
                            {soldOut ? (
                              <span className="px-4 py-2 rounded-lg text-base font-medium text-espresso-light/30" style={{ border: "2px dashed rgba(30,15,8,0.08)" }}>售完</span>
                            ) : isSelected ? (
                              <div className="flex items-center gap-1.5">
                                <button type="button" onClick={() => updateSelection(product.id, -1, product.remaining)} className="w-9 h-9 rounded-lg text-espresso-light hover:text-rose transition-all flex items-center justify-center text-lg" style={{ border: "2px dashed rgba(30,15,8,0.12)" }}>−</button>
                                <span key={qty} className="w-7 text-center font-bold text-espresso tabular-nums text-base animate-[number-pop_0.3s_ease]">{qty}</span>
                                <button type="button" onClick={() => updateSelection(product.id, 1, product.remaining)} className="w-9 h-9 rounded-lg text-espresso-light hover:text-rose transition-all flex items-center justify-center text-lg" style={{ border: "2px dashed rgba(30,15,8,0.12)" }}>+</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => updateSelection(product.id, 1, product.remaining)} className="px-4 py-2 rounded-lg text-base font-medium hover:text-white active:scale-95 transition-all" style={{ color: theme.accent, border: `2px dashed ${theme.accent}50` }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.accent; e.currentTarget.style.color = "#fff"; }} onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = theme.accent; }}>選擇</button>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: `1px dashed ${theme.border}` }}>
                            <span className="text-espresso-light/40 text-base">{qty} {product.unit} × NT${product.price}</span>
                            <span className="font-bold text-base" style={{ color: theme.accent, fontFamily: "var(--font-display)" }}>NT$ {qty * product.price}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 收件資料 */}
          {hasAnySelection && (
          <>
          <div className="relative mb-10 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_both]">
            <div
              className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
              style={{ background: "var(--color-sage)", border: "3px dashed rgba(107,142,95,0.3)", boxShadow: "0 2px 8px rgba(107,142,95,0.2)" }}
            >
              {stepIdx + 1}
            </div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso">填寫資料</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={loadProfile} className="px-3 py-1.5 rounded-lg text-xs font-medium text-sage hover:bg-sage/10 transition-all" style={{ border: "1.5px dashed rgba(107,142,95,0.3)" }}>
                  {profileLoaded ? "✓ 已帶入" : "帶入個人資料"}
                </button>
                <Link href="/profile?from=order" onClick={() => { sessionStorage.setItem("order_selections", JSON.stringify({ selections, deliveryMethod, notes, isSupporter })); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-espresso-light/40 hover:text-espresso hover:bg-linen-dark/20 transition-all" style={{ border: "1.5px dashed rgba(30,15,8,0.08)" }}>編輯</Link>
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

              <div className="pt-4 pb-2">
                <label className="block text-sm font-semibold text-espresso-light/50 mb-3">取貨方式 *</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full py-3 px-4 rounded-lg text-lg text-espresso bg-white outline-none transition-colors"
                  style={{ border: `2px dashed ${theme.border}` }}
                >
                  <option value="shipping">📦 郵寄</option>
                  {(campaign.pickupOptions || []).map((opt) => (
                    <option key={opt} value={`pickup:${opt}`}>🤝 {opt}</option>
                  ))}
                </select>
              </div>

              {deliveryMethod === "shipping" && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-espresso-light/50 mb-2">收件地址 *</label>
                  <TaiwanAddressSelector zipcode={zipcode} city={city} district={district} detail={addressDetail} onChangeZipcode={handleChangeZipcode} onChangeCity={handleChangeCity} onChangeDistrict={handleChangeDistrict} onChangeDetail={(v) => { handleChangeDetail(v); markTouched("addressDetail"); }} />
                  {fieldErrors.addressDetail && <p className="text-rose text-xs mt-1">{fieldErrors.addressDetail}</p>}
                </div>
              )}

              <div className={inputBorderFocus} style={inputBorder}>
                <label className="block text-sm font-semibold text-espresso-light/50 pt-2">備註</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="有什麼想告訴我們的？" />
              </div>
            </div>
          </div>

          {/* 訂單摘要 */}
          <div className="relative mb-8 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_both]">
            <div className="absolute -left-11 md:-left-14 w-[34px] md:w-[42px] h-[34px] md:h-[42px] rounded-full flex items-center justify-center text-sm" style={{ background: "var(--color-espresso)", color: "var(--color-linen)", border: "3px dashed rgba(30,15,8,0.2)", fontFamily: "var(--font-display)" }}>♥</div>
            <div className="rounded-lg p-5" style={{ border: `2px dashed ${theme.border}`, background: theme.cardBg }}>
              <h3 className="font-serif text-2xl font-bold text-espresso mb-3">訂單摘要</h3>
              <div className="space-y-1.5">
                {Object.entries(selections).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                  const p = allProducts.find((p) => p.id === Number(id));
                  if (!p) return null;
                  return (
                    <div key={id} className="flex justify-between text-base">
                      <span className="text-espresso-light">{p.name} × {qty}</span>
                      <span className="text-espresso font-medium tabular-nums">NT$ {p.price * qty}</span>
                    </div>
                  );
                })}
              </div>
              {discountAmount > 0 && (
                <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: "2px dashed rgba(30,15,8,0.08)" }}>
                  <div className="flex justify-between text-base">
                    <span className="text-espresso-light">小計</span>
                    <span className="text-espresso tabular-nums">NT$ {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span style={{ color: theme.accent }}>♥ 舊朋友折扣（{campaign?.supporterDiscount}%）</span>
                    <span className="font-medium tabular-nums" style={{ color: theme.accent }}>-NT$ {discountAmount}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1.5" style={{ borderTop: `1px dashed ${theme.border}` }}>
                    <span className="font-serif font-bold text-espresso">合計</span>
                    <span className="font-bold text-2xl" style={{ color: theme.accent, fontFamily: "var(--font-display)" }}>NT$ {grandTotal}</span>
                  </div>
                </div>
              )}
              {discountAmount === 0 && (
                <div className="mt-3 pt-3 flex justify-between items-baseline" style={{ borderTop: `2px dashed ${theme.border}` }}>
                  <span className="font-serif font-bold text-espresso">合計</span>
                  <span className="font-bold text-2xl" style={{ color: theme.accent, fontFamily: "var(--font-display)" }}>NT$ {grandTotal}</span>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>

        {/* 送出 */}
        {error && <p className="text-rose text-sm font-medium mb-4 animate-shake" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={loading || !hasAnySelection}
          className="w-full py-4 text-white font-serif font-bold text-lg rounded-lg transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]"
          style={{ background: theme.accent, border: `2px dashed ${theme.accent}50`, boxShadow: `0 4px 16px ${theme.accent}30` }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
              送出中...
            </span>
          ) : hasAnySelection ? `確認訂購 — NT$ ${grandTotal}` : "請先選擇商品"}
        </button>
        <p className="text-center text-espresso-light/30 text-sm mt-4">
          送出後我們會以電話或 Email 確認訂單 ♥
        </p>
      </form>
    </div>
  );
}
