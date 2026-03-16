"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface User { id: number; username: string; role: string; name: string }

function Dot({ scrolled }: { scrolled: boolean }) {
  return (
    <span
      className="inline-block w-[3px] h-[3px] rounded-full mx-1 opacity-30 transition-colors duration-300"
      style={{ background: scrolled ? "var(--color-espresso-light)" : "white" }}
    />
  );
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

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 60), []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const s = scrolled; // 縮短變數名方便使用

  function navLinkClass(href: string) {
    const base = "relative px-1.5 py-1 text-[0.85rem] tracking-wide font-medium transition-all duration-300 hover:-translate-y-px";
    if (isActive(href)) return s ? `${base} text-rose` : `${base} text-white`;
    return s ? `${base} text-espresso-light hover:text-rose` : `${base} text-white/70 hover:text-white`;
  }

  function mobileLinkClass(href: string) {
    const base = "block py-3 px-2 text-[0.95rem] tracking-wide transition-all duration-200";
    return isActive(href) ? `${base} text-rose font-semibold` : `${base} text-espresso-light hover:text-rose hover:pl-3`;
  }

  const close = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end pt-4 px-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full transition-all duration-500 ease-out"
        style={{
          maxWidth: s ? 500 : 560,
          borderRadius: 9999,
          background: s ? "rgba(248,243,235,0.92)" : "rgba(30,15,8,0.18)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          border: s ? "1px solid rgba(235,226,212,0.8)" : "1px solid rgba(255,255,255,0.12)",
          boxShadow: s ? "0 8px 32px rgba(30,15,8,0.08), 0 1px 2px rgba(30,15,8,0.04)" : "0 4px 24px rgba(0,0,0,0.06)",
          padding: "0 14px",
        }}
      >
        <div className="h-[44px] flex items-center justify-center relative">
          {/* 桌面版導航 — 置中 */}
          <div className="hidden md:flex items-center gap-0.5">
            {isAuthPage ? (
              <Link href="/" className={navLinkClass("/")}>首頁</Link>
            ) : (
              <>
                <Link href="/" className={navLinkClass("/")}>首頁</Link>
                {user && (
                  <>
                    <Dot scrolled={s} />
                    <Link href="/order" className={navLinkClass("/order")}>訂購</Link>
                    <Link href="/my-orders" className={navLinkClass("/my-orders")}>我的訂單</Link>
                    {user.role === "admin" && (
                      <>
                        <Dot scrolled={s} />
                        <Link href="/admin" className={navLinkClass("/admin")}>後台管理</Link>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* 右側操作區 — 絕對定位靠右 */}
          <div className="hidden md:flex items-center gap-1 absolute right-0 pr-4">
            {!isAuthPage && (
              <>
                {user ? (
                  <>
                    <span
                      className="px-3 py-1 text-[0.8rem] max-w-[100px] truncate transition-colors duration-300"
                      style={{ color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.6)" }}
                      title={user.name}
                    >
                      {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-1.5 rounded-full text-[0.8rem] font-medium transition-all duration-300 hover:-translate-y-px"
                      style={{
                        border: s ? "1px solid var(--color-linen-dark)" : "1px solid rgba(255,255,255,0.2)",
                        color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.75)",
                      }}
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-1.5 rounded-full text-[0.8rem] font-medium transition-all duration-300 hover:-translate-y-px"
                      style={{ color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.75)" }}
                    >
                      登入
                    </Link>
                    <Link
                      href="/register"
                      className="px-5 py-1.5 rounded-full text-[0.8rem] font-semibold transition-all duration-300 hover:-translate-y-px"
                      style={{
                        background: s ? "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))" : "rgba(255,255,255,0.15)",
                        color: "white",
                        border: s ? "none" : "1px solid rgba(255,255,255,0.2)",
                        boxShadow: s ? "0 4px 16px rgba(196,80,106,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                        letterSpacing: "0.04em",
                      }}
                    >
                      註冊
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* 手機版漢堡按鈕 */}
          {!isAuthPage && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full transition-colors duration-200"
              style={{ background: menuOpen ? (s ? "var(--color-linen-dark)" : "rgba(255,255,255,0.15)") : "transparent" }}
              aria-label="選單"
              aria-expanded={menuOpen}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
                  style={{
                    width: i === 1 && !menuOpen ? 14 : 18,
                    background: s ? "var(--color-espresso)" : "white",
                    ...(menuOpen && i === 0 ? { transform: "rotate(45deg) translateY(6.5px)" } : {}),
                    ...(menuOpen && i === 1 ? { opacity: 0, transform: "scaleX(0)" } : {}),
                    ...(menuOpen && i === 2 ? { transform: "rotate(-45deg) translateY(-6.5px)" } : {}),
                  }}
                />
              ))}
            </button>
          )}
        </div>
      </div>

      {/* 手機版浮動面板 */}
      {menuOpen && !isAuthPage && (
        <div
          className="pointer-events-auto md:hidden absolute top-[72px] right-4 rounded-2xl animate-slide-down"
          style={{
            width: "min(280px, calc(100vw - 32px))",
            background: "rgba(248,243,235,0.96)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid rgba(235,226,212,0.8)",
            boxShadow: "0 12px 40px rgba(30,15,8,0.12), 0 2px 6px rgba(30,15,8,0.04)",
            padding: "20px 24px",
          }}
          aria-live="polite"
        >
          <div className="space-y-0.5">
            <Link href="/" onClick={close} className={mobileLinkClass("/")}>首頁</Link>
            {user && (
              <>
                <Link href="/order" onClick={close} className={mobileLinkClass("/order")}>訂購</Link>
                <Link href="/my-orders" onClick={close} className={mobileLinkClass("/my-orders")}>我的訂單</Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={close} className={mobileLinkClass("/admin")}>後台管理</Link>
                )}
              </>
            )}
          </div>
          <div className="my-4" style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-linen-dark), transparent)" }} />
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-[0.85rem] text-espresso-light truncate max-w-[120px]">{user.name}</span>
              <button onClick={handleLogout} className="text-[0.85rem] text-espresso-light hover:text-rose transition-colors duration-200">登出</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" onClick={close} className="flex-1 text-center py-2.5 rounded-full text-[0.85rem] font-medium text-espresso-light transition-all duration-200" style={{ border: "1px solid var(--color-linen-dark)" }}>
                登入
              </Link>
              <Link href="/register" onClick={close} className="flex-1 text-center py-2.5 rounded-full text-[0.85rem] font-semibold text-white transition-all duration-200" style={{ background: "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))", boxShadow: "0 4px 12px rgba(196,80,106,0.25)" }}>
                註冊
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
