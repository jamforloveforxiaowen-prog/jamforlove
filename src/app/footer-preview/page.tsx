"use client";

import { useState } from "react";

// ── 共用 SVG Icons ─────────────────────────
const FacebookIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const EmailIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// ── 共用常數 ─────────────────────────
const BRAND = "Jam for Love";
const SUBTITLE = "用愛手工熬煮 / Handmade with Love";
const FROM = "國立暨南大學";
const FB_URL = "https://www.facebook.com/groups/229394627478779/";
const EMAIL = "jamforloveforxiaowen@gmail.com";
const COPYRIGHT = "\u00a9 2026 Jam for Love";

// ═══════════════════════════════════════════
// 1. 經典三欄
// ═══════════════════════════════════════════
function Footer1() {
  return (
    <footer className="bg-espresso text-linen px-6 py-10 md:py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* 左：品牌 */}
        <div>
          <h3 className="font-serif text-2xl font-bold text-honey">{BRAND}</h3>
          <p className="text-linen-dark/70 text-sm mt-1">{SUBTITLE}</p>
          <p className="text-linen-dark/50 text-xs mt-2">來自{FROM}</p>
        </div>
        {/* 中：連結 */}
        <div className="flex flex-col items-start md:items-center gap-3">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-linen-dark/80 hover:text-rose-light transition-colors">
            <FacebookIcon size={18} /> Facebook 社團
          </a>
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-sm text-linen-dark/80 hover:text-rose-light transition-colors">
            <EmailIcon size={18} /> {EMAIL}
          </a>
        </div>
        {/* 右：版權 */}
        <div className="md:text-right">
          <p className="text-linen-dark/50 text-xs">{COPYRIGHT}</p>
          <p className="text-linen-dark/40 text-xs mt-1">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 2. 極簡單行
// ═══════════════════════════════════════════
function Footer2() {
  return (
    <footer className="border-t border-dashed border-espresso/20 bg-linen px-6 py-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-espresso-light">
        <span className="font-serif font-semibold text-espresso">{BRAND}</span>
        <span className="text-espresso/20">&middot;</span>
        <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-rose transition-colors">
          <FacebookIcon size={14} /> Facebook
        </a>
        <span className="text-espresso/20">&middot;</span>
        <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 hover:text-rose transition-colors">
          <EmailIcon size={14} /> Email
        </a>
        <span className="text-espresso/20">&middot;</span>
        <span className="text-espresso/40 text-xs">{COPYRIGHT}</span>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 3. 信封風
// ═══════════════════════════════════════════
function Footer3() {
  return (
    <footer className="bg-linen px-6 py-10">
      <div className="max-w-2xl mx-auto border-2 border-dashed border-espresso/30 rounded-sm p-8 relative"
        style={{ fontFamily: "'Georgia', serif" }}>
        {/* 郵票裝飾 */}
        <div className="absolute top-3 right-3 w-14 h-16 border-2 border-espresso/20 rounded-sm flex flex-col items-center justify-center bg-linen-dark/40">
          <span className="text-rose text-lg leading-none">&hearts;</span>
          <span className="text-[8px] text-espresso/40 mt-0.5">TAIWAN</span>
          <span className="text-[7px] text-espresso/30">NT$10</span>
        </div>
        {/* 內容 */}
        <p className="text-espresso/40 text-xs tracking-widest uppercase mb-4">From the kitchen of</p>
        <h3 className="font-serif text-2xl text-espresso italic">{BRAND}</h3>
        <p className="text-espresso/60 text-sm mt-1 italic">{SUBTITLE}</p>
        <p className="text-espresso/40 text-xs mt-1">{FROM}</p>
        <div className="border-t border-dashed border-espresso/20 mt-6 pt-4 flex flex-wrap gap-4">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-espresso/60 hover:text-rose transition-colors">
            <FacebookIcon size={14} /> Facebook 社團
          </a>
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 text-sm text-espresso/60 hover:text-rose transition-colors">
            <EmailIcon size={14} /> {EMAIL}
          </a>
        </div>
        <p className="text-espresso/30 text-xs mt-6 text-right italic">{COPYRIGHT}</p>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 4. 大字品牌
// ═══════════════════════════════════════════
function Footer4() {
  return (
    <footer className="bg-espresso text-linen px-6 py-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-linen/10 leading-none select-none">
          {BRAND}
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-honey text-sm font-semibold">{BRAND}</p>
            <p className="text-linen-dark/50 text-xs mt-0.5">{SUBTITLE}</p>
            <p className="text-linen-dark/40 text-xs">{FROM}</p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-linen-dark/70 hover:text-rose-light transition-colors">
              <FacebookIcon size={16} /> Facebook
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 text-sm text-linen-dark/70 hover:text-rose-light transition-colors">
              <EmailIcon size={16} /> Email
            </a>
          </div>
        </div>
        <div className="border-t border-linen/10 mt-6 pt-4">
          <p className="text-linen-dark/30 text-xs">{COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 5. 波浪分隔
// ═══════════════════════════════════════════
function Footer5() {
  return (
    <footer className="relative">
      {/* SVG 波浪 */}
      <div className="relative -mb-px">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16" style={{ display: "block" }}>
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            fill="var(--color-espresso)"
          />
        </svg>
      </div>
      <div className="bg-espresso text-linen px-6 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-honey">{BRAND}</h3>
            <p className="text-linen-dark/60 text-sm mt-1">{SUBTITLE}</p>
            <p className="text-linen-dark/40 text-xs mt-1">{FROM}</p>
          </div>
          <div className="sm:text-right flex flex-col gap-2">
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:justify-end text-sm text-linen-dark/70 hover:text-rose-light transition-colors">
              <FacebookIcon size={16} /> Facebook 社團
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 sm:justify-end text-sm text-linen-dark/70 hover:text-rose-light transition-colors">
              <EmailIcon size={16} /> {EMAIL}
            </a>
            <p className="text-linen-dark/40 text-xs mt-2">{COPYRIGHT}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 6. 雙色分割
// ═══════════════════════════════════════════
function Footer6() {
  return (
    <footer className="grid grid-cols-1 md:grid-cols-2">
      {/* 左半：espresso */}
      <div className="bg-espresso text-linen px-6 py-10 md:px-10">
        <h3 className="font-serif text-2xl font-bold text-honey">{BRAND}</h3>
        <p className="text-linen-dark/60 text-sm mt-2">{SUBTITLE}</p>
        <p className="text-linen-dark/40 text-xs mt-1">{FROM}</p>
        <p className="text-linen-dark/30 text-xs mt-6">{COPYRIGHT}</p>
      </div>
      {/* 右半：rose */}
      <div className="bg-rose text-white px-6 py-10 md:px-10">
        <p className="text-white/70 text-xs tracking-widest uppercase mb-4">聯繫我們</p>
        <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors mb-3">
          <FacebookIcon size={18} /> Facebook 社團
        </a>
        <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors">
          <EmailIcon size={18} /> {EMAIL}
        </a>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 7. 卡片浮起
// ═══════════════════════════════════════════
function Footer7() {
  return (
    <footer className="bg-linen-dark/40 px-6 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg shadow-espresso/8 px-8 py-10 text-center">
        <h3 className="font-serif text-2xl font-bold text-espresso">{BRAND}</h3>
        <p className="text-espresso-light/60 text-sm mt-1">{SUBTITLE}</p>
        <p className="text-espresso/40 text-xs mt-1">{FROM}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-espresso/10 text-sm text-espresso-light hover:border-rose hover:text-rose transition-colors">
            <FacebookIcon size={14} /> Facebook
          </a>
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-espresso/10 text-sm text-espresso-light hover:border-rose hover:text-rose transition-colors">
            <EmailIcon size={14} /> Email
          </a>
        </div>
        <div className="border-t border-espresso/10 mt-6 pt-4">
          <p className="text-espresso/30 text-xs">{COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 8. 果醬罐裝飾
// ═══════════════════════════════════════════
function Footer8() {
  return (
    <footer className="bg-espresso text-linen px-6 pt-10 pb-6 relative overflow-hidden">
      {/* 裝飾：果醬罐 CSS art */}
      <div className="absolute bottom-0 right-4 md:right-12 opacity-10 pointer-events-none flex gap-3">
        {/* 罐子 1 */}
        <div className="relative">
          <div className="w-12 h-3 bg-honey rounded-t-sm mx-auto" />
          <div className="w-16 h-20 bg-rose rounded-b-lg border-t-2 border-honey" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-lg">&hearts;</div>
        </div>
        {/* 罐子 2 */}
        <div className="relative">
          <div className="w-10 h-3 bg-honey rounded-t-sm mx-auto" />
          <div className="w-14 h-16 bg-sage rounded-b-lg border-t-2 border-honey" />
          <div className="absolute top-7 left-1/2 -translate-x-1/2 text-white text-lg">&hearts;</div>
        </div>
      </div>
      {/* 裝飾：愛心散佈 */}
      <div className="absolute top-4 left-6 text-rose/10 text-3xl pointer-events-none">&hearts;</div>
      <div className="absolute top-8 left-24 text-honey/10 text-xl pointer-events-none">&hearts;</div>
      <div className="absolute bottom-8 left-16 text-rose/10 text-2xl pointer-events-none">&hearts;</div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          <div className="flex-1">
            <h3 className="font-serif text-xl font-bold text-honey">{BRAND}</h3>
            <p className="text-linen-dark/60 text-sm mt-1">{SUBTITLE}</p>
            <p className="text-linen-dark/40 text-xs mt-1">{FROM}</p>
          </div>
          <div className="flex flex-col gap-2">
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-linen-dark/70 hover:text-rose-light transition-colors">
              <FacebookIcon size={16} /> Facebook 社團
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-sm text-linen-dark/70 hover:text-rose-light transition-colors">
              <EmailIcon size={16} /> {EMAIL}
            </a>
          </div>
        </div>
        <div className="border-t border-linen/10 mt-8 pt-4 flex items-center justify-between">
          <p className="text-linen-dark/30 text-xs">{COPYRIGHT}</p>
          <span className="text-rose/30 text-sm">&hearts;</span>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 9. 時間軸風
// ═══════════════════════════════════════════
function Footer9() {
  const items = [
    { label: "品牌", content: <><span className="font-serif font-bold text-espresso">{BRAND}</span><br /><span className="text-espresso/50 text-xs">{SUBTITLE}</span></> },
    { label: "來自", content: <span className="text-sm text-espresso-light">{FROM}</span> },
    {
      label: "社群",
      content: (
        <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-espresso-light hover:text-rose transition-colors">
          <FacebookIcon size={14} /> Facebook 社團
        </a>
      ),
    },
    {
      label: "客服",
      content: (
        <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 text-sm text-espresso-light hover:text-rose transition-colors">
          <EmailIcon size={14} /> {EMAIL}
        </a>
      ),
    },
    { label: "版權", content: <span className="text-espresso/40 text-xs">{COPYRIGHT}</span> },
  ];

  return (
    <footer className="bg-linen px-6 py-10">
      <div className="max-w-md mx-auto">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4">
            {/* 左側時間軸 */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full border-2 border-rose bg-linen shrink-0" />
              {i < items.length - 1 && <div className="w-px flex-1 border-l-2 border-dashed border-espresso/15" />}
            </div>
            {/* 右側內容 */}
            <div className="pb-6">
              <p className="text-[10px] tracking-widest uppercase text-espresso/30 mb-1">{item.label}</p>
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 10. 漸層溫暖
// ═══════════════════════════════════════════
function Footer10() {
  return (
    <footer
      className="px-6 py-14"
      style={{ background: "linear-gradient(to bottom, var(--color-linen) 0%, var(--color-espresso) 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* 上部：淺色區域 */}
        <div className="text-center mb-10">
          <h3 className="font-serif text-3xl font-bold text-espresso">{BRAND}</h3>
          <p className="text-espresso-light/60 text-sm mt-1">{SUBTITLE}</p>
          <p className="text-espresso/40 text-xs mt-1">{FROM}</p>
        </div>
        {/* 中部：過渡區域 */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-linen-dark/90 hover:text-honey transition-colors">
            <FacebookIcon size={16} /> Facebook 社團
          </a>
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-sm text-linen-dark/90 hover:text-honey transition-colors">
            <EmailIcon size={16} /> {EMAIL}
          </a>
        </div>
        {/* 下部：深色區域 */}
        <p className="text-center text-linen-dark/40 text-xs">{COPYRIGHT}</p>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════
// 主頁面
// ═══════════════════════════════════════════
const DESIGNS = [
  { name: "經典三欄", desc: "左品牌 logo+名稱、中連結、右版權，深色背景", component: Footer1 },
  { name: "極簡單行", desc: "一行搞定所有資訊，淺色背景虛線上邊框", component: Footer2 },
  { name: "信封風", desc: "像一封信的底部，虛線邊框、郵票裝飾、手寫字體感", component: Footer3 },
  { name: "大字品牌", desc: "超大品牌字樣佔滿寬度，下方小字連結和版權", component: Footer4 },
  { name: "波浪分隔", desc: "上方 SVG 波浪曲線分隔，下方深色區域放資訊", component: Footer5 },
  { name: "雙色分割", desc: "左半 espresso 深色、右半 rose 色", component: Footer6 },
  { name: "卡片浮起", desc: "linen 背景上的圓角卡片，集中所有資訊", component: Footer7 },
  { name: "果醬罐裝飾", desc: "底部有果醬罐/愛心的 CSS 裝飾圖案", component: Footer8 },
  { name: "時間軸風", desc: "左側虛線+節點，右側各項資訊", component: Footer9 },
  { name: "漸層溫暖", desc: "從 linen 漸層到 espresso 的溫暖過渡", component: Footer10 },
];

export default function FooterPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-linen)" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 頂部標題 */}
        <div className="mb-12">
          <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Preview
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
            Footer 設計預覽
          </h1>
          <div className="w-16 h-[2px] bg-rose mt-5" />
          <p className="text-espresso-light/60 text-sm mt-4">
            點擊任一設計查看選中效果，決定後告訴我編號即可套用
          </p>
        </div>

        {/* 10 個 footer 垂直排列 */}
        <div className="space-y-10">
          {DESIGNS.map((d, i) => {
            const Comp = d.component;
            const isSelected = selected === i;
            return (
              <div key={i}>
                {/* 編號與風格名稱 */}
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="text-rose font-mono text-sm font-bold">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-xl font-bold text-espresso">
                    {d.name}
                  </h2>
                  <span className="text-espresso-light/40 text-sm">{d.desc}</span>
                </div>
                {/* Footer 容器 */}
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : i)}
                  className={`block w-full text-left rounded-xl overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? "ring-3 ring-rose ring-offset-4 ring-offset-linen scale-[1.01]"
                      : "ring-1 ring-espresso/10 hover:ring-espresso/20"
                  }`}
                >
                  <Comp />
                </button>
                {isSelected && (
                  <p className="text-rose text-xs font-semibold mt-3 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                    &#10003; 已選擇此設計
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
