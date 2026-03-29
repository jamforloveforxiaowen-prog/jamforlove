"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";

interface StoryBlock {
  id: number;
  heading: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
}

export default function StoryPage() {
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/story")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlocks(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // 總頁數 = 封面 + 故事頁 + 封底
  const totalPages = blocks.length + 2;

  function goTo(page: number) {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }

  function scrollToBook() {
    bookRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="min-h-screen py-12 md:py-16">
      {/* 標題 */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <ScrollReveal>
          <div>
            <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">Our Story</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">果醬的故事</h1>
            <div className="w-16 h-[2px] bg-rose mt-5 origin-left animate-underline-grow" />
          </div>
        </ScrollReveal>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-3" />
          <p className="text-espresso-light/50 text-sm">翻開故事書中...</p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">📖</div>
            <p className="text-espresso-light text-lg font-serif">故事正在撰寫中 — 敬請期待</p>
          </div>
        </div>
      ) : (
        <>
          {/* 書本容器 */}
          <div ref={bookRef} className="max-w-4xl mx-auto px-4">
            <div
              className="relative mx-auto overflow-hidden rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #faf6f0 0%, #f5ede0 100%)",
                boxShadow: "0 20px 60px rgba(30,15,8,0.12), 0 4px 16px rgba(30,15,8,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
                border: "1px solid rgba(30,15,8,0.08)",
              }}
            >
              {/* 書脊裝飾 */}
              <div
                className="absolute left-0 top-0 bottom-0 w-3 md:w-4 z-10"
                style={{
                  background: "linear-gradient(90deg, rgba(30,15,8,0.08) 0%, rgba(30,15,8,0.03) 50%, transparent 100%)",
                }}
              />

              {/* 頁面內容 */}
              <div className="relative min-h-[500px] md:min-h-[600px]">
                {/* 封面 */}
                {currentPage === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px] px-8 py-12 text-center animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                    {/* 裝飾框 */}
                    <div
                      className="p-8 md:p-12 rounded-xl max-w-md"
                      style={{ border: "3px dashed rgba(196,80,106,0.25)" }}
                    >
                      <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-4">Since 2016</p>
                      <h2
                        className="text-3xl md:text-4xl text-espresso mb-3"
                        style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
                      >
                        Jam for Love
                      </h2>
                      <div className="flex items-center justify-center gap-3 my-4">
                        <span className="w-8 h-px bg-rose/30" />
                        <span className="text-rose text-sm animate-[heartbeat_1.2s_ease-in-out_infinite]">♥</span>
                        <span className="w-8 h-px bg-rose/30" />
                      </div>
                      <p className="text-espresso-light/60 text-sm leading-relaxed font-serif">
                        用愛手工熬煮的十年旅程
                      </p>
                    </div>

                    {/* 翻頁提示 */}
                    <button
                      onClick={() => { goTo(1); scrollToBook(); }}
                      className="mt-8 text-rose/60 hover:text-rose transition-colors text-sm flex items-center gap-2 animate-[float_4s_ease-in-out_infinite]"
                    >
                      翻開故事
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}

                {/* 故事頁 */}
                {currentPage > 0 && currentPage <= blocks.length && (() => {
                  const block = blocks[currentPage - 1];
                  const pageNum = currentPage;
                  const isEven = pageNum % 2 === 0;

                  return (
                    <div
                      key={block.id}
                      className="min-h-[500px] md:min-h-[600px] p-6 md:p-10 animate-[bakeSwing_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                    >
                      {/* 頁碼 */}
                      <div className={`text-xs text-espresso-light/30 mb-6 ${isEven ? "text-right" : "text-left"}`}>
                        — {pageNum} —
                      </div>

                      {/* 章節標題 */}
                      {block.heading && (
                        <div className="mb-6">
                          <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                            Chapter {pageNum}
                          </p>
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso leading-tight">
                            {block.heading}
                          </h2>
                          <div className="w-12 h-[2px] bg-rose/40 mt-3" />
                        </div>
                      )}

                      {/* 圖片 + 內文 */}
                      {block.imageUrl ? (
                        <div className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-8 items-start`}>
                          {/* 圖片 — 帶有「照片貼在書上」的感覺 */}
                          <div
                            className="w-full md:w-2/5 shrink-0"
                            style={{ transform: `rotate(${isEven ? 1.5 : -1}deg)` }}
                          >
                            <div
                              className="overflow-hidden rounded-lg"
                              style={{
                                boxShadow: "0 4px 20px rgba(30,15,8,0.1)",
                                border: "4px solid white",
                              }}
                            >
                              <Image
                                src={block.imageUrl}
                                alt={block.heading || "故事圖片"}
                                width={400}
                                height={300}
                                className="w-full object-cover"
                                unoptimized={block.imageUrl.startsWith("data:")}
                              />
                            </div>
                            {/* 膠帶裝飾 */}
                            <div
                              className="w-12 h-4 mx-auto -mt-2 rounded-sm opacity-40"
                              style={{
                                background: "rgba(200,149,48,0.4)",
                                transform: `rotate(${isEven ? -3 : 5}deg)`,
                              }}
                            />
                          </div>

                          {/* 文字 */}
                          <div className="flex-1">
                            <p className="text-[1.05rem] leading-[2] text-espresso-light/70 whitespace-pre-line font-serif">
                              {block.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* 純文字頁 — 首字放大 */
                        <div className="max-w-2xl mx-auto">
                          <p className="text-[1.05rem] leading-[2] text-espresso-light/70 whitespace-pre-line font-serif">
                            <span
                              className="float-left mr-3 mt-1 text-5xl font-bold leading-none text-rose/60"
                              style={{ fontFamily: "serif" }}
                            >
                              {block.content.charAt(0)}
                            </span>
                            {block.content.slice(1)}
                          </p>
                        </div>
                      )}

                      {/* 頁底裝飾 */}
                      <div className="flex items-center justify-center gap-3 mt-8 pt-4" style={{ borderTop: "1px dashed rgba(30,15,8,0.06)" }}>
                        <span className="w-6 h-px bg-espresso/10" />
                        <span className="text-rose/30 text-xs">♥</span>
                        <span className="w-6 h-px bg-espresso/10" />
                      </div>
                    </div>
                  );
                })()}

                {/* 封底 */}
                {currentPage === totalPages - 1 && (
                  <div className="flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px] px-8 py-12 text-center animate-[bakeSwing_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                    <div className="text-5xl mb-6 animate-[heartbeat_1.2s_ease-in-out_infinite]">♥</div>
                    <h2
                      className="text-2xl md:text-3xl text-espresso mb-4"
                      style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
                    >
                      To be continued...
                    </h2>
                    <p className="text-espresso-light/50 text-sm leading-relaxed max-w-sm font-serif mb-8">
                      每一罐果醬，都承載著我們對這片土地的祝福。<br />
                      故事還在繼續，感謝你的陪伴。
                    </p>
                    <div
                      className="px-6 py-2 rounded-full text-xs text-espresso-light/40"
                      style={{ border: "1.5px dashed rgba(30,15,8,0.1)" }}
                    >
                      Jam for Love · Since 2016
                    </div>
                  </div>
                )}
              </div>

              {/* 翻頁控制 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px dashed rgba(30,15,8,0.06)" }}>
                  <button
                    onClick={() => { goTo(currentPage - 1); scrollToBook(); }}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1.5 text-sm text-espresso-light/50 hover:text-rose disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    上一頁
                  </button>

                  {/* 頁碼指示 */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { goTo(i); scrollToBook(); }}
                        className={`rounded-full transition-all duration-300 ${
                          i === currentPage ? "w-5 h-2 bg-rose" : "w-2 h-2 bg-espresso/10 hover:bg-espresso/20"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => { goTo(currentPage + 1); scrollToBook(); }}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-1.5 text-sm text-espresso-light/50 hover:text-rose disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  >
                    下一頁
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
