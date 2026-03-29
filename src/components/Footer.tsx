"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <footer className="relative">
      {/* SVG 波浪分隔 */}
      <div className="relative -mb-px">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16" style={{ display: "block" }}>
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            fill="var(--color-espresso)"
          />
        </svg>
      </div>

      {/* 深色內容區 */}
      <div style={{ background: "var(--color-espresso)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            {/* 左欄：品牌 */}
            <div>
              <h3
                className="text-xl tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "var(--color-honey)",
                }}
              >
                Jam for Love
              </h3>
              <p className="text-sm mt-1.5" style={{ color: "var(--color-linen-dark)", opacity: 0.6 }}>
                用愛手工熬煮
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-linen-dark)", opacity: 0.4 }}>
                國立暨南大學
              </p>
            </div>

            {/* 右欄：聯繫 + 版權 */}
            <div className="flex flex-col gap-2.5 sm:items-end">
              <a
                href="https://www.facebook.com/groups/229394627478779/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-rose"
                style={{ color: "rgba(235,226,212,0.7)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook 社團
              </a>
              <a
                href="mailto:jamforloveforxiaowen@gmail.com"
                className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-rose"
                style={{ color: "rgba(235,226,212,0.7)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                jamforloveforxiaowen@gmail.com
              </a>
              <p className="text-xs mt-2" style={{ color: "var(--color-linen-dark)", opacity: 0.4 }}>
                &copy; {new Date().getFullYear()} Jam for Love
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
