"use client";

import { useState } from "react";

/* ─── 共用假資料 ─────────────────────────────────── */

const SAMPLE_COMBOS = [
  { name: "組合 1", items: ["香辣香菇醬", "馬告菜圃醬", "手工皂"], limit: 25 },
  { name: "組合 2", items: ["覆盆子果醬", "綜合莓果醬", "手工皂"], limit: 25 },
];

const SAMPLE_ADDONS = [
  { name: "金盞花乳霜 / 玫瑰花乳霜", spec: "40ml", price: 300 },
  { name: "草莓果醬", spec: "", price: 150, limit: 20 },
];

/* ─── 主頁面 ────────────────────────────────────── */

export default function OrderPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const designs = [
    { name: "雜誌編排", desc: "大標題、serif 字型、分欄排版，editorial 風格", component: Design1 },
    { name: "卡片浮起", desc: "白色卡片搭配陰影層次，Material 質感", component: Design2 },
    { name: "深色沉穩", desc: "深色背景、金色點綴，高級質感", component: Design3 },
    { name: "手感塗鴉", desc: "手繪風邊框、紙張質感、童趣溫暖", component: Design4 },
    { name: "圓角柔和", desc: "超圓角、粉彩色系、柔軟泡泡感", component: Design5 },
    { name: "線框極簡", desc: "純線框、大量留白、瑞士設計風", component: Design6 },
    { name: "漸層毛玻璃", desc: "半透明毛玻璃卡片、彩色漸層背景", component: Design7 },
    { name: "標籤貼紙", desc: "標籤造型、不規則邊框、文具風格", component: Design8 },
    { name: "步驟時間軸", desc: "垂直時間軸串聯、圓形節點導引", component: Design9 },
    { name: "格線目錄", desc: "雙欄網格、圖鑑式排列、俐落有序", component: Design10 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Preview
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          訂購表單設計預覽
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
        <p className="text-espresso-light/60 text-sm mt-4">
          每款展示組合選擇、加購區、收件欄位的風格，點擊選擇後告訴我編號
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
              className={`cursor-pointer rounded-xl transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "ring-2 ring-rose ring-offset-4 ring-offset-linen"
                  : "ring-1 ring-linen-dark/40 hover:ring-espresso-light/40"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-linen-dark/30 bg-white/30">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${isSelected ? "bg-rose text-white" : "bg-linen-dark/50 text-espresso-light"}`}>
                    {i + 1}
                  </span>
                  <span className="font-serif font-bold text-espresso">{d.name}</span>
                  <span className="text-espresso-light/40 text-xs hidden sm:inline">{d.desc}</span>
                </div>
                {isSelected && <span className="text-rose text-xs font-semibold">已選擇</span>}
              </div>
              <div className="overflow-hidden">
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

/* ================================================================
   1. 雜誌編排 — 大標題 editorial
   ================================================================ */
function Design1() {
  return (
    <div style={{ background: "var(--color-linen)" }} className="p-8 md:p-10">
      <div className="max-w-2xl mx-auto">
        <p className="text-rose text-[0.65rem] font-bold tracking-[0.4em] uppercase mb-2">Order Form</p>
        <h2 className="font-serif text-espresso text-3xl md:text-4xl font-bold leading-tight mb-2">Jam for Love 2026</h2>
        <div className="w-20 h-[1.5px] bg-rose mb-8" />

        <p className="text-espresso-light/40 text-xs tracking-[0.2em] uppercase font-semibold mb-4">— 產品組合 —</p>
        <div className="space-y-3 mb-8">
          {SAMPLE_COMBOS.map((c) => (
            <div key={c.name} className="flex items-start justify-between py-4" style={{ borderBottom: "1px solid rgba(30,15,8,0.08)" }}>
              <div>
                <span className="font-serif font-bold text-espresso text-lg">{c.name}</span>
                <p className="text-espresso-light/50 text-sm mt-1">{c.items.join(" · ")}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-rose font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>$500</span>
                <p className="text-espresso-light/30 text-xs mt-0.5">限量 {c.limit} 組</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-espresso-light/40 text-xs tracking-[0.2em] uppercase font-semibold mb-4">— 加購 —</p>
        {SAMPLE_ADDONS.map((a) => (
          <div key={a.name} className="flex justify-between items-center py-2.5 text-sm" style={{ borderBottom: "1px solid rgba(30,15,8,0.06)" }}>
            <span className="text-espresso-light">{a.name} {a.spec && <span className="text-espresso-light/30 text-xs">({a.spec})</span>}</span>
            <span className="text-espresso font-medium">${a.price}</span>
          </div>
        ))}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <input placeholder="姓名" className="border-b border-espresso-light/20 bg-transparent py-3 text-sm text-espresso outline-none focus:border-rose placeholder:text-espresso-light/30" />
          <input placeholder="電話" className="border-b border-espresso-light/20 bg-transparent py-3 text-sm text-espresso outline-none focus:border-rose placeholder:text-espresso-light/30" />
        </div>
        <button className="mt-8 w-full py-3.5 bg-espresso text-linen font-serif font-bold text-sm tracking-wider rounded-none hover:bg-espresso/90 transition-colors">
          確認訂購
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   2. 卡片浮起 — Material 質感
   ================================================================ */
function Design2() {
  return (
    <div className="bg-[#f5f0e8] p-8 md:p-10">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-espresso mb-1">Jam for Love 2026</h2>
        <p className="text-espresso-light/50 text-sm mb-8">選擇你喜歡的組合，用愛支持</p>

        <p className="text-sm font-semibold text-espresso mb-3">產品組合 <span className="text-espresso-light/30 font-normal">· 每組 $500</span></p>
        <div className="space-y-3 mb-8">
          {SAMPLE_COMBOS.map((c) => (
            <div key={c.name} className="bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-espresso">{c.name}</span>
                  <div className="flex gap-1.5 mt-2">
                    {c.items.map((item) => (
                      <span key={item} className="bg-rose/8 text-rose text-xs px-2.5 py-1 rounded-full font-medium">{item}</span>
                    ))}
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-rose/10 text-rose hover:bg-rose hover:text-white transition-all flex items-center justify-center text-xl font-light">+</button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold text-espresso mb-3">加購商品</p>
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] divide-y divide-linen-dark/20">
          {SAMPLE_ADDONS.map((a) => (
            <div key={a.name} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-espresso">{a.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: "var(--color-honey)" }}>${a.price}</span>
                <button className="w-8 h-8 rounded-lg bg-linen-dark/30 text-espresso-light hover:bg-rose/10 hover:text-rose transition-all flex items-center justify-center">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="rounded-lg border border-linen-dark/40 px-4 py-3 text-sm outline-none focus:border-rose focus:shadow-[0_0_0_3px_rgba(196,80,106,0.1)]" />
            <input placeholder="電話" className="rounded-lg border border-linen-dark/40 px-4 py-3 text-sm outline-none focus:border-rose focus:shadow-[0_0_0_3px_rgba(196,80,106,0.1)]" />
          </div>
        </div>
        <button className="mt-6 w-full py-4 bg-rose text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(196,80,106,0.3)] hover:shadow-[0_6px_24px_rgba(196,80,106,0.4)] transition-all active:scale-[0.98]">
          確認訂購 — NT$ 500
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   3. 深色沉穩 — 深底金字
   ================================================================ */
function Design3() {
  return (
    <div className="p-8 md:p-10" style={{ background: "#1e0f08" }}>
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "var(--color-honey)" }}>Jam for Love</p>
        <h2 className="font-serif text-3xl font-bold mb-1" style={{ color: "var(--color-linen)" }}>果醬選購</h2>
        <div className="w-12 h-[1.5px] mb-8" style={{ background: "var(--color-honey)" }} />

        <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: "var(--color-honey)", opacity: 0.6 }}>產品組合</p>
        <div className="space-y-3 mb-8">
          {SAMPLE_COMBOS.map((c) => (
            <div key={c.name} className="rounded-xl p-4 transition-all hover:ring-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold" style={{ color: "var(--color-linen)" }}>{c.name}</span>
                  <p className="text-xs mt-1.5" style={{ color: "rgba(248,243,235,0.4)" }}>{c.items.join(" · ")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{ color: "var(--color-honey)" }}>$500</span>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ border: "1px solid var(--color-honey)", color: "var(--color-honey)" }}>選擇</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: "var(--color-honey)", opacity: 0.6 }}>加購</p>
        {SAMPLE_ADDONS.map((a) => (
          <div key={a.name} className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-sm" style={{ color: "rgba(248,243,235,0.6)" }}>{a.name}</span>
            <span className="text-sm font-bold" style={{ color: "var(--color-honey)" }}>${a.price}</span>
          </div>
        ))}

        <div className="mt-8 grid grid-cols-2 gap-3">
          <input placeholder="姓名" className="rounded-lg px-4 py-3 text-sm outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-linen)" }} />
          <input placeholder="電話" className="rounded-lg px-4 py-3 text-sm outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-linen)" }} />
        </div>
        <button className="mt-6 w-full py-4 font-bold rounded-xl text-[#1e0f08] transition-all" style={{ background: "var(--color-honey)" }}>
          確認訂購
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   4. 手感塗鴉 — 紙張質感
   ================================================================ */
function Design4() {
  return (
    <div className="p-8 md:p-10" style={{ background: "#faf6ee", backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"4\" height=\"4\"><rect width=\"4\" height=\"4\" fill=\"%23f5edd8\" opacity=\"0.5\"/></svg>')" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-espresso" style={{ fontStyle: "italic" }}>Jam for Love</h2>
          <p className="text-espresso-light/40 text-sm mt-1">~ 為愛而捐 ~</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="w-8 h-px bg-rose/30" /><span className="text-rose text-xs">♥</span><span className="w-8 h-px bg-rose/30" />
          </div>
        </div>

        <p className="font-serif font-bold text-espresso mb-3 text-lg">✧ 產品組合</p>
        <div className="space-y-3 mb-8">
          {SAMPLE_COMBOS.map((c) => (
            <div key={c.name} className="rounded-lg p-4" style={{ border: "2px dashed var(--color-espresso-light)", borderColor: "rgba(30,15,8,0.15)", background: "rgba(255,255,255,0.5)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-espresso">{c.name}</span>
                  <p className="text-espresso-light/50 text-sm mt-1">{c.items.join(" + ")}</p>
                </div>
                <div className="text-center">
                  <span className="text-rose font-bold text-lg">$500</span>
                  <p className="text-espresso-light/30 text-[0.65rem]">限 {c.limit} 組</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="font-serif font-bold text-espresso mb-3 text-lg">✧ 加購好物</p>
        {SAMPLE_ADDONS.map((a) => (
          <div key={a.name} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: "1px dashed rgba(30,15,8,0.1)" }}>
            <span className="text-espresso-light">{a.name}</span>
            <span className="text-rose font-bold">${a.price}</span>
          </div>
        ))}

        <div className="mt-8 space-y-3">
          <input placeholder="你的名字 ✎" className="w-full py-3 px-0 bg-transparent text-sm text-espresso outline-none placeholder:text-espresso-light/30" style={{ borderBottom: "2px dashed rgba(30,15,8,0.12)" }} />
          <input placeholder="電話號碼 ✎" className="w-full py-3 px-0 bg-transparent text-sm text-espresso outline-none placeholder:text-espresso-light/30" style={{ borderBottom: "2px dashed rgba(30,15,8,0.12)" }} />
        </div>
        <button className="mt-8 w-full py-3.5 bg-rose text-white font-serif font-bold rounded-lg" style={{ border: "2px dashed rgba(196,80,106,0.3)" }}>
          送出訂單 ♥
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   5. 圓角柔和 — 泡泡粉彩
   ================================================================ */
function Design5() {
  return (
    <div className="p-8 md:p-10" style={{ background: "linear-gradient(135deg, #fef0f2 0%, #fdf5e6 50%, #f0f5ec 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl font-bold text-espresso">Jam for Love 2026</h2>
          <p className="text-espresso-light/40 text-sm mt-1">選一組你喜歡的甜蜜組合吧！</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-5" style={{ border: "2px solid rgba(196,80,106,0.12)" }}>
          <p className="text-rose text-sm font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-rose/10 rounded-full flex items-center justify-center text-xs">1</span>
            選擇組合
          </p>
          <div className="space-y-2.5">
            {SAMPLE_COMBOS.map((c) => (
              <div key={c.name} className="bg-white rounded-2xl p-4 flex items-center justify-between hover:scale-[1.01] transition-transform" style={{ boxShadow: "0 2px 8px rgba(196,80,106,0.06)" }}>
                <div>
                  <span className="font-bold text-espresso text-sm">{c.name}</span>
                  <div className="flex gap-1 mt-1.5">
                    {c.items.map((item) => (
                      <span key={item} className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[#fef0f2] text-rose/70">{item}</span>
                    ))}
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full bg-rose/10 text-rose text-sm font-bold hover:bg-rose hover:text-white transition-all">$500</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-5" style={{ border: "2px solid rgba(200,149,48,0.12)" }}>
          <p className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-honey)" }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: "rgba(200,149,48,0.1)" }}>2</span>
            加購
          </p>
          {SAMPLE_ADDONS.map((a) => (
            <div key={a.name} className="flex justify-between items-center py-2 text-sm">
              <span className="text-espresso-light">{a.name}</span>
              <span className="font-bold" style={{ color: "var(--color-honey)" }}>${a.price}</span>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6" style={{ border: "2px solid rgba(107,142,95,0.12)" }}>
          <p className="text-sage text-sm font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-sage/10 rounded-full flex items-center justify-center text-xs">3</span>
            你的資料
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="rounded-2xl border-2 border-sage/15 px-4 py-3 text-sm outline-none focus:border-sage/40 bg-white" />
            <input placeholder="電話" className="rounded-2xl border-2 border-sage/15 px-4 py-3 text-sm outline-none focus:border-sage/40 bg-white" />
          </div>
        </div>

        <button className="mt-6 w-full py-4 bg-rose text-white font-bold rounded-full shadow-[0_4px_20px_rgba(196,80,106,0.25)] hover:shadow-[0_6px_28px_rgba(196,80,106,0.35)] transition-all">
          確認訂購 ✨
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   6. 線框極簡 — 瑞士設計
   ================================================================ */
function Design6() {
  return (
    <div className="p-8 md:p-10 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-10 pb-4" style={{ borderBottom: "2px solid #1e0f08" }}>
          <h2 className="text-2xl font-bold text-espresso tracking-tight" style={{ fontFamily: "system-ui" }}>Jam for Love</h2>
          <span className="text-xs text-espresso-light/40 tracking-wider uppercase">Order Form</span>
        </div>

        <div className="mb-10">
          <p className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-espresso mb-5">01 — 組合</p>
          {SAMPLE_COMBOS.map((c) => (
            <div key={c.name} className="flex items-center justify-between py-4" style={{ borderTop: "1px solid #eee" }}>
              <div className="flex items-center gap-4">
                <span className="w-5 h-5 rounded-sm border-2 border-espresso-light/20" />
                <div>
                  <span className="text-sm font-bold text-espresso">{c.name}</span>
                  <span className="text-xs text-espresso-light/40 ml-3">{c.items.join(", ")}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-espresso tabular-nums">500</span>
            </div>
          ))}
        </div>

        <div className="mb-10">
          <p className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-espresso mb-5">02 — 加購</p>
          {SAMPLE_ADDONS.map((a) => (
            <div key={a.name} className="flex justify-between py-3 text-sm" style={{ borderTop: "1px solid #eee" }}>
              <span className="text-espresso">{a.name}</span>
              <span className="text-espresso font-bold tabular-nums">{a.price}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-espresso mb-5">03 — 資料</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[0.65rem] font-bold tracking-wider uppercase text-espresso-light/40 mb-1.5 block">Name</label>
              <input className="w-full border-b-2 border-espresso/20 py-2 text-sm outline-none focus:border-espresso bg-transparent" />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold tracking-wider uppercase text-espresso-light/40 mb-1.5 block">Phone</label>
              <input className="w-full border-b-2 border-espresso/20 py-2 text-sm outline-none focus:border-espresso bg-transparent" />
            </div>
          </div>
        </div>

        <button className="mt-10 w-full py-3.5 bg-espresso text-white text-sm font-bold tracking-wider uppercase hover:bg-espresso/90 transition-colors">
          Submit Order
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   7. 漸層毛玻璃 — Glassmorphism
   ================================================================ */
function Design7() {
  return (
    <div className="p-8 md:p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--color-rose-light), var(--color-honey-light), var(--color-sage-light))" }}>
      <div className="absolute w-60 h-60 rounded-full bg-rose/20 blur-[80px] -top-20 -left-20" />
      <div className="absolute w-48 h-48 rounded-full blur-[60px] -bottom-10 -right-10" style={{ background: "var(--color-honey)", opacity: 0.15 }} />

      <div className="max-w-2xl mx-auto relative">
        <h2 className="font-serif text-2xl font-bold text-espresso mb-1 text-center">Jam for Love 2026</h2>
        <p className="text-espresso-light/40 text-sm text-center mb-8">用愛支持手作果醬</p>

        <div className="rounded-2xl p-6 mb-4" style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
          <p className="text-sm font-bold text-espresso mb-4">產品組合</p>
          <div className="space-y-2.5">
            {SAMPLE_COMBOS.map((c) => (
              <div key={c.name} className="rounded-xl p-3.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}>
                <div>
                  <span className="font-bold text-espresso text-sm">{c.name}</span>
                  <p className="text-espresso-light/40 text-xs mt-0.5">{c.items.join(" · ")}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose/80 backdrop-blur-sm hover:bg-rose transition-all">$500</button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-4" style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)" }}>
          <p className="text-sm font-bold text-espresso mb-3">加購</p>
          {SAMPLE_ADDONS.map((a) => (
            <div key={a.name} className="flex justify-between py-2 text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
              <span className="text-espresso-light">{a.name}</span>
              <span className="font-bold" style={{ color: "var(--color-honey)" }}>${a.price}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)" }}>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="rounded-xl px-4 py-3 text-sm outline-none bg-white/60 border border-white/80 focus:bg-white/90" />
            <input placeholder="電話" className="rounded-xl px-4 py-3 text-sm outline-none bg-white/60 border border-white/80 focus:bg-white/90" />
          </div>
        </div>
        <button className="mt-6 w-full py-4 bg-white/80 backdrop-blur-sm text-rose font-bold rounded-xl border border-white/90 shadow-lg hover:bg-white transition-all">
          確認訂購
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   8. 標籤貼紙 — 文具風
   ================================================================ */
function Design8() {
  return (
    <div className="p-8 md:p-10" style={{ background: "var(--color-parchment)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-5 py-1.5 bg-rose text-white text-xs font-bold tracking-wider rounded-sm -rotate-1">JAM FOR LOVE</span>
          <h2 className="font-serif text-2xl font-bold text-espresso mt-3">果醬選購單</h2>
        </div>

        <div className="mb-6">
          <div className="inline-block px-3 py-1 text-xs font-bold text-white mb-3 rounded-sm" style={{ background: "var(--color-espresso)" }}>COMBO 組合</div>
          <div className="space-y-2.5">
            {SAMPLE_COMBOS.map((c) => (
              <div key={c.name} className="bg-white p-4 flex items-center justify-between" style={{ borderLeft: "4px solid var(--color-rose)", boxShadow: "2px 2px 0 rgba(0,0,0,0.04)" }}>
                <div>
                  <span className="font-bold text-espresso text-sm">{c.name}</span>
                  <p className="text-xs text-espresso-light/50 mt-0.5">{c.items.join(" + ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose/10 text-rose text-xs font-bold px-2 py-0.5 rounded-sm">$500</span>
                  <span className="bg-sage/10 text-sage text-[0.65rem] px-1.5 py-0.5 rounded-sm">限{c.limit}組</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-block px-3 py-1 text-xs font-bold text-white mb-3 rounded-sm" style={{ background: "var(--color-honey)" }}>ADD-ON 加購</div>
          {SAMPLE_ADDONS.map((a) => (
            <div key={a.name} className="bg-white p-3 flex justify-between items-center mb-1.5" style={{ borderLeft: "4px solid var(--color-honey)", boxShadow: "2px 2px 0 rgba(0,0,0,0.04)" }}>
              <span className="text-sm text-espresso">{a.name}</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-honey)" }}>${a.price}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-5" style={{ borderLeft: "4px solid var(--color-sage)", boxShadow: "2px 2px 0 rgba(0,0,0,0.04)" }}>
          <p className="text-xs font-bold text-sage mb-3 tracking-wider uppercase">Your Info</p>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="border border-linen-dark/40 px-3 py-2.5 text-sm outline-none focus:border-sage bg-transparent" />
            <input placeholder="電話" className="border border-linen-dark/40 px-3 py-2.5 text-sm outline-none focus:border-sage bg-transparent" />
          </div>
        </div>
        <button className="mt-6 w-full py-3.5 bg-espresso text-parchment font-bold text-sm tracking-wider" style={{ boxShadow: "3px 3px 0 var(--color-rose)" }}>
          送出訂單
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   9. 步驟時間軸 — 垂直導引
   ================================================================ */
function Design9() {
  return (
    <div className="p-8 md:p-10" style={{ background: "var(--color-linen)" }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-espresso mb-8 text-center">Jam for Love 2026</h2>

        <div className="relative pl-10">
          {/* 垂直線 */}
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-rose/15" />

          {/* Step 1 */}
          <div className="relative mb-10">
            <div className="absolute -left-10 w-[30px] h-[30px] rounded-full bg-rose text-white flex items-center justify-center text-xs font-bold">1</div>
            <p className="text-sm font-bold text-espresso mb-3">選擇組合 <span className="text-espresso-light/30 font-normal">· $500/組</span></p>
            <div className="space-y-2">
              {SAMPLE_COMBOS.map((c) => (
                <div key={c.name} className="bg-white rounded-lg p-3.5 ring-1 ring-linen-dark/30 flex items-center justify-between hover:ring-rose/30 transition-all">
                  <div>
                    <span className="text-sm font-bold text-espresso">{c.name}</span>
                    <p className="text-xs text-espresso-light/40 mt-0.5">{c.items.join(" · ")}</p>
                  </div>
                  <button className="text-rose text-sm font-bold">選擇</button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative mb-10">
            <div className="absolute -left-10 w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-honey)", color: "white" }}>2</div>
            <p className="text-sm font-bold text-espresso mb-3">加購商品</p>
            {SAMPLE_ADDONS.map((a) => (
              <div key={a.name} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: "1px solid rgba(235,226,212,0.5)" }}>
                <span className="text-espresso-light">{a.name}</span>
                <span className="font-bold" style={{ color: "var(--color-honey)" }}>${a.price}</span>
              </div>
            ))}
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -left-10 w-[30px] h-[30px] rounded-full bg-sage text-white flex items-center justify-center text-xs font-bold">3</div>
            <p className="text-sm font-bold text-espresso mb-3">填寫資料</p>
            <div className="bg-white rounded-lg p-4 ring-1 ring-linen-dark/30">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="姓名" className="rounded-lg border border-linen-dark/40 px-3 py-2.5 text-sm outline-none focus:border-sage" />
                <input placeholder="電話" className="rounded-lg border border-linen-dark/40 px-3 py-2.5 text-sm outline-none focus:border-sage" />
              </div>
            </div>
          </div>
        </div>

        <button className="mt-8 w-full py-4 bg-rose text-white font-bold rounded-xl shadow-lg">
          確認訂購
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   10. 格線目錄 — 雙欄網格
   ================================================================ */
function Design10() {
  return (
    <div className="p-8 md:p-10" style={{ background: "var(--color-linen)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between mb-8 pb-3" style={{ borderBottom: "1px solid rgba(30,15,8,0.1)" }}>
          <div>
            <p className="text-rose text-[0.65rem] font-bold tracking-[0.3em] uppercase">Jam for Love</p>
            <h2 className="font-serif text-2xl font-bold text-espresso">果醬選購</h2>
          </div>
          <span className="text-espresso-light/30 text-xs">每組 NT$500</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {SAMPLE_COMBOS.map((c) => (
            <div key={c.name} className="bg-white rounded-xl p-4 ring-1 ring-linen-dark/30 hover:ring-rose/40 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-serif font-bold text-espresso">{c.name}</span>
                <span className="text-rose font-bold text-sm">$500</span>
              </div>
              {c.items.map((item) => (
                <p key={item} className="text-xs text-espresso-light/50 leading-relaxed">· {item}</p>
              ))}
              <div className="mt-3 pt-2.5" style={{ borderTop: "1px solid rgba(235,226,212,0.5)" }}>
                <span className="text-xs text-espresso-light/30">限量 {c.limit} 組</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold text-espresso-light/40 tracking-wider uppercase mb-3">加購</p>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_ADDONS.map((a) => (
              <div key={a.name} className="bg-white rounded-xl p-3.5 ring-1 ring-linen-dark/30 flex items-center justify-between">
                <span className="text-sm text-espresso">{a.name}</span>
                <span className="text-sm font-bold shrink-0 ml-2" style={{ color: "var(--color-honey)" }}>${a.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 ring-1 ring-linen-dark/30">
          <p className="text-xs font-bold text-espresso-light/40 tracking-wider uppercase mb-3">收件資料</p>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="rounded-lg border border-linen-dark/40 px-4 py-3 text-sm outline-none focus:border-rose" />
            <input placeholder="電話" className="rounded-lg border border-linen-dark/40 px-4 py-3 text-sm outline-none focus:border-rose" />
          </div>
        </div>

        <button className="mt-6 w-full py-4 bg-rose text-white font-bold rounded-xl">
          確認訂購
        </button>
      </div>
    </div>
  );
}
