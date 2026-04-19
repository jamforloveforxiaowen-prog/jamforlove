"use client";

import { useState } from "react";

/* ─── 聯繫資料 ─── */

const EMAIL = "jam.for.love.wny@gmail.com";
const FB_URL = "https://www.facebook.com/groups/229394627478779/";
const LOCATION = "國立暨南大學 國際文教與比較教育系";

/* ─── 共用：跟「關於我們」同一條視覺語彙 ─── */

function SectionHeading({ align = "left", eyebrow = "Contact Us", zh = "聯繫我們" }: { align?: "left" | "center"; eyebrow?: string; zh?: string }) {
  return (
    <div className={`mb-14 ${align === "center" ? "text-center" : ""}`}>
      <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">{eyebrow}</p>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">{zh}</h2>
      <div className={`w-12 h-[2px] bg-rose mt-5 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}

function FbIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
  );
}
function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  );
}
function PinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" /><circle cx="12" cy="10" r="3" /></svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-1"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

/* ─── Design 1：雜誌編排（左正文 + 右固定方塊） ─── */

function Design1() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-7 space-y-5 order-2 md:order-1">
            <p className="text-[1.05rem] leading-[1.9] text-espresso-light/70">
              有任何想說的話、想合作的提案，或是想了解我們接下來的行動，都歡迎寫信或來 Facebook 社團找我們。我們看到訊息後會儘快回覆，謝謝你願意與我們建立聯繫。
            </p>
            <p className="text-[1.05rem] leading-[1.9] text-espresso-light/70">
              若您是來自 NGO / NPO，想邀請我們一起做事，請在信裡簡單描述您的組織與合作想像，我們會以最快速度回應。
            </p>
          </div>
          <div className="md:col-span-5 order-1 md:order-2 md:sticky md:top-24 space-y-3">
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 p-4 rounded-lg bg-white/60 ring-1 ring-linen-dark/40 hover:ring-rose/60 transition-all">
              <span className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center shrink-0"><MailIcon /></span>
              <div className="min-w-0">
                <p className="text-espresso-light/50 text-xs">Email</p>
                <p className="text-espresso font-medium text-sm truncate">{EMAIL}</p>
              </div>
            </a>
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg bg-white/60 ring-1 ring-linen-dark/40 hover:ring-rose/60 transition-all">
              <span className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center shrink-0"><FbIcon /></span>
              <div>
                <p className="text-espresso-light/50 text-xs">Facebook</p>
                <p className="text-espresso font-medium text-sm">Jam for Love 社團</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/30 ring-1 ring-linen-dark/30">
              <span className="w-10 h-10 rounded-full bg-sage/10 text-sage flex items-center justify-center shrink-0"><PinIcon /></span>
              <div>
                <p className="text-espresso-light/50 text-xs">地址</p>
                <p className="text-espresso font-medium text-sm">{LOCATION}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Design 2：三張卡片並排 ─── */

function Design2() {
  return (
    <section className="py-16 md:py-20 bg-linen/40">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading align="center" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a href={`mailto:${EMAIL}`} className="group bg-white rounded-2xl p-8 ring-1 ring-linen-dark/40 hover:ring-rose/50 hover:-translate-y-1 transition-all text-center shadow-sm hover:shadow-lg">
            <span className="inline-flex w-14 h-14 rounded-full bg-rose/10 text-rose items-center justify-center mb-4"><MailIcon size={24} /></span>
            <h3 className="font-serif text-lg font-bold text-espresso mb-2">寫信給我們</h3>
            <p className="text-espresso-light/60 text-sm leading-relaxed mb-3">想合作、詢問訂單、給回饋，都歡迎寄信</p>
            <p className="text-rose text-sm font-semibold break-all inline-flex items-center justify-center">{EMAIL}<ArrowIcon /></p>
          </a>
          <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-2xl p-8 ring-1 ring-linen-dark/40 hover:ring-rose/50 hover:-translate-y-1 transition-all text-center shadow-sm hover:shadow-lg">
            <span className="inline-flex w-14 h-14 rounded-full bg-rose/10 text-rose items-center justify-center mb-4"><FbIcon size={24} /></span>
            <h3 className="font-serif text-lg font-bold text-espresso mb-2">加入社團</h3>
            <p className="text-espresso-light/60 text-sm leading-relaxed mb-3">最新活動、故事花絮、即時互動</p>
            <p className="text-rose text-sm font-semibold inline-flex items-center justify-center">Jam for Love 社團<ArrowIcon /></p>
          </a>
          <div className="bg-white rounded-2xl p-8 ring-1 ring-linen-dark/40 text-center shadow-sm">
            <span className="inline-flex w-14 h-14 rounded-full bg-sage/10 text-sage items-center justify-center mb-4"><PinIcon size={24} /></span>
            <h3 className="font-serif text-lg font-bold text-espresso mb-2">我們在這裡</h3>
            <p className="text-espresso-light/60 text-sm leading-relaxed">{LOCATION}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Design 3：極簡單欄 + 大型聯繫 CTA ─── */

function Design3() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <SectionHeading align="center" eyebrow="Say Hi" />
        <p className="font-serif text-rose text-xl md:text-2xl italic mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Drop us a line.
        </p>
        <p className="text-espresso-light/70 leading-[1.9] mb-10">
          我們讀每一封信。想聊合作、想訂製禮盒、想了解 NGO 支持名單，都可以直接來信。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-rose text-white font-medium hover:bg-rose/90 transition-colors">
            <MailIcon /> 寄信給我們
          </a>
          <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent ring-1 ring-espresso/30 text-espresso font-medium hover:ring-rose hover:text-rose transition-all">
            <FbIcon /> Facebook 社團
          </a>
        </div>
        <div className="mt-12 inline-flex items-center gap-2 text-espresso-light/40 text-sm">
          <PinIcon size={14} />
          <span>{LOCATION}</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Design 4：信封／信件風（編輯器式排版） ─── */

function Design4() {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading />
        <div
          className="relative bg-linen/80 rounded-2xl px-8 md:px-12 py-10 md:py-14"
          style={{ border: "2px dashed rgba(196,80,106,0.3)", boxShadow: "0 10px 40px rgba(30,15,8,0.06)" }}
        >
          {/* 左上角郵票 */}
          <div className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-rose text-white text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-md rotate-3 shadow-md">
            From Puli, Taiwan
          </div>

          <p className="font-serif text-espresso text-lg mb-5">親愛的朋友，</p>
          <p className="text-[1.05rem] leading-[1.95] text-espresso-light/75 mb-4">
            謝謝你翻到這一頁。如果你讀完我們的故事，想和我們說幾句話，或者想讓你關注的 NGO 成為下一個被支持的夥伴 —— 請寫信告訴我們。
          </p>
          <p className="text-[1.05rem] leading-[1.95] text-espresso-light/75 mb-8">
            我們不一定很快回覆，但一定會回。
          </p>
          <div className="pt-6 space-y-3" style={{ borderTop: "1px dashed rgba(30,15,8,0.15)" }}>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-espresso hover:text-rose transition-colors">
              <span className="text-rose"><MailIcon /></span>
              <span className="font-medium">{EMAIL}</span>
            </a>
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-espresso hover:text-rose transition-colors">
              <span className="text-rose"><FbIcon /></span>
              <span className="font-medium">Facebook ─ Jam for Love 社團</span>
            </a>
            <div className="flex items-center gap-3 text-espresso-light/60">
              <span className="text-sage"><PinIcon /></span>
              <span>{LOCATION}</span>
            </div>
          </div>
          <p className="mt-10 font-serif italic text-rose text-right" style={{ fontFamily: "var(--font-display)" }}>
            — Jam for Love 團隊 敬上
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Design 5：內嵌表單（Name / Email / Message） ─── */

function Design5() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* 左欄：說明 + 快速聯繫 */}
          <div className="md:col-span-5 space-y-6">
            <p className="text-[1.05rem] leading-[1.9] text-espresso-light/70">
              不論是合作邀約、採訪、通路詢問，或者只是想跟我們打聲招呼 —— 留下訊息，我們會盡快回覆。
            </p>
            <div className="space-y-3">
              <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 group">
                <span className="w-9 h-9 rounded-full bg-rose/10 text-rose flex items-center justify-center shrink-0 group-hover:bg-rose group-hover:text-white transition-colors"><MailIcon size={16} /></span>
                <div>
                  <p className="text-espresso-light/50 text-xs">Email</p>
                  <p className="text-espresso font-medium text-sm break-all">{EMAIL}</p>
                </div>
              </a>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                <span className="w-9 h-9 rounded-full bg-rose/10 text-rose flex items-center justify-center shrink-0 group-hover:bg-rose group-hover:text-white transition-colors"><FbIcon size={16} /></span>
                <div>
                  <p className="text-espresso-light/50 text-xs">Facebook</p>
                  <p className="text-espresso font-medium text-sm">Jam for Love 社團</p>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-sage/10 text-sage flex items-center justify-center shrink-0"><PinIcon size={16} /></span>
                <div>
                  <p className="text-espresso-light/50 text-xs">地址</p>
                  <p className="text-espresso font-medium text-sm">{LOCATION}</p>
                </div>
              </div>
            </div>
          </div>
          {/* 右欄：表單（尚未接 API，純展示） */}
          <form className="md:col-span-7 bg-white rounded-2xl p-7 ring-1 ring-linen-dark/50 space-y-4 shadow-sm" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-espresso-light/60 text-xs font-semibold tracking-wider uppercase mb-1.5">你的名字</label>
              <input type="text" placeholder="王小明" className="w-full py-2.5 px-0 bg-transparent text-espresso outline-none text-base placeholder:text-espresso-light/30" style={{ borderBottom: "1px solid rgba(30,15,8,0.15)" }} />
            </div>
            <div>
              <label className="block text-espresso-light/60 text-xs font-semibold tracking-wider uppercase mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" className="w-full py-2.5 px-0 bg-transparent text-espresso outline-none text-base placeholder:text-espresso-light/30" style={{ borderBottom: "1px solid rgba(30,15,8,0.15)" }} />
            </div>
            <div>
              <label className="block text-espresso-light/60 text-xs font-semibold tracking-wider uppercase mb-1.5">想對我們說的話</label>
              <textarea rows={4} placeholder="你想聊合作、回饋、訂購問題…" className="w-full py-2.5 px-0 bg-transparent text-espresso outline-none text-base placeholder:text-espresso-light/30 resize-none" style={{ borderBottom: "1px solid rgba(30,15,8,0.15)" }} />
            </div>
            <button type="submit" className="mt-2 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-espresso text-linen text-sm font-medium hover:bg-rose transition-colors">
              送出訊息<ArrowIcon />
            </button>
            <p className="text-espresso-light/40 text-xs">* 這是預覽版，表單尚未串接後端</p>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── 主頁：展示 5 款 ─── */

const DESIGNS = [
  { name: "雜誌編排", desc: "左正文 + 右固定聯繫方塊，延續「關於我們」排版語彙", component: Design1 },
  { name: "三卡片並排", desc: "Email / Facebook / 地址 三張同等卡片，資訊層級清楚", component: Design2 },
  { name: "極簡 CTA", desc: "置中、兩顆大型按鈕，適合把重點放在行動", component: Design3 },
  { name: "信件風", desc: "仿手寫信件排版、虛線邊框，強調品牌個性", component: Design4 },
  { name: "內嵌表單", desc: "左側聯繫方式 + 右側訊息表單，最主動的互動", component: Design5 },
];

export default function ContactPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">Preview</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">「聯繫我們」設計預覽</h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
        <p className="text-espresso-light/60 text-sm mt-4">
          共 5 款，點卡片選擇後告訴我編號，我再把選定的版本正式放到首頁（關於我們下方）
        </p>
      </div>

      <div className="space-y-10">
        {DESIGNS.map((d, i) => {
          const Comp = d.component;
          const isSelected = selected === i;
          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`cursor-pointer rounded-xl transition-all duration-300 overflow-hidden ${
                isSelected ? "ring-2 ring-rose ring-offset-4 ring-offset-linen" : "ring-1 ring-linen-dark/40 hover:ring-espresso-light/40"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-linen-dark/30 bg-white/40">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${isSelected ? "bg-rose text-white" : "bg-linen-dark/50 text-espresso-light"}`}>{i + 1}</span>
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
    </div>
  );
}
