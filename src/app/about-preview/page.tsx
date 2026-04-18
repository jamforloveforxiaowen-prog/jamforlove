"use client";

import React from "react";

const P1 =
  "「Jam for Love」是一個由「國立暨南大學國際文教與比較教育系」師生所共同組成的募資團隊。我們的起心動念很單純：在這個社會的許多角落，有許多非營利組織（NGO與NPO）正默默耕耘，無論是陪伴弱勢孩童、推動教育發展，或是傳遞和平與善意，他們總是無私地奉獻著自己的專業與時間。";

const P2 =
  "我們深知，這些走在第一線的助人工作者，經常面臨資源匱乏的挑戰。因此，我們希望自己能成為一份溫柔而堅定的陪伴力量。團隊裡的老師與同學們會聚在一起，用心熬煮出一罐罐純粹、甜蜜的果醬。我們期盼透過這份手作的溫度，集結社會大眾的關懷，將這些點滴心意轉化為實質的支持，交到那些持續在助人道路上努力的組織手中，讓他們在付出的同時，也能感受到被照顧的溫暖。";

const P3 =
  "這份透過果醬傳遞愛的行動，即將邁入充滿意義的第十年。十年來，我們不求成為耀眼的光，只願做那陣輕柔的風，為助人者輕輕推動前行的風帆。每一罐果醬，都承載著我們對這片土地的祝福。我們誠摯地邀請您，與我們一起品嚐這份甜蜜，讓這股溫柔的力量持續陪伴更多 NGO 與 NPO，在帶來希望的道路上走得更穩、更長遠。";

const PARAGRAPHS = [P1, P2, P3];
const QUOTE = "用果醬傳遞愛，陪伴助人者走得更遠。";

/* ─── 共用品牌元件（保留原設計語彙） ─── */

function BrandHeading({ align = "left" }: { align?: "left" | "center" }) {
  const alignClass = align === "center" ? "text-center" : "";
  return (
    <div className={`mb-12 ${alignClass}`}>
      <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
        About Us
      </p>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
        關於我們
      </h2>
      <div
        className={`w-12 h-[2px] bg-rose mt-5 ${align === "center" ? "mx-auto" : ""}`}
      />
    </div>
  );
}

function BrandQuote({
  size = "md",
  withDash = true,
  align = "left",
}: {
  size?: "sm" | "md" | "lg";
  withDash?: boolean;
  align?: "left" | "center";
}) {
  const fontSize =
    size === "lg"
      ? "clamp(1.8rem, 4vw, 2.4rem)"
      : size === "sm"
        ? "clamp(1.15rem, 2.2vw, 1.4rem)"
        : "clamp(1.4rem, 3vw, 1.7rem)";
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p
        className="font-serif font-bold text-rose leading-snug"
        style={{ fontSize }}
      >
        「{QUOTE}」
      </p>
      {withDash && (
        <div
          className={`mt-5 w-10 ${align === "center" ? "mx-auto" : ""}`}
          style={{ borderTop: "2px dashed rgba(196,80,106,0.3)" }}
        />
      )}
    </div>
  );
}

function BodyParagraph({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <p className={`text-[1.05rem] leading-[1.9] text-espresso-light/70 ${className}`}>
      {text}
    </p>
  );
}

/* ─── 外框 ─── */

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
      {index > 1 && (
        <hr className="mb-12 border-t border-[var(--color-linen-dark)]" />
      )}
      <div
        className="mb-8 flex items-center gap-3"
        style={{
          animation: `bakeSwing 0.7s cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: `${index * 0.12}s`,
        }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-sm font-bold text-white">
          {index}
        </span>
        <h2 className="text-xl font-bold text-espresso">{title}</h2>
      </div>
      <div
        className="rounded-2xl bg-white/40 p-8 md:p-12"
        style={{
          animation: `bakeSwing 0.7s cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: `${index * 0.12 + 0.15}s`,
          border: "1px solid rgba(235,226,212,0.8)",
        }}
      >
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   1. 原始版（左引言 + 右正文）
   ═══════════════════════════════════════ */
function Style01() {
  return (
    <Section index={1} title="原始版 — 左引言 + 右正文">
      <BrandHeading />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4">
          <BrandQuote />
        </div>
        <div className="md:col-span-8 space-y-6">
          {PARAGRAPHS.map((p, i) => (
            <BodyParagraph key={i} text={p} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   2. 鏡像版（左正文 + 右引言）
   ═══════════════════════════════════════ */
function Style02() {
  return (
    <Section index={2} title="鏡像版 — 右引言 + 左正文">
      <BrandHeading />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-8 space-y-6 order-2 md:order-1">
          {PARAGRAPHS.map((p, i) => (
            <BodyParagraph key={i} text={p} />
          ))}
        </div>
        <div className="md:col-span-4 order-1 md:order-2 md:text-right">
          <BrandQuote align="left" />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   3. 置中大標 + 單欄細長正文
   ═══════════════════════════════════════ */
function Style03() {
  return (
    <Section index={3} title="置中大標 — 標題置中、正文窄欄">
      <BrandHeading align="center" />
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <BrandQuote size="md" align="center" withDash />
        </div>
        <div className="space-y-6">
          {PARAGRAPHS.map((p, i) => (
            <BodyParagraph key={i} text={p} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   4. 三欄段落（橫向並列）
   ═══════════════════════════════════════ */
function Style04() {
  const labels = ["緣起", "行動", "十年"];
  return (
    <Section index={4} title="三欄段落 — 起源／行動／十年 並列">
      <BrandHeading />
      <div className="mb-10">
        <BrandQuote />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {PARAGRAPHS.map((p, i) => (
          <div key={i}>
            <p className="text-rose text-[0.7rem] font-semibold tracking-[0.3em] uppercase mb-3">
              {labels[i]}
            </p>
            <div
              className="w-8 h-px bg-rose/40 mb-4"
              style={{ borderTop: "1px dashed rgba(196,80,106,0.4)" }}
            />
            <BodyParagraph text={p} />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   5. 大型引言 Hero + 下方單欄
   ═══════════════════════════════════════ */
function Style05() {
  return (
    <Section index={5} title="Hero 引言 — 巨型引言置頂，正文窄欄置中">
      <BrandHeading align="center" />
      <div className="mb-14 text-center">
        <BrandQuote size="lg" align="center" withDash={false} />
        <div
          className="mt-6 w-16 mx-auto"
          style={{ borderTop: "2px dashed rgba(196,80,106,0.3)" }}
        />
      </div>
      <div className="max-w-3xl mx-auto space-y-6">
        {PARAGRAPHS.map((p, i) => (
          <BodyParagraph key={i} text={p} />
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   6. 引言嵌入中段（首段 → 引言 → 其餘）
   ═══════════════════════════════════════ */
function Style06() {
  return (
    <Section index={6} title="引言穿插 — 首段後穿插引言分隔">
      <BrandHeading />
      <div className="max-w-3xl mx-auto space-y-6">
        <BodyParagraph text={P1} />
        <div className="py-6">
          <BrandQuote size="md" align="left" withDash={false} />
        </div>
        <BodyParagraph text={P2} />
        <BodyParagraph text={P3} />
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   7. 左直排標題 + 右大型引言與正文
   ═══════════════════════════════════════ */
function Style07() {
  return (
    <Section index={7} title="直排標題 — 左側垂直排文，右側內容">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
        <div className="md:col-span-3">
          <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            About Us
          </p>
          <h2
            className="font-serif font-bold text-espresso"
            style={{
              writingMode: "vertical-rl",
              letterSpacing: "0.4em",
              fontSize: "clamp(2rem, 4vw, 2.6rem)",
              lineHeight: 1,
            }}
          >
            關於我們
          </h2>
          <div
            className="mt-6"
            style={{
              width: 2,
              height: 48,
              background: "var(--color-rose)",
            }}
          />
        </div>
        <div className="md:col-span-9 space-y-8">
          <BrandQuote size="md" />
          {PARAGRAPHS.map((p, i) => (
            <BodyParagraph key={i} text={p} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   8. 虛線軌道 + 節點
   ═══════════════════════════════════════ */
function Style08() {
  return (
    <Section index={8} title="虛線軌道 — 左側玫瑰節點串起三段">
      <BrandHeading />
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <BrandQuote />
        </div>
        <div
          className="relative pl-10"
          style={{
            borderLeft: "2px dashed rgba(196,80,106,0.3)",
          }}
        >
          {PARAGRAPHS.map((p, i) => (
            <div key={i} className="relative mb-10 last:mb-0">
              <span
                className="absolute flex items-center justify-center"
                style={{
                  left: "-2.75rem",
                  top: 6,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "var(--color-rose)",
                  boxShadow: "0 0 0 4px rgba(255,255,255,0.9)",
                }}
              />
              <BodyParagraph text={p} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   9. 首段強調（首段放大 espresso 深色）
   ═══════════════════════════════════════ */
function Style09() {
  return (
    <Section index={9} title="首段強調 — 第一段放大加深，其餘柔和">
      <BrandHeading />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4">
          <BrandQuote />
        </div>
        <div className="md:col-span-8 space-y-6">
          <p
            className="font-serif text-espresso leading-[1.8]"
            style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.25rem)" }}
          >
            {P1}
          </p>
          <BodyParagraph text={P2} />
          <BodyParagraph text={P3} />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════
   10. 不對稱格線（小引言卡 + 偏移正文）
   ═══════════════════════════════════════ */
function Style10() {
  return (
    <Section index={10} title="不對稱格線 — 懸浮引言卡 + 偏移正文">
      <BrandHeading />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 md:col-start-1">
          <div
            className="relative p-6 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(196,80,106,0.2)",
              boxShadow: "0 10px 40px rgba(30,15,8,0.06)",
            }}
          >
            <span
              className="absolute text-rose font-serif"
              style={{
                top: -18,
                left: 16,
                fontSize: "4rem",
                lineHeight: 1,
                fontStyle: "italic",
                fontWeight: 300,
                fontFamily: "var(--font-display)",
              }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <BrandQuote size="sm" withDash={false} />
          </div>
        </div>
        <div className="md:col-span-7 md:col-start-6 space-y-6">
          {PARAGRAPHS.map((p, i) => (
            <BodyParagraph key={i} text={p} />
          ))}
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
    <main
      className="min-h-screen px-4 py-12 sm:px-6 lg:px-8"
      style={{ background: "var(--color-linen)" }}
    >
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
        共 10 種排版，皆保留原設計風格（玫瑰粉標語、襯線大標、短線、斜體引言、柔和咖啡正文）
      </p>

      <div className="max-w-6xl mx-auto">
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
      </div>
    </main>
  );
}
