"use client";

import { useState } from "react";

const USER_NAME = "小雯";

function Dot() {
  return (
    <span
      className="inline-block w-[3px] h-[3px] rounded-full mx-2 opacity-25"
      style={{ background: "var(--color-espresso-light)" }}
    />
  );
}

/** 模擬導覽列環境，只替換用戶按鈕區域 */
function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-end gap-0 h-[44px] px-4 rounded-full"
      style={{
        background: "rgba(248,243,235,0.92)",
        backdropFilter: "blur(16px) saturate(1.4)",
        border: "1px solid rgba(235,226,212,0.8)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      <span className="px-3 py-1 text-[0.8rem] tracking-wide font-medium text-rose bg-rose/10 rounded-full">
        首頁
      </span>
      <Dot />
      <span className="px-3 py-1 text-[0.8rem] tracking-wide font-medium text-espresso-light">
        果醬的故事
      </span>
      <Dot />
      {children}
    </div>
  );
}

export default function UserButtonPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const designs = [
    { name: "玫瑰膠囊", desc: "玫瑰漸層背景 + 首字頭像圓圈（目前使用）", component: Design1 },
    { name: "簽名手寫", desc: "手寫體姓名 + 底線裝飾，文藝質感", component: Design2 },
    { name: "金邊徽章", desc: "蜂蜜金邊框膠囊，精緻高級感", component: Design3 },
    { name: "果醬標籤", desc: "模擬果醬罐標籤造型，品牌一致", component: Design4 },
    { name: "極簡文字", desc: "純文字 + 小圓點指示器，最低限度", component: Design5 },
    { name: "漸層光暈", desc: "多色漸層背景 + 發光效果，活潑繽紛", component: Design6 },
    { name: "深色反轉", desc: "深色膠囊 + 淺色文字，高對比醒目", component: Design7 },
    { name: "圓形頭像", desc: "大圓頭像為主，名字 tooltip 顯示", component: Design8 },
    { name: "底線動態", desc: "懸停時底線滑入，優雅互動感", component: Design9 },
    { name: "毛玻璃卡", desc: "獨立毛玻璃小卡片，浮起立體感", component: Design10 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Preview
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          用戶按鈕設計預覽
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
        <p className="text-espresso-light/60 text-sm mt-4">
          以下每款設計皆展示在導覽列中的實際效果，點擊選擇後告訴我編號即可套用
        </p>
      </div>

      <div className="space-y-8">
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
              <div className="flex items-center justify-center py-8 bg-gradient-to-br from-linen to-parchment">
                <NavShell>
                  <Comp />
                </NavShell>
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

/* ─── 1. 玫瑰膠囊（目前樣式） ─────────────────── */
function Design1() {
  return (
    <button
      className="flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-[0.8rem] font-medium transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))",
        color: "white",
        boxShadow: "0 2px 10px rgba(196,80,106,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <span
        className="flex items-center justify-center w-[22px] h-[22px] rounded-full text-[0.65rem] font-bold"
        style={{ background: "rgba(255,255,255,0.25)" }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <span>{USER_NAME}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 2. 簽名手寫 ─────────────────────────────── */
function Design2() {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1 group transition-all duration-300">
      <span
        className="text-[0.95rem] text-rose-dark group-hover:text-rose transition-colors"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400 }}
      >
        {USER_NAME}
      </span>
      <span
        className="block h-[1.5px] w-0 group-hover:w-full transition-all duration-300 rounded-full"
        style={{ background: "var(--color-rose)", position: "absolute", bottom: 6, left: 12, right: 12 }}
      />
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 3. 金邊徽章 ─────────────────────────────── */
function Design3() {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8rem] font-medium transition-all duration-300 hover:shadow-[0_2px_12px_rgba(200,149,48,0.25)]"
      style={{
        border: "1.5px solid var(--color-honey)",
        color: "var(--color-espresso)",
        background: "linear-gradient(135deg, rgba(200,149,48,0.06), rgba(200,149,48,0.02))",
      }}
    >
      <span
        className="flex items-center justify-center w-[20px] h-[20px] rounded-full text-[0.6rem] font-bold text-white"
        style={{ background: "var(--color-honey)" }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <span>{USER_NAME}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-honey)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 4. 果醬標籤 ─────────────────────────────── */
function Design4() {
  return (
    <button
      className="flex items-center gap-2 pl-2 pr-3 py-1 text-[0.8rem] font-medium transition-all duration-300 hover:shadow-md"
      style={{
        background: "var(--color-parchment)",
        border: "1px dashed var(--color-espresso-light)",
        borderRadius: "4px 12px 12px 4px",
        color: "var(--color-espresso)",
      }}
    >
      <span className="text-rose text-[0.7rem]">♥</span>
      <span>{USER_NAME}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 5. 極簡文字 ─────────────────────────────── */
function Design5() {
  return (
    <button className="flex items-center gap-1.5 px-2 py-1 text-[0.8rem] font-medium transition-all duration-300 group">
      <span
        className="w-[6px] h-[6px] rounded-full"
        style={{ background: "var(--color-sage)" }}
      />
      <span className="text-espresso-light group-hover:text-espresso transition-colors">
        {USER_NAME}
      </span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-60 transition-opacity">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 6. 漸層光暈 ─────────────────────────────── */
function Design6() {
  return (
    <button
      className="flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-[0.8rem] font-semibold text-white transition-all duration-300 hover:shadow-[0_2px_16px_rgba(196,80,106,0.35)]"
      style={{
        background: "linear-gradient(135deg, var(--color-rose), var(--color-honey), var(--color-sage))",
        backgroundSize: "200% 200%",
        animation: "gradientShift 4s ease infinite",
        boxShadow: "0 2px 12px rgba(196,80,106,0.2)",
      }}
    >
      <style>{`@keyframes gradientShift { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }`}</style>
      <span
        className="flex items-center justify-center w-[22px] h-[22px] rounded-full text-[0.65rem] font-bold"
        style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <span>{USER_NAME}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 7. 深色反轉 ─────────────────────────────── */
function Design7() {
  return (
    <button
      className="flex items-center gap-1.5 pl-1.5 pr-3 py-0.5 rounded-full text-[0.8rem] font-medium transition-all duration-300 hover:opacity-90"
      style={{
        background: "var(--color-espresso)",
        color: "var(--color-linen)",
        boxShadow: "0 2px 10px rgba(30,15,8,0.15)",
      }}
    >
      <span
        className="flex items-center justify-center w-[22px] h-[22px] rounded-full text-[0.65rem] font-bold"
        style={{ background: "var(--color-rose)", color: "white" }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <span>{USER_NAME}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 8. 圓形頭像 ─────────────────────────────── */
function Design8() {
  return (
    <button
      className="flex items-center gap-0 rounded-full transition-all duration-300 group"
      title={USER_NAME}
    >
      <span
        className="flex items-center justify-center w-[32px] h-[32px] rounded-full text-[0.75rem] font-bold text-white transition-shadow duration-300 group-hover:shadow-[0_0_0_3px_var(--color-rose-muted)]"
        style={{
          background: "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))",
          boxShadow: "0 2px 8px rgba(196,80,106,0.25)",
        }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-espresso-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 ml-0.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ─── 9. 底線動態 ─────────────────────────────── */
function Design9() {
  return (
    <button className="relative flex items-center gap-1.5 px-2.5 py-1 text-[0.8rem] font-medium transition-all duration-300 group">
      <span
        className="flex items-center justify-center w-[18px] h-[18px] rounded-full text-[0.55rem] font-bold text-white"
        style={{ background: "var(--color-rose)" }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <span className="text-espresso group-hover:text-rose transition-colors">
        {USER_NAME}
      </span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <span
        className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: "var(--color-rose)" }}
      />
    </button>
  );
}

/* ─── 10. 毛玻璃卡 ────────────────────────────── */
function Design10() {
  return (
    <button
      className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-xl text-[0.8rem] font-medium transition-all duration-300 hover:shadow-lg"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        color: "var(--color-espresso)",
      }}
    >
      <span
        className="flex items-center justify-center w-[22px] h-[22px] rounded-lg text-[0.65rem] font-bold text-white"
        style={{
          background: "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))",
        }}
      >
        {USER_NAME.charAt(0)}
      </span>
      <span>{USER_NAME}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
