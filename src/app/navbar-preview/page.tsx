"use client";

import { useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "首頁", href: "/" },
  { label: "訂購", href: "/order" },
  { label: "我的訂單", href: "/my-orders" },
];

const BRAND = "Jam For Love";

export default function NavbarPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const designs = [
    { name: "極簡細線", desc: "細線底部分隔，大量留白，品牌名使用 Cormorant italic", component: Design1 },
    { name: "置中品牌", desc: "Logo 與品牌名置中，導覽連結均分左右兩側", component: Design2 },
    { name: "深色反轉", desc: "深巧克力色背景配奶油色文字，品牌感強烈", component: Design3 },
    { name: "雜誌編排", desc: "上下兩層：品牌名大字在上，連結小字在下", component: Design4 },
    { name: "玫瑰色帶", desc: "品牌色玫瑰紅背景，白色文字，溫暖有辨識度", component: Design5 },
    { name: "膠囊標籤", desc: "當前頁面以膠囊色塊高亮，其餘為文字連結", component: Design6 },
    { name: "浮動圓角", desc: "脫離邊緣的圓角浮動列，帶微妙陰影", component: Design7 },
    { name: "左側垂直", desc: "Logo 垂直排列，連結右側水平展開，不對稱感", component: Design8 },
    { name: "裝飾線框", desc: "細線框包圍品牌名，連結以裝飾點分隔", component: Design9 },
    { name: "透明漸層", desc: "背景透明漸至亞麻色，若有似無的存在感", component: Design10 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Preview
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          導覽列設計預覽
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
        <p className="text-espresso-light/60 text-sm mt-4">
          點擊任一設計查看選中效果，決定後告訴我編號即可套用
        </p>
      </div>

      <div className="space-y-10">
        {designs.map((d, i) => {
          const Comp = d.component;
          const isSelected = selected === i;
          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`cursor-pointer rounded-lg transition-all duration-300 ${
                isSelected
                  ? "ring-2 ring-rose ring-offset-4 ring-offset-linen"
                  : "ring-1 ring-linen-dark/40 hover:ring-espresso-light/40"
              }`}
            >
              {/* 標題 */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-linen-dark/30">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? "bg-rose text-white"
                        : "bg-linen-dark/50 text-espresso-light"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-serif font-bold text-espresso">
                    {d.name}
                  </span>
                  <span className="text-espresso-light/40 text-xs hidden sm:inline">
                    {d.desc}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-rose text-xs font-semibold">已選擇</span>
                )}
              </div>
              {/* 預覽 */}
              <div className="overflow-hidden rounded-b-lg">
                <Comp />
              </div>
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-espresso text-linen px-6 py-3 rounded-lg shadow-xl text-sm font-medium animate-reveal-up z-50">
          已選擇第 {selected + 1} 款「{designs[selected].name}」— 請告訴我確認套用
        </div>
      )}
    </div>
  );
}

/* ─── 1. 極簡細線 ────────────────────────── */
function Design1() {
  return (
    <nav className="bg-linen border-b border-linen-dark/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={32} height={32} className="rounded-full" />
          <span
            className="text-xl text-espresso"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400 }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-espresso-light">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-rose transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
          <span className="text-espresso-light/30">|</span>
          <span className="hover:text-rose transition-colors cursor-pointer">登入</span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 2. 置中品牌 ────────────────────────── */
function Design2() {
  return (
    <nav className="bg-linen border-b border-linen-dark/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm text-espresso-light">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-rose transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="" width={34} height={34} className="rounded-full" />
          <span
            className="text-xl text-espresso font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-espresso-light">
          <span className="hover:text-rose transition-colors cursor-pointer">登入</span>
          <span className="bg-rose text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer">
            註冊
          </span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 3. 深色反轉 ────────────────────────── */
function Design3() {
  return (
    <nav className="bg-espresso">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={34} height={34} className="rounded-full" />
          <span
            className="text-xl text-linen font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-linen/60">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-rose-light transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
          <span className="bg-rose text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer">
            登入
          </span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 4. 雜誌編排 ────────────────────────── */
function Design4() {
  return (
    <nav className="bg-linen border-b border-linen-dark/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* 上層：品牌 */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="" width={36} height={36} className="rounded-full" />
            <span
              className="text-3xl text-espresso"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
            >
              {BRAND}
            </span>
          </div>
        </div>
        {/* 下層：導覽 */}
        <div className="flex items-center justify-center gap-10 pb-3 text-xs font-medium tracking-[0.15em] uppercase text-espresso-light">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-rose transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
          <span className="text-linen-dark">·</span>
          <span className="hover:text-rose transition-colors cursor-pointer">登入</span>
          <span className="hover:text-rose transition-colors cursor-pointer">註冊</span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 5. 玫瑰色帶 ────────────────────────── */
function Design5() {
  return (
    <nav className="bg-rose">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="" width={30} height={30} className="rounded-full ring-2 ring-white/20" />
          <span
            className="text-lg text-white font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-7 text-sm text-white/75">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-white transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
          <span className="bg-white/15 backdrop-blur-sm text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:bg-white/25 transition-colors">
            登入
          </span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 6. 膠囊標籤 ────────────────────────── */
function Design6() {
  return (
    <nav className="bg-linen/90 backdrop-blur-md border-b border-linen-dark/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={34} height={34} className="rounded-full" />
          <span
            className="text-xl text-espresso font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          {NAV_LINKS.map((l, idx) => (
            <span
              key={l.label}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all duration-200 ${
                idx === 0
                  ? "bg-espresso text-linen font-medium"
                  : "text-espresso-light hover:bg-linen-dark/50"
              }`}
            >
              {l.label}
            </span>
          ))}
          <span className="w-px h-4 bg-linen-dark mx-2" />
          <span className="text-espresso-light hover:text-rose transition-colors cursor-pointer px-3 py-1.5">
            登入
          </span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 7. 浮動圓角 ────────────────────────── */
function Design7() {
  return (
    <div className="bg-linen pt-3 px-4">
      <nav className="max-w-5xl mx-auto bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="" width={30} height={30} className="rounded-full" />
          <span
            className="text-lg text-espresso font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-7 text-sm text-espresso-light">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-rose transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
          <span className="bg-rose text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
            登入
          </span>
        </div>
      </nav>
    </div>
  );
}

/* ─── 8. 左側垂直 ────────────────────────── */
function Design8() {
  return (
    <nav className="bg-linen border-b border-linen-dark/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="" width={34} height={34} className="rounded-full" />
            <div className="flex flex-col -space-y-0.5">
              <span
                className="text-sm text-espresso font-semibold leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Jam For Love
              </span>
              <span className="text-[10px] text-espresso-light/40 tracking-[0.15em] uppercase">
                Handmade with Love
              </span>
            </div>
          </div>
          <div className="w-px h-6 bg-linen-dark" />
          <div className="flex items-center gap-6 text-sm text-espresso-light">
            {NAV_LINKS.map((l) => (
              <span key={l.label} className="hover:text-rose transition-colors cursor-pointer">
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-espresso-light hover:text-rose transition-colors cursor-pointer">登入</span>
          <span className="bg-rose text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer">
            註冊
          </span>
        </div>
      </div>
    </nav>
  );
}

/* ─── 9. 裝飾線框 ────────────────────────── */
function Design9() {
  return (
    <nav className="bg-linen">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="" width={34} height={34} className="rounded-full" />
            <div className="border border-espresso/15 rounded-md px-4 py-1">
              <span
                className="text-lg text-espresso"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400 }}
              >
                {BRAND}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-espresso-light">
            {NAV_LINKS.map((l, idx) => (
              <span key={l.label} className="flex items-center gap-5">
                <span className="hover:text-rose transition-colors cursor-pointer">{l.label}</span>
                {idx < NAV_LINKS.length - 1 && (
                  <span className="text-rose/30 text-xs">✦</span>
                )}
              </span>
            ))}
            <span className="text-rose/30 text-xs">✦</span>
            <span className="hover:text-rose transition-colors cursor-pointer">登入</span>
          </div>
        </div>
        <div className="border-b border-linen-dark/50 mt-4" />
      </div>
    </nav>
  );
}

/* ─── 10. 透明漸層 ───────────────────────── */
function Design10() {
  return (
    <nav
      className="relative"
      style={{
        background: "linear-gradient(to bottom, var(--color-linen) 60%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="" width={38} height={38} className="rounded-full shadow-md" />
          <span
            className="text-2xl text-espresso"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {BRAND}
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-espresso-light/70">
          {NAV_LINKS.map((l) => (
            <span key={l.label} className="hover:text-espresso transition-colors cursor-pointer">
              {l.label}
            </span>
          ))}
          <span className="text-espresso hover:text-rose transition-colors cursor-pointer font-medium">
            登入
          </span>
        </div>
      </div>
    </nav>
  );
}
