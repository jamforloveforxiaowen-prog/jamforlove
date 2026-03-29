"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

export default function AboutSection() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/site-settings?key=about")
      .then((res) => res.json())
      .then((data) => setContent(data.value || ""))
      .catch(() => {});
  }, []);

  if (!content) return null;

  const paragraphs = content.split("\n").filter((p) => p.trim());

  const quotes = [
    "我們的起心動念很單純",
    "成為一份溫柔而堅定的陪伴力量",
    "即將邁入充滿意義的第十年",
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* 標題 */}
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              About Us
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
              關於我們
            </h2>
            <div className="w-12 h-[2px] bg-rose mt-5" />
          </div>
        </ScrollReveal>

        {/* 左右排版：左引言 + 右正文 */}
        <div className="space-y-14 md:space-y-16">
          {paragraphs.map((para, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
                {/* 左欄：一句話引言 */}
                <div className="md:col-span-4 md:sticky md:top-24">
                  {quotes[i] && (
                    <p
                      className="font-serif font-bold text-rose leading-snug"
                      style={{ fontSize: "clamp(1.4rem, 3vw, 1.7rem)" }}
                    >
                      「{quotes[i]}」
                    </p>
                  )}
                  {/* 裝飾虛線 */}
                  <div
                    className="hidden md:block mt-4 w-10"
                    style={{ borderTop: "2px dashed rgba(196,80,106,0.3)" }}
                  />
                </div>

                {/* 右欄：正文 */}
                <div className="md:col-span-8">
                  <p className="text-[1.05rem] leading-[1.9] text-espresso-light/70">
                    {para}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
