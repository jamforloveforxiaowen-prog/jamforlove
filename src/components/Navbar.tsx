"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface User { id: number; username: string; role: string; name: string }

function Dot({ scrolled }: { scrolled: boolean }) {
  return (
    <span
      className="inline-block w-[3px] h-[3px] rounded-full mx-0.5 opacity-25 transition-colors duration-250"
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

  const s = scrolled;

  // 統一字型大小 0.8rem，統一 duration-250
  // 首頁（未登入時）：填色膠囊 CTA；其餘：透明膠囊外框
  function navLinkClass(href: string, filled = false) {
    const base = "relative px-3 py-1 text-[0.8rem] tracking-wide rounded-full transition-all duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50";
    if (filled) {
      return `${base} font-semibold`;
    }
    const capsule = s ? "border border-espresso-light/15" : "border border-white/18";
    if (isActive(href)) return s ? `${base} ${capsule} text-rose font-medium` : `${base} ${capsule} text-white font-medium`;
    return s ? `${base} ${capsule} text-espresso-light hover:text-rose active:text-rose-dark font-medium` : `${base} ${capsule} text-white/70 hover:text-white active:text-white font-medium`;
  }

  // 首頁填色膠囊的 inline style
  const homeCTAStyle = {
    background: s ? "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))" : "rgba(255,255,255,0.15)",
    color: "white",
    border: s ? "none" : "1px solid rgba(255,255,255,0.18)",
    boxShadow: s ? "0 3px 12px rgba(196,80,106,0.25), inset 0 1px 0 rgba(255,255,255,0.12)" : "none",
    letterSpacing: "0.03em",
  };

  function mobileLinkClass(href: string) {
    const base = "block py-2.5 px-2 text-[0.9rem] tracking-wide transition-colors duration-250 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50";
    return isActive(href) ? `${base} text-rose font-semibold` : `${base} text-espresso-light hover:text-rose active:text-rose-dark`;
  }

  const close = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end pt-3 pointer-events-none max-w-6xl mx-auto px-6">
      <div
        className="pointer-events-auto transition-all duration-500 ease-out"
        style={{
          width: "fit-content",
          borderRadius: 9999,
          background: s ? "rgba(248,243,235,0.92)" : "rgba(30,15,8,0.18)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          border: s ? "1px solid rgba(235,226,212,0.8)" : "1px solid rgba(255,255,255,0.12)",
          boxShadow: s ? "0 6px 24px rgba(30,15,8,0.06), 0 1px 2px rgba(30,15,8,0.03)" : "0 4px 20px rgba(0,0,0,0.05)",
          padding: "0 14px",
        }}
      >
        <div className="h-[40px] flex items-center justify-center">
          {/* 導航連結 */}
          <div className="hidden md:flex items-center gap-0">
            {isAuthPage ? (
              <Link href="/" className={navLinkClass("/", true)} style={homeCTAStyle}>首頁</Link>
            ) : (
              <>
                {user ? (
                  <Link href="/" className={navLinkClass("/")}>首頁</Link>
                ) : (
                  <Link href="/" className={navLinkClass("/", true)} style={homeCTAStyle}>首頁</Link>
                )}
                <Dot scrolled={s} />
                <Link href="/news" className={navLinkClass("/news")}>最新消息</Link>
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

          {/* 操作區 — 用分隔點連接 */}
          <div className="hidden md:flex items-center gap-0.5 ml-0.5">
            {!isAuthPage && (
              <>
                {!user && <Dot scrolled={s} />}
                {user ? (
                  <>
                    <Dot scrolled={s} />
                    <span
                      className="px-2 py-1 text-[0.8rem] max-w-[80px] truncate transition-colors duration-250"
                      style={{ color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.55)" }}
                      title={user.name}
                    >
                      {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-2.5 py-1 rounded-full text-[0.8rem] font-medium transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
                      style={{
                        border: s ? "1px solid var(--color-linen-dark)" : "1px solid rgba(255,255,255,0.18)",
                        color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-2.5 py-1 rounded-full text-[0.8rem] font-medium transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
                      style={{ color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.7)" }}
                    >
                      登入
                    </Link>
                    <Link
                      href="/register"
                      className="px-2.5 py-1 rounded-full text-[0.8rem] font-medium transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
                      style={{ color: s ? "var(--color-espresso-light)" : "rgba(255,255,255,0.7)" }}
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
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[4px] rounded-full transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
              style={{ background: menuOpen ? (s ? "var(--color-linen-dark)" : "rgba(255,255,255,0.15)") : "transparent" }}
              aria-label="選單"
              aria-expanded={menuOpen}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-[1.5px] rounded-full transition-all duration-250 origin-center"
                  style={{
                    width: i === 1 && !menuOpen ? 12 : 16,
                    background: s ? "var(--color-espresso)" : "white",
                    ...(menuOpen && i === 0 ? { transform: "rotate(45deg) translateY(5.5px)" } : {}),
                    ...(menuOpen && i === 1 ? { opacity: 0, transform: "scaleX(0)" } : {}),
                    ...(menuOpen && i === 2 ? { transform: "rotate(-45deg) translateY(-5.5px)" } : {}),
                  }}
                />
              ))}
            </button>
          )}
        </div>
      </div>

      {/* 手機版浮動面板 — 修正 top 為實際高度 */}
      {menuOpen && !isAuthPage && (
        <div
          className="pointer-events-auto md:hidden absolute top-[56px] right-4 rounded-2xl animate-slide-down"
          style={{
            width: "min(260px, calc(100vw - 32px))",
            background: "rgba(248,243,235,0.96)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid rgba(235,226,212,0.8)",
            boxShadow: "0 10px 32px rgba(30,15,8,0.1), 0 2px 4px rgba(30,15,8,0.03)",
            padding: "16px 20px",
          }}
          aria-live="polite"
        >
          <div className="space-y-0.5">
            <Link href="/" onClick={close} className={mobileLinkClass("/")}>首頁</Link>
            <Link href="/news" onClick={close} className={mobileLinkClass("/news")}>最新消息</Link>
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
          <div className="my-3" style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-linen-dark), transparent)" }} />
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-[0.8rem] text-espresso-light truncate max-w-[110px]">{user.name}</span>
              <button onClick={handleLogout} className="text-[0.8rem] text-espresso-light hover:text-rose active:text-rose-dark transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50 rounded">登出</button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <Link href="/login" onClick={close} className="flex-1 text-center py-2 rounded-full text-[0.8rem] font-medium text-espresso-light transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50" style={{ border: "1px solid var(--color-linen-dark)" }}>
                登入
              </Link>
              <Link href="/register" onClick={close} className="flex-1 text-center py-2 rounded-full text-[0.8rem] font-semibold text-white transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50" style={{ background: "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))", boxShadow: "0 3px 10px rgba(196,80,106,0.2)" }}>
                註冊
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
