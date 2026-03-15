"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  name: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function navLinkClass(href: string) {
    const base = "px-3.5 py-1.5 rounded-full text-[0.875rem] font-medium transition-all duration-200";
    if (isActive(href)) {
      return scrolled
        ? `${base} bg-rose/10 text-rose`
        : `${base} bg-white/20 text-white`;
    }
    return scrolled
      ? `${base} text-espresso-light hover:text-rose hover:bg-rose/5`
      : `${base} text-white/70 hover:text-white hover:bg-white/10`;
  }

  function mobileLinkClass(href: string) {
    return isActive(href)
      ? "block py-2.5 text-espresso font-medium"
      : "block py-2.5 text-espresso-light hover:text-rose transition-colors";
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full transition-all duration-300"
        style={{
          maxWidth: 1100,
          borderRadius: 9999,
          background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: scrolled
            ? "1px solid var(--color-linen-dark)"
            : "1px solid rgba(255,255,255,0.15)",
          boxShadow: scrolled
            ? "0 8px 30px rgba(30,15,8,0.1)"
            : "0 4px 20px rgba(0,0,0,0.08)",
          padding: "0 24px",
        }}
      >
        <div className="h-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src="/logo.jpg"
              alt="Jam For Love"
              width={32}
              height={32}
              className="rounded-full transition-all duration-200"
              style={{
                boxShadow: scrolled
                  ? "0 1px 4px rgba(30,15,8,0.1)"
                  : "0 1px 4px rgba(0,0,0,0.2)",
              }}
            />
            <span
              className="text-[1.1rem] transition-colors duration-200"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                color: scrolled ? "var(--color-espresso)" : "white",
                textShadow: scrolled ? "none" : "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              Jam For Love
            </span>
          </Link>

          {/* 桌面版選單 — 居中 */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={navLinkClass("/")}>
              首頁
            </Link>
            {!isAuthPage && (
              <>
                {user ? (
                  <>
                    <Link href="/order" className={navLinkClass("/order")}>
                      訂購
                    </Link>
                    <Link href="/my-orders" className={navLinkClass("/my-orders")}>
                      我的訂單
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" className={navLinkClass("/admin")}>
                        後台管理
                      </Link>
                    )}
                  </>
                ) : null}
              </>
            )}
          </div>

          {/* 右側按鈕區 */}
          <div className="hidden md:flex items-center gap-2">
            {!isAuthPage && (
              <>
                {user ? (
                  <>
                    <span
                      className="px-3 py-1.5 rounded-full text-[0.8125rem] max-w-[100px] truncate transition-colors duration-200"
                      style={{
                        color: scrolled
                          ? "var(--color-espresso-light)"
                          : "rgba(255,255,255,0.7)",
                      }}
                      title={user.name}
                    >
                      {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-1.5 rounded-full text-[0.8125rem] font-medium transition-all duration-200"
                      style={{
                        border: scrolled
                          ? "1px solid var(--color-linen-dark)"
                          : "1px solid rgba(255,255,255,0.25)",
                        color: scrolled
                          ? "var(--color-espresso-light)"
                          : "rgba(255,255,255,0.8)",
                      }}
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-1.5 rounded-full text-[0.8125rem] font-medium transition-all duration-200"
                      style={{
                        color: scrolled
                          ? "var(--color-espresso-light)"
                          : "rgba(255,255,255,0.8)",
                      }}
                    >
                      登入
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-1.5 rounded-full text-[0.8125rem] font-semibold transition-all duration-200 hover:-translate-y-px"
                      style={{
                        background: scrolled
                          ? "var(--color-rose)"
                          : "rgba(255,255,255,0.18)",
                        color: "white",
                        border: scrolled
                          ? "none"
                          : "1px solid rgba(255,255,255,0.25)",
                        boxShadow: scrolled
                          ? "0 2px 12px rgba(196,80,106,0.3)"
                          : "none",
                      }}
                    >
                      註冊
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* 手機版漢堡選單 */}
          {!isAuthPage && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
              aria-label="選單"
              aria-expanded={menuOpen}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-[18px] h-[1.5px] transition-all duration-300 origin-center"
                  style={{
                    background: scrolled
                      ? "var(--color-espresso)"
                      : "white",
                    ...(menuOpen && i === 0
                      ? { transform: "rotate(45deg) translateY(6.5px)" }
                      : {}),
                    ...(menuOpen && i === 1
                      ? { opacity: 0, transform: "scaleX(0)" }
                      : {}),
                    ...(menuOpen && i === 2
                      ? { transform: "rotate(-45deg) translateY(-6.5px)" }
                      : {}),
                  }}
                />
              ))}
            </button>
          )}
        </div>
      </div>

      {/* 手機版展開選單 */}
      {menuOpen && !isAuthPage && (
        <div
          className="pointer-events-auto md:hidden absolute top-16 left-4 right-4 rounded-2xl px-6 py-4 space-y-1 animate-slide-down"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--color-linen-dark)",
            boxShadow: "0 8px 30px rgba(30,15,8,0.1)",
          }}
          aria-live="polite"
        >
          <Link href="/" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/")}>
            首頁
          </Link>
          {user ? (
            <>
              <Link href="/order" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/order")}>
                訂購
              </Link>
              <Link href="/my-orders" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/my-orders")}>
                我的訂單
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/admin")}>
                  後台管理
                </Link>
              )}
              <div className="pt-2 border-t border-linen-dark">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2.5 text-espresso-light hover:text-rose transition-colors"
                >
                  登出
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-linen-dark flex gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-sm font-medium text-espresso-light border border-linen-dark hover:border-rose hover:text-rose transition-all"
              >
                登入
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold text-white bg-rose hover:bg-rose-dark transition-all"
              >
                註冊
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
