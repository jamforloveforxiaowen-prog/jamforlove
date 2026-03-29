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

        {/* 左右排版：左一句引言 + 右全部正文 */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* 左欄：一句話 */}
            <div className="md:col-span-4 md:sticky md:top-24">
              <p
                className="font-serif font-bold text-rose leading-snug"
                style={{ fontSize: "clamp(1.4rem, 3vw, 1.7rem)" }}
              >
                「用果醬傳遞愛，陪伴助人者走得更遠。」
              </p>
              <div
                className="hidden md:block mt-5 w-10"
                style={{ borderTop: "2px dashed rgba(196,80,106,0.3)" }}
              />
            </div>

            {/* 右欄：全部正文 */}
            <div className="md:col-span-8 space-y-6">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-[1.05rem] leading-[1.9] text-espresso-light/70">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
