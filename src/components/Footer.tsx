"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <footer>
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
