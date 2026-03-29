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

  // 將內容依換行分段
  const paragraphs = content.split("\n").filter((p) => p.trim());

  // 每段的引言（風格6：大字引言）
  const quotes = [
    "我們的起心動念很單純",
    "成為一份溫柔而堅定的陪伴力量",
    "即將邁入充滿意義的第十年",
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        {/* 標題 */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              About Us
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
              關於我們
            </h2>
            <div className="w-12 h-[2px] bg-rose mt-5 mx-auto" />
          </div>
        </ScrollReveal>

        {/* 段落：雜誌編排（首字放大） + 全幅引言 */}
        <div className="space-y-12">
          {paragraphs.map((para, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div>
                {/* 引言（風格6） */}
                {quotes[i] && (
                  <p
                    className="mb-4 font-serif font-bold text-rose"
                    style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)", lineHeight: 1.4 }}
                  >
                    「{quotes[i]}」
                  </p>
                )}

                {/* 正文（風格2：第一段首字放大） */}
                <p className="text-[1.05rem] leading-[1.9] text-espresso-light/70">
                  {i === 0 ? (
                    <>
                      <span
                        className="float-left mr-3 mt-1 text-5xl font-bold leading-none text-rose"
                        style={{ fontFamily: "serif" }}
                      >
                        {para.charAt(0)}
                      </span>
                      {para.slice(1)}
                    </>
                  ) : (
                    para
                  )}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* 底部裝飾線（風格2） */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 h-1 w-16 bg-rose" />
        </ScrollReveal>
      </div>
    </section>
  );
}
