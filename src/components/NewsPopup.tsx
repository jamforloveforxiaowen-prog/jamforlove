"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NewsPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (isAuthPage) return;

    try {
      const today = new Date().toISOString().slice(0, 10);
      const dismissed = window.localStorage.getItem("news-popup-dismissed");
      if (dismissed === today) return;
    } catch {
      // localStorage 不可用時仍顯示
    }

    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [isAuthPage]);

  function handleClose() {
    setClosing(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      window.localStorage.setItem("news-popup-dismissed", today);
    } catch {
      // ignore
    }
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{
        background: "rgba(30, 15, 8, 0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(235, 226, 212, 0.8)",
          borderRadius: "1.5rem",
          boxShadow: "0 16px 64px rgba(30, 15, 8, 0.15), 0 4px 16px rgba(30, 15, 8, 0.08)",
          padding: "2rem",
          transform: closing ? "scale(0.95) translateY(10px)" : "scale(1) translateY(0)",
          opacity: closing ? 0 : 1,
          transition: "transform 0.3s ease, opacity 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題區 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-rose text-[0.6875rem] font-semibold tracking-[0.2em] uppercase mb-1.5">
              Latest News
            </p>
            <h2 className="font-serif text-xl font-bold text-espresso">
              最新活動
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-linen-dark/60"
            aria-label="關閉"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8m0-8l-8 8" stroke="var(--color-espresso-light)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="w-full h-px bg-linen-dark/60 mb-4" />

        {/* 內容 */}
        <h3 className="font-serif text-lg font-bold text-espresso mb-2">
          春季限定果醬熱賣中！
        </h3>
        <p className="text-espresso-light text-sm leading-relaxed whitespace-pre-line mb-4">
          嚴選春季新鮮草莓與桑葚，限量手工熬煮。{"\n"}每瓶都是當季最鮮甜的滋味，售完為止！{"\n\n"}即日起至 4/30，訂購滿三瓶享免運優惠。
        </p>

        {/* 日期 */}
        <p className="text-espresso-light/40 text-xs mb-5">
          2026 年 3 月 26 日
        </p>

        {/* 按鈕 */}
        <button
          onClick={handleClose}
          className="w-full py-3 bg-rose text-white font-semibold text-[0.9375rem] rounded-xl transition-all hover:bg-rose-dark hover:shadow-[0_4px_20px_rgba(196,80,106,0.3)] active:scale-[0.97]"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}
