"use client";

import { useState } from "react";

const P1 =
  "「Jam for Love」是一個由「國立暨南大學國際文教與比較教育系」師生所共同組成的募資團隊。我們的起心動念很單純：在這個社會的許多角落，有許多非營利組織（NGO與NPO）正默默耕耘，無論是陪伴弱勢孩童、推動教育發展，或是傳遞和平與善意，他們總是無私地奉獻著自己的專業與時間。";

const P2 =
  "我們深知，這些走在第一線的助人工作者，經常面臨資源匱乏的挑戰。因此，我們希望自己能成為一份溫柔而堅定的陪伴力量。團隊裡的老師與同學們會聚在一起，用心熬煮出一罐罐純粹、甜蜜的果醬。我們期盼透過這份手作的溫度，集結社會大眾的關懷，將這些點滴心意轉化為實質的支持，交到那些持續在助人道路上努力的組織手中，讓他們在付出的同時，也能感受到被照顧的溫暖。";

const P3 =
  "這份透過果醬傳遞愛的行動，即將邁入充滿意義的第十年。十年來，我們不求成為耀眼的光，只願做那陣輕柔的風，為助人者輕輕推動前行的風帆。每一罐果醬，都承載著我們對這片土地的祝福。我們誠摯地邀請您，與我們一起品嚐這份甜蜜，讓這股溫柔的力量持續陪伴更多 NGO 與 NPO，在帶來希望的道路上走得更穩、更長遠。";

/* ── 區塊包裝：編號 + 名稱 + bakeSwing 動畫 ── */
function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12">
      {/* 分隔線（第一個不需要） */}
      {index > 1 && (
        <hr className="mb-12 border-t border-[var(--color-linen-dark)]" />
      )}

      {/* 編號 + 風格名稱 */}
      <div
        className="mb-8 flex items-center gap-3"
        style={{
          animation: `bakeSwing 0.7s cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: `${index * 0.12}s`,
        }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-rose)] text-sm font-bold text-white">
          {index}
        </span>
        <h2 className="text-xl font-bold text-espresso">{title}</h2>
      </div>

      {/* 內容 */}
      <div
        style={{
          animation: `bakeSwing 0.7s cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: `${index * 0.12 + 0.15}s`,
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   1. 經典置中
   ═══════════════════════════════════════ */
function Style01() {
  return (
    <Section index={1} title="經典置中">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-lg leading-relaxed text-espresso">{P1}</p>
        <p className="my-6 text-2xl text-[var(--color-rose)]">「 」</p>
        <p className="text-lg leading-relaxed text-espresso">{P2}</p>
        <p className="my-6 text-2xl text-[var(--color-rose)]">「 」</p>
        <p className="text-lg leading-relaxed text-espresso">{P3}</p>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   2. 雜誌編排
   ═══════════════════════════════════════ */
function Style02() {
  return (
    <Section index={2} title="雜誌編排">
      <div className="mx-auto max-w-3xl">
        {/* first-letter 需要 inline style 因為 Tailwind 無法直接設定 */}
        <p
          className="mb-6 text-lg leading-relaxed text-espresso"
          style={{}}
        >
          <span
            className="float-left mr-3 mt-1 text-5xl font-bold leading-none text-[var(--color-rose)]"
            style={{ fontFamily: "serif" }}
          >
            {P1.charAt(0)}
          </span>
          {P1.slice(1)}
        </p>
        <p className="mb-6 text-lg leading-relaxed text-espresso-light">
          {P2}
        </p>
        <p className="text-lg leading-relaxed text-espresso-light">{P3}</p>
        <div className="mt-8 h-1 w-16 bg-[var(--color-rose)]" />
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   3. 時間軸敘事
   ═══════════════════════════════════════ */
function Style03() {
  const items = [
    { label: "起源", text: P1 },
    { label: "行動", text: P2 },
    { label: "第十年", text: P3 },
  ];

  return (
    <Section index={3} title="時間軸敘事">
      <div className="relative mx-auto max-w-3xl pl-10">
        {/* 垂直虛線 */}
        <div className="absolute left-3 top-0 h-full w-px border-l-2 border-dashed border-[var(--color-rose-light)]" />

        {items.map((item, i) => (
          <div key={i} className="relative mb-10 last:mb-0">
            {/* 圓形節點 */}
            <div className="absolute -left-10 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-rose)] text-xs font-bold text-white">
              {i + 1}
            </div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-honey)]">
              {item.label}
            </p>
            <p className="text-lg leading-relaxed text-espresso">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   4. 卡片分段
   ═══════════════════════════════════════ */
function Style04() {
  const cards = [P1, P2, P3];

  return (
    <Section index={4} title="卡片分段">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
        {cards.map((text, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-dashed border-[var(--color-linen-dark)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-rose-light)] hover:shadow-lg"
          >
            <p className="text-base leading-relaxed text-espresso">{text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   5. 左圖右文
   ═══════════════════════════════════════ */
function Style05() {
  return (
    <Section index={5} title="左圖右文">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 md:flex-row">
        {/* 左側裝飾 */}
        <div className="flex shrink-0 flex-col items-center gap-4 text-7xl md:sticky md:top-8">
          <span className="text-[var(--color-rose)]" aria-hidden="true">
            ♥
          </span>
          <span aria-hidden="true">🫙</span>
        </div>
        {/* 右側文字 */}
        <div className="space-y-5">
          <p className="text-lg leading-relaxed text-espresso">{P1}</p>
          <p className="text-lg leading-relaxed text-espresso">{P2}</p>
          <p className="text-lg leading-relaxed text-espresso">{P3}</p>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   6. 全幅引言
   ═══════════════════════════════════════ */
function Style06() {
  const sections = [
    { quote: "我們的起心動念很單純", body: P1 },
    { quote: "成為一份溫柔而堅定的陪伴力量", body: P2 },
    { quote: "即將邁入充滿意義的第十年", body: P3 },
  ];

  return (
    <Section index={6} title="全幅引言">
      <div className="mx-auto max-w-3xl space-y-10">
        {sections.map((s, i) => (
          <div key={i}>
            <p
              className="mb-4 font-bold text-[var(--color-rose)]"
              style={{ fontSize: "1.6rem", lineHeight: 1.4 }}
            >
              「{s.quote}」
            </p>
            <p className="text-base leading-relaxed text-espresso-light">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   7. 手寫信風
   ═══════════════════════════════════════ */
function Style07() {
  return (
    <Section index={7} title="手寫信風">
      <div
        className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-sm"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 31px, var(--color-linen-dark) 31px, var(--color-linen-dark) 32px)",
          backgroundPositionY: "12px",
          transform: "rotate(-0.5deg)",
        }}
      >
        <p className="mb-6 text-lg leading-[32px] text-espresso">{P1}</p>
        <p className="mb-6 text-lg leading-[32px] text-espresso">{P2}</p>
        <p className="mb-8 text-lg leading-[32px] text-espresso">{P3}</p>
        <p className="text-right text-lg italic text-[var(--color-rose)]">
          Jam for Love 團隊 敬上
        </p>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   8. 數字亮點
   ═══════════════════════════════════════ */
function Style08() {
  const highlights = [
    { number: "第 10 年", color: "var(--color-rose)" },
    { number: "NGO & NPO", color: "var(--color-sage)" },
    { number: "暨南大學", color: "var(--color-honey)" },
  ];

  return (
    <Section index={8} title="數字亮點">
      <div className="mx-auto max-w-4xl">
        {/* 數字亮點列 */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-8">
          {highlights.map((h, i) => (
            <div key={i} className="text-center">
              <p
                className="text-3xl font-extrabold md:text-4xl"
                style={{ color: h.color }}
              >
                {h.number}
              </p>
            </div>
          ))}
        </div>
        {/* 正文 */}
        <div className="space-y-5">
          <p className="text-lg leading-relaxed text-espresso">{P1}</p>
          <p className="text-lg leading-relaxed text-espresso">{P2}</p>
          <p className="text-lg leading-relaxed text-espresso">{P3}</p>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   9. 摺疊展開
   ═══════════════════════════════════════ */
function Style09() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Section index={9} title="摺疊展開">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-lg leading-relaxed text-espresso">{P1}</p>

        {/* 可摺疊區域：grid-template-rows transition */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-in-out"
          style={{
            gridTemplateRows: expanded ? "1fr" : "0fr",
          }}
        >
          <div className="overflow-hidden">
            <p className="mb-4 text-lg leading-relaxed text-espresso">{P2}</p>
            <p className="text-lg leading-relaxed text-espresso">{P3}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-4 font-semibold text-[var(--color-rose)] underline underline-offset-4 transition-colors hover:text-[var(--color-rose-dark)]"
        >
          {expanded ? "收起" : "閱讀更多"}
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   10. 雙欄對比
   ═══════════════════════════════════════ */
function Style10() {
  return (
    <Section index={10} title="雙欄對比">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* 左欄 */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-[var(--color-rose)]">
              我們的信念
            </h3>
            <p className="text-lg leading-relaxed text-espresso">{P1}</p>
          </div>
          {/* 右欄 */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-[var(--color-sage)]">
              我們的行動
            </h3>
            <p className="text-lg leading-relaxed text-espresso">{P2}</p>
          </div>
        </div>
        {/* 底部跨欄 */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-lg leading-relaxed text-espresso">{P3}</p>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   主頁面
   ═══════════════════════════════════════ */
export default function AboutPreviewPage() {
  return (
    <main className="min-h-screen bg-linen px-4 py-12 sm:px-6 lg:px-8">
      {/* 頁面標題 */}
      <h1
        className="mb-4 text-center text-3xl font-extrabold text-espresso md:text-4xl"
        style={{
          animation: `bakeSwing 0.7s cubic-bezier(0.34,1.56,0.64,1) both`,
        }}
      >
        關於我們 — 排版風格預覽
      </h1>
      <p
        className="mb-12 text-center text-espresso-light"
        style={{
          animation: `bakeSwing 0.7s cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: "0.1s",
        }}
      >
        共 10 種風格，供挑選最適合品牌調性的版面
      </p>

      <Style01 />
      <Style02 />
      <Style03 />
      <Style04 />
      <Style05 />
      <Style06 />
      <Style07 />
      <Style08 />
      <Style09 />
      <Style10 />
    </main>
  );
}
