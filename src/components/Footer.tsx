"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const DEFAULT_ABOUT = `「Jam for Love」是一個由「國立暨南大學國際文教與比較教育系」師生所共同組成的募資團隊。我們的起心動念很單純：在這個社會的許多角落，有許多非營利組織（NGO與NPO）正默默耕耘，無論是陪伴弱勢孩童、推動教育發展，或是傳遞和平與善意，他們總是無私地奉獻著自己的專業與時間。

我們深知，這些走在第一線的助人工作者，經常面臨資源匱乏的挑戰。因此，我們希望自己能成為一份溫柔而堅定的陪伴力量。團隊裡的老師與同學們會聚在一起，用心熬煮出一罐罐純粹、甜蜜的果醬。我們期盼透過這份手作的溫度，集結社會大眾的關懷，將這些點滴心意轉化為實質的支持，交到那些持續在助人道路上努力的組織手中，讓他們在付出的同時，也能感受到被照顧的溫暖。

這份透過果醬傳遞愛的行動，即將邁入充滿意義的第十年。十年來，我們不求成為耀眼的光，只願做那陣輕柔的風，為助人者輕輕推動前行的風帆。每一罐果醬，都承載著我們對這片土地的祝福。我們誠摯地邀請您，與我們一起品嚐這份甜蜜，讓這股溫柔的力量持續陪伴更多 NGO 與 NPO，在帶來希望的道路上走得更穩、更長遠。`;

export default function Footer() {
  const pathname = usePathname();
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    fetch("/api/site-settings?key=about")
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setAboutText(data.value);
      })
      .catch(() => {});
  }, []);

  if (pathname === "/login" || pathname === "/register") return null;

  // 將文字分段
  const paragraphs = aboutText.split("\n").filter((p) => p.trim());

  return (
    <footer>
      {/* ── 關於我們 ── editorial 風格 */}
      <div
        className="relative"
        style={{ background: "linear-gradient(180deg, var(--color-linen) 0%, var(--color-parchment) 100%)" }}
      >
        {/* 頂部裝飾線 */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px" style={{ background: "linear-gradient(90deg, var(--color-rose), var(--color-honey-light), var(--color-sage-light), var(--color-rose-light))" }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* 左欄：標題 + 裝飾 */}
            <div className="md:col-span-4">
              <ScrollReveal>
                <p
                  className="text-[0.6875rem] font-semibold tracking-[0.3em] uppercase mb-4"
                  style={{ color: "var(--color-rose)" }}
                >
                  About Us
                </p>
                <h2
                  className="font-serif font-bold text-espresso mb-6"
                  style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15 }}
                >
                  關於
                  <br />
                  我們
                </h2>
                <div className="w-12 h-[2px] mb-8" style={{ background: "var(--color-rose)" }} />
              </ScrollReveal>

              {/* 側邊引言 */}
              <ScrollReveal delay={0.15}>
                <blockquote className="hidden md:block">
                  <p
                    className="font-serif text-lg leading-relaxed italic"
                    style={{ color: "var(--color-espresso-light)" }}
                  >
                    &ldquo;不求成為耀眼的光，只願做那陣輕柔的風&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-px" style={{ background: "var(--color-honey)" }} />
                    <span className="text-xs tracking-wider" style={{ color: "var(--color-honey)" }}>
                      Jam For Love 團隊
                    </span>
                  </div>
                </blockquote>
              </ScrollReveal>
            </div>

            {/* 右欄：內文 */}
            <div className="md:col-span-8">
              {paragraphs.map((paragraph, i) => (
                <ScrollReveal key={i} delay={0.05 + i * 0.08}>
                  <p
                    className="font-serif leading-[1.9] mb-6 last:mb-0"
                    style={{
                      color: "var(--color-espresso-light)",
                      fontSize: "clamp(0.9375rem, 1.5vw, 1.0625rem)",
                      textIndent: "2em",
                    }}
                  >
                    {paragraph}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 品牌底欄 ── 深色調 */}
      <div style={{ background: "var(--color-espresso)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-center">
            {/* 品牌識別 */}
            <div className="md:col-span-5 flex items-center gap-5">
              <Image
                src="/logo.jpg"
                alt="Jam For Love"
                width={56}
                height={56}
                className="rounded-full ring-2 ring-white/10"
              />
              <div>
                <p
                  className="text-lg tracking-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "var(--color-linen)",
                  }}
                >
                  Jam For Love
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-linen-dark)", letterSpacing: "0.15em", opacity: 0.5 }}>
                  HANDMADE WITH LOVE
                </p>
              </div>
            </div>

            {/* 連結 */}
            <div className="md:col-span-4 flex items-center gap-6 md:justify-center">
              <a
                href="https://www.facebook.com/groups/229394627478779/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-100 opacity-60"
                aria-label="Facebook 社團"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--color-linen)" }}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span
                  className="text-sm font-medium group-hover:underline underline-offset-4"
                  style={{ color: "var(--color-linen)" }}
                >
                  Facebook 社團
                </span>
              </a>
            </div>

            {/* 版權 */}
            <div className="md:col-span-3 md:text-right">
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-linen-dark)", opacity: 0.6 }}>
                用愛手工熬煮
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-linen-dark)", opacity: 0.4 }}>
                &copy; {new Date().getFullYear()} Jam For Love
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
