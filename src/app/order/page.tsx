"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TaiwanAddressSelector from "@/components/TaiwanAddressSelector";
import { discountToLabel, type SupportOption } from "@/lib/supportTypes";
import { parseBannerUrls } from "@/lib/bannerUrls";

/* ─── 型別定義 ─────────────────────────────────── */

interface CampaignProduct {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
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
  description: string;
  formStyle: string;
  supporterDiscount: number;
  supportOptions: SupportOption[];
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
    id: item.id, name: item.name, description: item.desc || "", imageUrl: "", price: item.price,
    limit: item.limit, unit: "份", sortOrder: 0, note: "", isActive: true,
    sold: 0, remaining: item.limit,
  });
  return {
    id: 0, name: "Jam for Love", status: "active", startDate, endDate,
    bannerUrl: "", description: "", formStyle: "classic", supporterDiscount: 0, supportOptions: [], pickupOptions: ["小川阿姨", "台大面交", "宜蘭面交"],
    groups: [
      { id: 1, name: "產品組合", description: "每組 NT$500，可複選多組", sortOrder: 0, isRequired: true, products: LEGACY_COMBOS.map(toProduct) },
      { id: 2, name: "加購好物", description: "可自由搭配", sortOrder: 1, isRequired: false, products: LEGACY_ADDONS.map(toProduct) },
    ],
    totalOrders: 0,
  };
}

/* ─── 分享連結按鈕 ─────────────────────────────── */

function ShareButton({ theme }: { theme: FormTheme }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/order`;
    // 優先使用原生分享 API（手機常見）
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & {
          share: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
        }).share({
          title: "Jam for Love 預購",
          text: "來訂一罐手作果醬，支持助人工作者 ♥",
          url,
        });
        return;
      } catch {
        // 使用者取消或不支援，改走複製
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("複製以下連結分享：", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
      style={{
        color: theme.accent,
        background: `${theme.accent}12`,
        border: `1px ${theme.borderStyle === "double" ? "solid" : theme.borderStyle} ${theme.accent}40`,
      }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          已複製連結
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="11.49" />
          </svg>
          分享預購連結
        </>
      )}
    </button>
  );
}

/* ─── 匯款資訊元件 ─────────────────────────────── */

function BankTransferInfo() {
  const [info, setInfo] = useState("");
  useEffect(() => {
    fetch("/api/site-settings?key=bank_transfer_info")
      .then((r) => r.json())
      .then((data) => { if (data.value) setInfo(data.value); })
      .catch(() => {});
  }, []);
  if (!info) return null;
  return (
    <div className="mt-3 rounded-lg bg-linen/60 p-4 ring-1 ring-linen-dark/30">
      <p className="text-xs font-semibold text-espresso-light/50 mb-1.5">匯款資訊</p>
      <p className="text-sm text-espresso whitespace-pre-wrap">{info}</p>
    </div>
  );
}

/* ─── 表單風格配色 ─────────────────────────────── */

interface FormTheme {
  accent: string;
  accentLight: string;
  bg: string;
  cardBg: string;
  border: string;
  stepColors: string[];
  /** 邊框線型 */
  borderStyle: "dashed" | "solid" | "dotted" | "double";
  /** 邊框粗細（px 數字） */
  borderWidth: number;
  /** tailwind-style 圓角 class 補丁（用 class 名） */
  radiusCard: string;
  radiusButton: string;
  radiusPill: string;
  /** Heading 字體 (CSS variable / font-family) */
  fontHeading: string;
  /** Heading 字體樣式：italic 或 normal */
  headingItalic: boolean;
  /** 大寫字母距離（例如 modern 風） */
  headingTracking: string;
  /** 裝飾符號（表頭左右、步驟分隔） */
  decoSymbol: string;
  /** 背景圖樣 (CSS background-image)，可選 */
  bgPattern?: string;
  /** 卡片陰影 */
  cardShadow: string;
}

const FORM_STYLE_THEMES: Record<string, FormTheme> = {
  classic:  {
    accent: "#c4506a", accentLight: "#d87a90", bg: "transparent", cardBg: "rgba(255,255,255,0.5)", border: "rgba(30,15,8,0.12)",
    stepColors: ["#c4506a", "#c89530", "#5a7c52", "#1e0f08"],
    borderStyle: "dashed", borderWidth: 2, radiusCard: "rounded-2xl", radiusButton: "rounded-lg", radiusPill: "rounded-full",
    fontHeading: "var(--font-display), serif", headingItalic: true, headingTracking: "normal",
    decoSymbol: "♥", cardShadow: "0 8px 24px rgba(196,80,106,0.08)",
  },
  minimal:  {
    accent: "#1a1a1a", accentLight: "#555555", bg: "#fafafa", cardBg: "#ffffff", border: "rgba(0,0,0,0.08)",
    stepColors: ["#1a1a1a", "#333333", "#666666", "#999999"],
    borderStyle: "solid", borderWidth: 1, radiusCard: "rounded-md", radiusButton: "rounded", radiusPill: "rounded",
    fontHeading: "var(--font-sans), system-ui, sans-serif", headingItalic: false, headingTracking: "0.05em",
    decoSymbol: "—", cardShadow: "none",
  },
  warm:     {
    accent: "#d4764e", accentLight: "#e8a07a", bg: "#fdf6ee", cardBg: "#fff8ee", border: "rgba(180,140,100,0.35)",
    stepColors: ["#d4764e", "#c89530", "#8b7355", "#6b4e37"],
    borderStyle: "dashed", borderWidth: 2, radiusCard: "rounded-2xl", radiusButton: "rounded-lg", radiusPill: "rounded-full",
    fontHeading: "var(--font-handwritten), cursive", headingItalic: false, headingTracking: "0.02em",
    decoSymbol: "✦", cardShadow: "0 6px 18px rgba(180,120,70,0.12)",
    bgPattern: "repeating-linear-gradient(45deg, rgba(212,118,78,0.04) 0 2px, transparent 2px 12px)",
  },
  elegant:  {
    accent: "#9b6b9e", accentLight: "#c49cc6", bg: "#faf5fb", cardBg: "rgba(255,250,255,0.85)", border: "rgba(155,107,158,0.22)",
    stepColors: ["#9b6b9e", "#c4849b", "#7b9b8e", "#6b5b7b"],
    borderStyle: "solid", borderWidth: 1, radiusCard: "rounded-3xl", radiusButton: "rounded-full", radiusPill: "rounded-full",
    fontHeading: "var(--font-display), serif", headingItalic: true, headingTracking: "0.02em",
    decoSymbol: "❀", cardShadow: "0 10px 30px rgba(155,107,158,0.15)",
    bgPattern: "radial-gradient(circle at 20% 20%, rgba(196,156,198,0.12) 0 40%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(196,132,155,0.1) 0 40%, transparent 40%)",
  },
  rustic:   {
    accent: "#8b5e3c", accentLight: "#a87d5a", bg: "#f1e4cd", cardBg: "rgba(248,237,215,0.92)", border: "rgba(139,94,60,0.45)",
    stepColors: ["#8b5e3c", "#a07040", "#6b7b52", "#5c4033"],
    borderStyle: "double", borderWidth: 4, radiusCard: "rounded-lg", radiusButton: "rounded", radiusPill: "rounded",
    fontHeading: "var(--font-vintage), Georgia, serif", headingItalic: false, headingTracking: "0.04em",
    decoSymbol: "❧", cardShadow: "0 4px 0 rgba(139,94,60,0.25)",
    bgPattern: "repeating-linear-gradient(90deg, rgba(139,94,60,0.06) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgba(139,94,60,0.04) 0 1px, transparent 1px 40px)",
  },
  playful:  {
    accent: "#e85d75", accentLight: "#ff8fa0", bg: "#fff5f8", cardBg: "#ffffff", border: "rgba(232,93,117,0.3)",
    stepColors: ["#e85d75", "#f5a623", "#4ecdc4", "#7b68ee"],
    borderStyle: "solid", borderWidth: 3, radiusCard: "rounded-3xl", radiusButton: "rounded-full", radiusPill: "rounded-full",
    fontHeading: "var(--font-handwritten), cursive", headingItalic: false, headingTracking: "0",
    decoSymbol: "✿", cardShadow: "0 8px 0 rgba(232,93,117,0.18)",
  },
  modern:   {
    accent: "#1a1a1a", accentLight: "#636e72", bg: "#ffffff", cardBg: "#f7f7f7", border: "#1a1a1a",
    stepColors: ["#1a1a1a", "#444444", "#888888", "#bbbbbb"],
    borderStyle: "solid", borderWidth: 2, radiusCard: "rounded-none", radiusButton: "rounded-none", radiusPill: "rounded-none",
    fontHeading: "var(--font-condensed), Impact, sans-serif", headingItalic: false, headingTracking: "0.12em",
    decoSymbol: "│", cardShadow: "6px 6px 0 #1a1a1a",
  },
  vintage:  {
    accent: "#8b4513", accentLight: "#b8860b", bg: "#f5e9d0", cardBg: "#fbf3de", border: "rgba(139,69,19,0.35)",
    stepColors: ["#8b4513", "#b8860b", "#556b2f", "#4a3728"],
    borderStyle: "dotted", borderWidth: 2, radiusCard: "rounded-sm", radiusButton: "rounded-sm", radiusPill: "rounded",
    fontHeading: "var(--font-vintage), Georgia, serif", headingItalic: true, headingTracking: "0.08em",
    decoSymbol: "§", cardShadow: "0 2px 0 rgba(139,69,19,0.2)",
    bgPattern: "repeating-radial-gradient(circle at 20% 30%, rgba(139,69,19,0.04) 0 1px, transparent 1px 6px)",
  },
  nature:   {
    accent: "#2d6a4f", accentLight: "#52b788", bg: "#eef6ea", cardBg: "rgba(255,255,255,0.85)", border: "rgba(45,106,79,0.3)",
    stepColors: ["#2d6a4f", "#52b788", "#95d5b2", "#1b4332"],
    borderStyle: "solid", borderWidth: 2, radiusCard: "rounded-[28px]", radiusButton: "rounded-full", radiusPill: "rounded-full",
    fontHeading: "var(--font-serif), serif", headingItalic: false, headingTracking: "0.02em",
    decoSymbol: "🌿", cardShadow: "0 6px 18px rgba(45,106,79,0.12)",
    bgPattern: "radial-gradient(circle at 10% 10%, rgba(82,183,136,0.08) 0 30%, transparent 30%), radial-gradient(circle at 90% 70%, rgba(45,106,79,0.06) 0 25%, transparent 25%)",
  },
  festival: {
    accent: "#c41e3a", accentLight: "#d4a017", bg: "#fff2e0", cardBg: "rgba(255,248,232,0.92)", border: "rgba(212,160,23,0.5)",
    stepColors: ["#c41e3a", "#d4a017", "#c41e3a", "#8b0000"],
    borderStyle: "double", borderWidth: 4, radiusCard: "rounded-xl", radiusButton: "rounded-md", radiusPill: "rounded-full",
    fontHeading: "var(--font-vintage), Georgia, serif", headingItalic: false, headingTracking: "0.06em",
    decoSymbol: "★", cardShadow: "0 6px 18px rgba(196,30,58,0.2)",
    bgPattern: "repeating-linear-gradient(45deg, rgba(212,160,23,0.08) 0 10px, transparent 10px 20px)",
  },
};

/* ─── 商品卡片元件 ─────────────────────────────── */

function ProductCard({
  product,
  qty,
  theme,
  onUpdate,
  onZoom,
}: {
  product: CampaignProduct;
  qty: number;
  theme: typeof FORM_STYLE_THEMES.classic;
  onUpdate: (delta: number) => void;
  onZoom: (src: string, alt: string) => void;
}) {
  const isSelected = qty > 0;
  const soldOut = product.remaining !== null && product.remaining <= 0 && qty === 0;
  const hasLimit = product.limit != null;
  const remaining = product.remaining;
  const critical = remaining !== null && remaining > 0 && remaining <= 5;
  const low = remaining !== null && remaining > 5 && remaining <= 10;

  return (
    <div
      className={`${theme.radiusCard} p-5 transition-all duration-300 ${soldOut ? "opacity-50" : ""} ${isSelected ? "" : "hover:translate-y-[-2px]"} ${critical ? "ring-2 ring-rose/40" : ""}`}
      style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${isSelected ? theme.accent : theme.border}`, background: isSelected ? `${theme.accent}10` : theme.cardBg, boxShadow: isSelected ? theme.cardShadow : "none" }}
    >
      <div className="flex items-start gap-4">
        {product.imageUrl && (
          <button
            type="button"
            onClick={() => onZoom(product.imageUrl, product.name)}
            aria-label={`放大查看 ${product.name}`}
            className={`${theme.radiusCard} overflow-hidden shrink-0 relative group cursor-zoom-in`}
            style={{ width: 140, height: 140, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={280}
              height={280}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" /></svg>
            </span>
          </button>
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif font-bold text-espresso text-xl md:text-2xl leading-tight">{product.name}</span>
            <span className="text-xl font-bold tabular-nums" style={{ color: "var(--color-honey)" }}>${product.price}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasLimit && !soldOut && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-bold bg-honey/15 text-honey ring-1 ring-honey/40">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
                限量 {product.limit}
              </span>
            )}
            {soldOut ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-espresso-light/10 text-espresso-light/60">已售完</span>
            ) : critical ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose/10 text-rose ring-1 ring-rose/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                僅剩 {remaining} {product.unit}！手慢無
              </span>
            ) : low ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-honey/10 text-honey ring-1 ring-honey/30">
                熱銷中 · 剩 {remaining} {product.unit}
              </span>
            ) : remaining !== null ? (
              <span className="text-sm text-espresso-light/50">還剩 {remaining} {product.unit}</span>
            ) : null}
          </div>
          {product.description && <p className="text-espresso-light/70 text-base leading-relaxed">{product.description}</p>}
          {product.note && <p className="text-rose/70 text-sm">{product.note}</p>}
          <div className="mt-2 flex items-center justify-end">
            {soldOut ? (
              <span className={`px-5 py-2 ${theme.radiusButton} text-base font-medium text-espresso-light/30`} style={{ border: `${theme.borderWidth}px ${theme.borderStyle} rgba(30,15,8,0.08)` }}>售完</span>
            ) : isSelected ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onUpdate(-1)} className={`w-10 h-10 ${theme.radiusButton} text-espresso-light hover:text-rose transition-all flex items-center justify-center text-xl`} style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}>−</button>
                <span key={qty} className="w-8 text-center font-bold text-espresso tabular-nums text-lg animate-[number-pop_0.3s_ease]">{qty}</span>
                <button type="button" onClick={() => onUpdate(1)} className={`w-10 h-10 ${theme.radiusButton} text-espresso-light hover:text-rose transition-all flex items-center justify-center text-xl`} style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}>+</button>
              </div>
            ) : (
              <button type="button" onClick={() => onUpdate(1)} className={`px-5 py-2 ${theme.radiusButton} text-base font-semibold hover:text-white active:scale-95 transition-all`} style={{ color: theme.accent, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.accent}60` }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.accent; e.currentTarget.style.color = "#fff"; }} onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = theme.accent; }}>選擇</button>
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: `1px ${theme.borderStyle} ${theme.border}` }}>
          <span className="text-espresso-light/40 text-base">{qty} {product.unit} × NT${product.price}</span>
          <span className="font-bold text-base" style={{ color: theme.accent, fontFamily: theme.fontHeading }}>NT$ {qty * product.price}</span>
        </div>
      )}
    </div>
  );
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[bakeSwing_0.25s_ease_both]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="關閉"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-xl transition-colors"
      >
        ✕
      </button>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={1200}
        className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-4 py-1.5 rounded-full">{alt}</p>
    </div>
  );
}

/* ─── 步驟指示器 ─────────────────────────────── */

function StepIndicator({
  steps,
  currentStep,
  theme,
}: {
  steps: { key: string; label: string }[];
  currentStep: number;
  theme: typeof FORM_STYLE_THEMES.classic;
}) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div className="w-6 h-0.5 rounded-full" style={{ background: isDone ? theme.accent : theme.border }} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 ${theme.radiusPill} flex items-center justify-center text-xs font-bold transition-all`}
                style={isActive
                  ? { background: theme.accent, color: "#fff", boxShadow: `0 2px 8px ${theme.accent}40` }
                  : isDone
                    ? { background: `${theme.accent}20`, color: theme.accent }
                    : { background: theme.border, color: "rgba(30,15,8,0.3)" }}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: isActive ? theme.accent : isDone ? theme.accent : "rgba(30,15,8,0.3)" }}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── 主頁面 ────────────────────────────────────── */

export default function OrderPage() {
  const router = useRouter();

  // 活動資料
  const [campaign, setCampaign] = useState<ActiveCampaign | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<"loading" | "none" | "out_of_range" | "active">("loading");
  const [outOfRangeInfo, setOutOfRangeInfo] = useState<{ startDate: string; endDate: string; name: string } | null>(null);
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

  // 支持類型選擇（存選項 index）
  const [supportIdx, setSupportIdx] = useState<number | null>(null);

  // 選購數量：key = productId
  const [selections, setSelections] = useState<Record<number, number>>({});

  // 分頁步驟
  const [currentStep, setCurrentStep] = useState(0);

  // 收件資料
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [notes, setNotes] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

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
    shippingFee: number;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    deliveryMethod: string;
    paymentMethod: string;
    notes: string;
    isSupporter: boolean;
    supportType: string;
    supportDiscount: number;
  } | null>(null);

  // 送出成功
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: number;
    items: OrderItem[];
    total: number;
    discountAmount: number;
    shippingFee: number;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    deliveryMethod: string;
    paymentMethod: string;
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
        setIsLoggedIn(true);
        if (data.user.name) setCustomerName(data.user.name);
        if (data.user.phone) setPhone(data.user.phone);
        if (data.user.email) setEmail(data.user.email);
        if (data.user.address) parseAndFillAddress(data.user.address);
        setProfileLoaded(true);
        setTimeout(() => setProfileLoaded(false), 2000);
      } else {
        setIsLoggedIn(false);
      }
    }).catch(() => setIsLoggedIn(false));
  }

  // 預覽模式
  const [searchParams] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams());
  const previewCampaignId = searchParams.get("preview");

  // 載入活動與既有訂單
  useEffect(() => {
    const campaignUrl = previewCampaignId
      ? `/api/admin/campaigns/${previewCampaignId}`
      : "/api/campaigns/active";

    const loadCampaign = previewCampaignId
      ? fetch(campaignUrl).then((r) => r.json()).then((detail) => {
          if (!detail || detail.error) { setCampaignStatus("none"); return; }
          const pickupOpts = typeof detail.pickupOptions === "string" ? JSON.parse(detail.pickupOptions) : detail.pickupOptions || [];
          const sOpts = typeof detail.supportOptions === "string" ? JSON.parse(detail.supportOptions) : detail.supportOptions || [];
          setCampaign({
            ...detail,
            pickupOptions: pickupOpts,
            supportOptions: sOpts,
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
        const [sRes, eRes] = await Promise.all([
          fetch("/api/site-settings?key=fundraise_start").then((r) => r.json()),
          fetch("/api/site-settings?key=fundraise_end").then((r) => r.json()),
        ]);
        const now = new Date();
        const start = sRes.value ? new Date(sRes.value) : null;
        const end = eRes.value ? new Date(eRes.value + "T23:59:59") : null;

        if (start && end && now >= start && now <= end) {
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
        if (data.supportIdx != null) setSupportIdx(data.supportIdx);
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
      } catch { /* ignore */ }
      sessionStorage.removeItem("order_selections");
    }
  }, []);

  // 分組
  const requiredGroups = useMemo(() => campaign?.groups.filter((g) => g.isRequired) ?? [], [campaign]);
  const addonGroups = useMemo(() => campaign?.groups.filter((g) => !g.isRequired) ?? [], [campaign]);
  const hasAddonProducts = useMemo(() => addonGroups.some((g) => g.products.length > 0), [addonGroups]);

  // 計算步驟
  const hasBannerImages = useMemo(
    () => parseBannerUrls(campaign?.bannerUrl ?? "").length > 0,
    [campaign?.bannerUrl]
  );
  const hasIntroContent = useMemo(
    () => hasBannerImages || Boolean(campaign?.description?.trim()),
    [hasBannerImages, campaign?.description]
  );
  const wizardSteps = useMemo(() => {
    const steps: { key: string; label: string }[] = [];
    if (hasIntroContent) steps.push({ key: "intro", label: "活動說明" });
    steps.push({ key: "products", label: "選購商品" });
    if (hasAddonProducts) steps.push({ key: "addons", label: "加購商品" });
    steps.push({ key: "info", label: "收件資料" });
    steps.push({ key: "summary", label: "確認訂單" });
    return steps;
  }, [hasIntroContent, hasAddonProducts]);

  const currentStepKey = wizardSteps[currentStep]?.key ?? "products";

  // 計算
  const allProducts = useMemo(() => campaign?.groups.flatMap((g) => g.products) ?? [], [campaign]);

  const subtotal = useMemo(
    () => Object.entries(selections).reduce((sum, [id, qty]) => {
      const p = allProducts.find((p) => p.id === Number(id));
      return sum + (p ? p.price * qty : 0);
    }, 0),
    [selections, allProducts]
  );

  const selectedOption = supportIdx !== null ? campaign?.supportOptions?.[supportIdx] ?? null : null;

  const discountAmount = useMemo(
    () => {
      if (!selectedOption || selectedOption.discount <= 0) return 0;
      return Math.round(subtotal * selectedOption.discount / 100);
    },
    [selectedOption, subtotal]
  );

  const SHIPPING_FEE = 65;
  const FREE_SHIPPING_THRESHOLD = 1000;
  const afterDiscount = subtotal - discountAmount;
  const shippingFee = deliveryMethod === "shipping" && afterDiscount < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const grandTotal = afterDiscount + shippingFee;

  const hasRequiredSelection = useMemo(() => {
    if (!campaign) return false;
    return campaign.groups.filter((g) => g.isRequired).every((g) =>
      g.products.some((p) => (selections[p.id] || 0) > 0)
    );
  }, [campaign, selections]);

  const hasAnySelection = Object.values(selections).some((q) => q > 0);

  function updateSelection(productId: number, delta: number, remaining: number | null) {
    setSelections((prev) => {
      const next = Math.max(0, (prev[productId] || 0) + delta);
      if (remaining !== null && next > remaining) return prev;
      return { ...prev, [productId]: next };
    });
  }

  // 步驟導航
  function goNext() {
    setError("");
    if (currentStepKey === "products") {
      if (campaign?.supportOptions && campaign.supportOptions.length > 0 && supportIdx === null) {
        setError("請選擇您曾經以何種方式支持 Jam for Love");
        return;
      }
      if (!hasRequiredSelection) {
        setError("請至少從必填分組中選擇一項");
        return;
      }
    }
    if (currentStepKey === "info") {
      setTouched({ customerName: true, phone: true, email: true, addressDetail: true });
      if (!customerName.trim() || !phone.trim()) { setError("請填寫必填欄位"); return; }
      if (deliveryMethod === "shipping" && !addressDetail.trim()) { setError("請填寫收件地址"); return; }
      if (phone.trim() && !/^0\d{8,9}$/.test(phone.trim())) { setError("電話格式不正確"); return; }
    }
    setCurrentStep((s) => Math.min(s + 1, wizardSteps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setError("");
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  function handleSubmitOrder() {
    if (!campaign) return;

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
      items, total: grandTotal, discountAmount, shippingFee,
      customerName, phone, email, address: finalAddress, deliveryMethod, paymentMethod, notes,
      supportType: selectedOption?.label || "", supportDiscount: selectedOption?.discount || 0,
      isSupporter: !!selectedOption && selectedOption.discount > 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 真正送出訂單
  async function handleConfirmSubmit() {
    if (!campaign || !pendingOrder) return;
    setError(""); setLoading(true);

    try {
      const isShipping = pendingOrder.deliveryMethod === "shipping";
      const payload: Record<string, unknown> = {
        campaignId: campaign.id,
        customerName: pendingOrder.customerName,
        phone: pendingOrder.phone,
        email: pendingOrder.email,
        address: pendingOrder.address,
        deliveryMethod: isShipping ? "shipping" : "pickup",
        paymentMethod: pendingOrder.paymentMethod,
        items: pendingOrder.items,
        notes: pendingOrder.notes,
        total: pendingOrder.total,
        shippingFee: pendingOrder.shippingFee,
        isSupporter: pendingOrder.isSupporter,
        supportType: pendingOrder.supportType,
        supportDiscount: pendingOrder.supportDiscount,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 未登入：保留表單與選項，導向註冊頁
      if (res.status === 401) {
        sessionStorage.setItem(
          "order_selections",
          JSON.stringify({ selections, deliveryMethod, paymentMethod, notes, supportIdx })
        );
        sessionStorage.setItem(
          "order_pending_payload",
          JSON.stringify({ customerName, phone, email, address: pendingOrder.address, deliveryMethod, paymentMethod, notes })
        );
        setLoading(false);
        router.push("/register?next=/order");
        return;
      }

      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      setConfirmedOrder({
        orderId: data.orderId,
        items: pendingOrder.items,
        total: pendingOrder.total,
        discountAmount: pendingOrder.discountAmount,
        shippingFee: pendingOrder.shippingFee,
        customerName: pendingOrder.customerName,
        phone: pendingOrder.phone,
        email: pendingOrder.email,
        address: pendingOrder.address,
        deliveryMethod: pendingOrder.deliveryMethod,
        paymentMethod: pendingOrder.paymentMethod,
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
          {(order.discountAmount > 0 || (order.shippingFee || 0) > 0) ? (
            <div className="pt-3 mt-2 space-y-1" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-light/60">小計</span>
                <span className="text-espresso">NT$ {order.total - (order.shippingFee || 0) + order.discountAmount}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-rose/70">♥ 支持者折扣</span>
                  <span className="text-rose">-NT$ {order.discountAmount}</span>
                </div>
              )}
              {(order.shippingFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-espresso-light/60">運費</span>
                  <span className="text-espresso">NT$ {order.shippingFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="font-serif font-bold text-espresso">合計</p>
                <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
              </div>
            </div>
          ) : (
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
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">付款方式</span><span className="text-espresso">{order.paymentMethod === "transfer" ? "匯款" : "現金"}</span></div>
            {order.notes && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">備註</span><span className="text-espresso">{order.notes}</span></div>}
          </div>
        </div>

        {error && <p className="text-rose text-sm font-medium mb-4 text-center animate-shake" role="alert">{error}</p>}

        <div className="flex gap-3 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]">
          <button
            onClick={() => { setPendingOrder(null); setCurrentStep(wizardSteps.length - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
          {(order.discountAmount > 0 || (order.shippingFee || 0) > 0) ? (
            <div className="pt-3 mt-2 space-y-1" style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-light/60">小計</span>
                <span className="text-espresso">NT$ {order.total - (order.shippingFee || 0) + order.discountAmount}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-rose/70">♥ 支持者折扣</span>
                  <span className="text-rose">-NT$ {order.discountAmount}</span>
                </div>
              )}
              {(order.shippingFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-espresso-light/60">運費</span>
                  <span className="text-espresso">NT$ {order.shippingFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="font-serif font-bold text-espresso">合計</p>
                <p className="font-serif font-bold text-xl text-rose">NT$ {order.total}</p>
              </div>
            </div>
          ) : (
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
            <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">付款方式</span><span className="text-espresso">{order.paymentMethod === "transfer" ? "匯款" : "現金"}</span></div>
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

  /* ─── 表單 (Wizard) ─── */
  if (!campaign) return null;

  const theme = FORM_STYLE_THEMES[campaign.formStyle] || FORM_STYLE_THEMES.classic;
  const bannerImages = parseBannerUrls(campaign.bannerUrl);

  const inputClass = "w-full py-3 px-0 bg-transparent text-lg text-espresso outline-none placeholder:text-espresso-light/30 transition-colors";
  const inputBorder = { borderBottom: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` };
  const inputBorderFocus = `focus-within:[border-bottom-color:${theme.accent}]`;

  return (
    <div
      className="max-w-2xl mx-auto px-5 py-10 md:py-16 relative"
      style={{ background: theme.bg, backgroundImage: theme.bgPattern }}
    >
      {/* 標頭 */}
      <div className="text-center mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <h1
          className="text-3xl md:text-5xl font-bold text-espresso"
          style={{
            fontFamily: theme.fontHeading,
            fontStyle: theme.headingItalic ? "italic" : "normal",
            letterSpacing: theme.headingTracking,
          }}
        >
          {campaign.name}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="w-12 h-px" style={{ background: `${theme.accent}60` }} />
          <span className="text-base" style={{ color: theme.accent }}>{theme.decoSymbol}</span>
          <span className="w-12 h-px" style={{ background: `${theme.accent}60` }} />
        </div>
        <div className="mt-4">
          <ShareButton theme={theme} />
        </div>
      </div>

      {/* 未登入訪客提示 */}
      {isLoggedIn === false && (
        <div
          className="mb-6 rounded-xl p-4 flex items-start gap-3 animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
          style={{
            background: `${theme.accent}0c`,
            border: `1px dashed ${theme.accent}40`,
          }}
        >
          <span style={{ color: theme.accent, fontSize: 18 }} aria-hidden="true">♥</span>
          <div className="flex-1 text-sm text-espresso-light/80 leading-relaxed">
            歡迎您！可以先瀏覽和填寫訂單，
            <Link
              href="/register?next=/order"
              className="font-bold underline underline-offset-2"
              style={{ color: theme.accent }}
            >
              註冊帳號
            </Link>
            後就能送出訂單（已有帳號？
            <Link
              href="/login?next=/order"
              className="font-bold underline underline-offset-2"
              style={{ color: theme.accent }}
            >
              登入
            </Link>
            ）。
          </div>
        </div>
      )}

      {/* 步驟指示器 */}
      <StepIndicator steps={wizardSteps} currentStep={currentStep} theme={theme} />

      {/* ═══ Step: 活動說明 ═══ */}
      {currentStepKey === "intro" && (
        <div className="space-y-4 animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          {bannerImages.map((url, i) => (
            <div
              key={i}
              className={`${theme.radiusCard} overflow-hidden`}
              style={{ boxShadow: theme.cardShadow, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}
            >
              <Image src={url} alt={`活動說明 ${i + 1}`} width={800} height={800} className="w-full h-auto" />
            </div>
          ))}
          {campaign.description?.trim() && (
            <div
              className={`${theme.radiusCard} px-5 py-4`}
              style={{ background: theme.cardBg, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, boxShadow: theme.cardShadow }}
            >
              <p className="text-base md:text-lg leading-relaxed text-espresso whitespace-pre-wrap">{campaign.description}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Step: 選購商品 ═══ */}
      {currentStepKey === "products" && (
        <div className="animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          {/* 支持者選項 */}
          {campaign.supportOptions.length > 0 && (
            <div className="mb-8">
              <div className={`${theme.radiusCard} p-5`} style={{ background: theme.cardBg, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, boxShadow: theme.cardShadow }}>
                <p className="text-lg font-bold text-espresso mb-4" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>您曾經以何種方式支持 Jam for Love？<span className="text-rose ml-1">*</span></p>
                <div className="space-y-3">
                  {campaign.supportOptions.map((opt, i) => {
                    const selected = supportIdx === i;
                    const label = discountToLabel(opt.discount);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSupportIdx(i)}
                        className={`w-full ${theme.radiusButton} p-4 text-left transition-all duration-200 ${selected ? "shadow-md" : "hover:bg-white/80"}`}
                        style={selected ? { background: `${theme.accent}10`, border: `${theme.borderWidth}px solid ${theme.accent}` } : { background: "rgba(255,255,255,0.6)", border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all" style={selected ? { background: theme.accent, border: `2px solid ${theme.accent}` } : { background: "transparent", border: "2px solid rgba(30,15,8,0.2)" }}>
                            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-base text-espresso">
                            {opt.label}
                            {label && <span className="ml-1 font-semibold" style={{ color: theme.accent }}>(可享 {label}優惠！)</span>}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 必填商品分組 */}
          {requiredGroups.map((group) => (
            <div key={group.id} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-espresso mb-1" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>
                {group.name} <span className="text-rose text-sm font-normal">*</span>
              </h2>
              {group.description && <p className="text-espresso-light/40 text-base mb-4">{group.description}</p>}
              <div className="space-y-2.5">
                {group.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    qty={selections[product.id] || 0}
                    theme={theme}
                    onUpdate={(delta) => updateSelection(product.id, delta, product.remaining)}
                    onZoom={(src, alt) => setZoomImage({ src, alt })}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* 如果沒有加購商品，也顯示非必填分組在這一步 */}
          {!hasAddonProducts && addonGroups.map((group) => (
            <div key={group.id} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-espresso mb-1" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>{group.name}</h2>
              {group.description && <p className="text-espresso-light/40 text-base mb-4">{group.description}</p>}
              <div className="space-y-2.5">
                {group.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    qty={selections[product.id] || 0}
                    theme={theme}
                    onUpdate={(delta) => updateSelection(product.id, delta, product.remaining)}
                    onZoom={(src, alt) => setZoomImage({ src, alt })}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* 已選小計 */}
          {hasAnySelection && (
            <div className={`${theme.radiusCard} p-4 mb-6`} style={{ background: theme.cardBg, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, boxShadow: theme.cardShadow }}>
              <div className="flex justify-between items-baseline">
                <span className="text-espresso-light/60 text-base">目前小計</span>
                <span className="font-bold text-xl" style={{ color: theme.accent }}>NT$ {subtotal}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Step: 加購商品 ═══ */}
      {currentStepKey === "addons" && (
        <div className="animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          {addonGroups.map((group) => (
            <div key={group.id} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-espresso mb-1" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>{group.name}</h2>
              {group.description && <p className="text-espresso-light/40 text-base mb-4">{group.description}</p>}
              <p className="text-espresso-light/40 text-sm mb-4">可跳過，直接點下一步</p>
              <div className="space-y-2.5">
                {group.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    qty={selections[product.id] || 0}
                    theme={theme}
                    onUpdate={(delta) => updateSelection(product.id, delta, product.remaining)}
                    onZoom={(src, alt) => setZoomImage({ src, alt })}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* 已選小計 */}
          <div className={`${theme.radiusCard} p-4 mb-6`} style={{ background: theme.cardBg, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, boxShadow: theme.cardShadow }}>
            <div className="flex justify-between items-baseline">
              <span className="text-espresso-light/60 text-base">目前小計</span>
              <span className="font-bold text-xl" style={{ color: theme.accent }}>NT$ {subtotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Step: 收件資料 ═══ */}
      {currentStepKey === "info" && (
        <div className="animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl md:text-3xl font-bold text-espresso" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>填寫資料</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={loadProfile} className="px-3 py-1.5 rounded-lg text-xs font-medium text-sage hover:bg-sage/10 transition-all" style={{ border: "1.5px dashed rgba(107,142,95,0.3)" }}>
                {profileLoaded ? "✓ 已帶入" : "帶入個人資料"}
              </button>
              <Link href="/profile?from=order" onClick={() => { sessionStorage.setItem("order_selections", JSON.stringify({ selections, deliveryMethod, paymentMethod, notes, supportIdx })); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-espresso-light/40 hover:text-espresso hover:bg-linen-dark/20 transition-all" style={{ border: "1.5px dashed rgba(30,15,8,0.08)" }}>編輯</Link>
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
                className={`w-full py-3 px-4 ${theme.radiusButton} text-lg text-espresso bg-white outline-none transition-colors`}
                style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}
              >
                <option value="shipping">郵寄</option>
                {(campaign.pickupOptions || []).map((opt) => (
                  <option key={opt} value={`pickup:${opt}`}>{opt}</option>
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

            <div className="pt-4 pb-2">
              <label className="block text-sm font-semibold text-espresso-light/50 mb-3">付款方式 *</label>
              <div className="flex gap-3">
                {([
                  { value: "cash" as const, label: "現金", desc: "面交時付款" },
                  { value: "transfer" as const, label: "匯款", desc: "銀行轉帳" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex-1 py-3 px-4 ${theme.radiusButton} text-left transition-all ${paymentMethod === opt.value ? "shadow-sm" : ""}`}
                    style={paymentMethod === opt.value
                      ? { border: `${theme.borderWidth}px solid ${theme.accent}`, background: `${theme.accent}10` }
                      : { border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, background: theme.cardBg }}
                  >
                    <p className="text-base font-medium text-espresso">{opt.label}</p>
                    <p className="text-xs text-espresso-light/40 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {paymentMethod === "transfer" && <BankTransferInfo />}
            </div>

            <div className={inputBorderFocus} style={inputBorder}>
              <label className="block text-sm font-semibold text-espresso-light/50 pt-2">備註</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="有什麼想告訴我們的？" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Step: 確認訂單 ═══ */}
      {currentStepKey === "summary" && (
        <div className="animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <div className={`${theme.radiusCard} p-5 mb-6`} style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, background: theme.cardBg, boxShadow: theme.cardShadow }}>
            <h3 className="text-2xl font-bold text-espresso mb-3" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>訂單摘要</h3>
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
            {(discountAmount > 0 || shippingFee > 0) && (
              <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: "2px dashed rgba(30,15,8,0.08)" }}>
                <div className="flex justify-between text-base">
                  <span className="text-espresso-light">小計</span>
                  <span className="text-espresso tabular-nums">NT$ {subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-base">
                    <span style={{ color: theme.accent }}>{theme.decoSymbol} 支持者折扣（{selectedOption?.discount}%）</span>
                    <span className="font-medium tabular-nums" style={{ color: theme.accent }}>-NT$ {discountAmount}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-espresso-light">運費</span>
                    <span className="text-espresso tabular-nums">NT$ {shippingFee}</span>
                  </div>
                )}
                {shippingFee === 0 && deliveryMethod === "shipping" && (
                  <div className="flex justify-between text-base">
                    <span className="text-espresso-light">運費</span>
                    <span className="text-sage font-medium">免運費</span>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 pt-3 flex justify-between items-baseline" style={{ borderTop: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}` }}>
              <span className="font-bold text-espresso" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal" }}>合計</span>
              <span className="font-bold text-2xl" style={{ color: theme.accent, fontFamily: theme.fontHeading }}>NT$ {grandTotal}</span>
            </div>
          </div>

          {/* 收件摘要 */}
          <div className={`${theme.radiusCard} p-5 mb-6`} style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, background: theme.cardBg, boxShadow: theme.cardShadow }}>
            <h3 className="text-lg font-bold text-espresso mb-3" style={{ fontFamily: theme.fontHeading, fontStyle: theme.headingItalic ? "italic" : "normal", letterSpacing: theme.headingTracking }}>收件資訊</h3>
            <div className="space-y-1.5 text-base">
              <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">收件人</span><span className="text-espresso">{customerName}</span></div>
              <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">電話</span><span className="text-espresso">{phone}</span></div>
              {email && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">Email</span><span className="text-espresso">{email}</span></div>}
              <div className="flex gap-3">
                <span className="text-espresso-light/40 shrink-0 w-16">取貨</span>
                <span className="text-espresso">{deliveryMethod === "shipping" ? `郵寄 — ${zipcode} ${city}${district}${addressDetail}` : deliveryMethod.replace("pickup:", "")}</span>
              </div>
              <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">付款</span><span className="text-espresso">{paymentMethod === "transfer" ? "匯款" : "現金"}</span></div>
              {notes && <div className="flex gap-3"><span className="text-espresso-light/40 shrink-0 w-16">備註</span><span className="text-espresso">{notes}</span></div>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ 導航按鈕 ═══ */}
      {error && <p className="text-rose text-sm font-medium mb-4 animate-shake" role="alert">{error}</p>}

      <div className="flex gap-3 mt-6">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={goBack}
            className={`flex-1 py-4 ${theme.radiusButton} font-bold text-base text-espresso-light hover:text-espresso active:scale-[0.97] transition-all`}
            style={{ border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.border}`, fontFamily: theme.fontHeading, letterSpacing: theme.headingTracking }}
          >
            上一步
          </button>
        )}

        {currentStepKey !== "summary" ? (
          <button
            type="button"
            onClick={goNext}
            disabled={currentStepKey === "products" && !hasAnySelection}
            className={`flex-1 py-4 text-white font-bold text-lg ${theme.radiusButton} transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none`}
            style={{ background: theme.accent, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.accent}60`, boxShadow: theme.cardShadow, fontFamily: theme.fontHeading, letterSpacing: theme.headingTracking }}
          >
            {currentStepKey === "products" && !hasAnySelection ? "請先選擇商品" : "下一步"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={loading}
            className={`flex-1 py-4 text-white font-bold text-lg ${theme.radiusButton} transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.97] disabled:opacity-60`}
            style={{ background: theme.accent, border: `${theme.borderWidth}px ${theme.borderStyle} ${theme.accent}60`, boxShadow: theme.cardShadow, fontFamily: theme.fontHeading, letterSpacing: theme.headingTracking }}
          >
            {`確認訂購 — NT$ ${grandTotal}`}
          </button>
        )}
      </div>

      <p className="text-center text-espresso-light/30 text-sm mt-4">
        {currentStepKey === "summary" ? "確認後將進入最終確認頁面" : "送出後我們會以電話或 Email 確認訂單 ♥"}
      </p>

      {zoomImage && (
        <ImageLightbox src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />
      )}
    </div>
  );
}
