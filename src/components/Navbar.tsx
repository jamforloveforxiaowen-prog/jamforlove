"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import DynamicIsland from "./DynamicIsland";

interface User { id: number; username: string; role: string; name: string }

/** 購物車徽章 - 數量變化時彈跳 */
function CartBadge({ count }: { count: number }) {
  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current && count > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400);
      prevCount.current = count;
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  if (count <= 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose text-white text-[10px] font-bold flex items-center justify-center leading-none ${
        animate ? "animate-pulse-badge" : ""
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Dot() {
  return (
    <span
      className="inline-block w-[3px] h-[3px] rounded-full mx-2 opacity-25"
      style={{ background: "var(--color-espresso-light)" }}
    />
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalCount } = useCart();
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
  function navLinkClass(href: string, filled = false) {
    const base = "relative px-3 py-1 text-[0.8rem] tracking-wide rounded-full transition-all duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50";
    if (filled) {
      return `${base} font-semibold`;
    }
    if (isActive(href)) return `${base} text-rose bg-rose/10 font-medium`;
    return `${base} text-espresso-light hover:text-rose hover:bg-rose/10 active:text-rose-dark font-medium`;
  }

  // 當前頁面填色膠囊的 inline style — 玫瑰色
  const activeCTAStyle = {
    background: "var(--color-rose)",
    color: "white",
    border: "none",
    boxShadow: "0 3px 12px rgba(196,80,106,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
    letterSpacing: "0.03em",
  };

  function mobileLinkClass(href: string) {
    const base = "block py-2.5 px-2 text-[0.9rem] tracking-wide transition-colors duration-250 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50";
    return isActive(href) ? `${base} text-rose font-semibold` : `${base} text-espresso-light hover:text-rose active:text-rose-dark`;
  }

  const close = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-start gap-2 pt-3 pointer-events-none max-w-6xl mx-auto px-6">
      {/* 左側：動態島 */}
      <DynamicIsland />

      {/* 右側：導覽列（ml-auto 確保永遠靠右）*/}
      <div
        className="pointer-events-auto ml-auto transition-all duration-500 ease-out"
        style={{
          width: "fit-content",
          borderRadius: 9999,
          background: "rgba(248,243,235,0.92)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          border: "1px solid rgba(235,226,212,0.8)",
          boxShadow: s ? "0 6px 24px rgba(30,15,8,0.06), 0 1px 2px rgba(30,15,8,0.03)" : "0 4px 20px rgba(0,0,0,0.03)",
          padding: "0 14px",
        }}
      >
        <div className="h-[40px] flex items-center justify-center">
          {/* 手機版 auth 頁面：顯示首頁連結 */}
          {isAuthPage && (
            <Link href="/" className={`md:hidden ${navLinkClass("/", true)}`} style={activeCTAStyle}>首頁</Link>
          )}
          {/* 導航連結 */}
          <div className="hidden md:flex items-center gap-0">
            {isAuthPage ? (
              <Link href="/" className={navLinkClass("/", true)} style={activeCTAStyle}>首頁</Link>
            ) : (
              <>
                <Link
                  href="/"
                  className={navLinkClass("/", isActive("/"))}
                  style={isActive("/") ? activeCTAStyle : undefined}
                >首頁</Link>
                <Dot />
                <Link
                  href="/story"
                  className={navLinkClass("/story", isActive("/story"))}
                  style={isActive("/story") ? activeCTAStyle : undefined}
                >果醬的故事</Link>
                {user && (
                  <>
                    <Dot />
                    <Link
                      href="/order"
                      className={navLinkClass("/order", isActive("/order"))}
                      style={isActive("/order") ? activeCTAStyle : undefined}
                    >訂購</Link>
                    <Link
                      href="/my-orders"
                      className={navLinkClass("/my-orders", isActive("/my-orders"))}
                      style={isActive("/my-orders") ? activeCTAStyle : undefined}
                    >我的訂單</Link>
                    {user.role === "admin" && (
                      <>
                        <Dot />
                        <Link
                          href="/admin"
                          className={navLinkClass("/admin", isActive("/admin"))}
                          style={isActive("/admin") ? activeCTAStyle : undefined}
                        >後台管理</Link>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* 操作區 */}
          <div className="hidden md:flex items-center gap-0.5 ml-0.5">
            {!isAuthPage && (
              <>
                {user ? (
                  <>
                    <Dot />
                    <span
                      className="px-2 py-1 text-[0.8rem] max-w-[80px] truncate"
                      style={{ color: "var(--color-espresso-light)" }}
                      title={user.name}
                    >
                      {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-2.5 py-1 rounded-full text-[0.8rem] font-medium transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
                      style={{
                        border: "1px solid var(--color-linen-dark)",
                        color: "var(--color-espresso-light)",
                      }}
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <>
                    <Dot />
                    <Link
                      href="/login"
                      className="px-2.5 py-1 rounded-full text-[0.8rem] font-medium transition-all duration-250 text-espresso-light hover:text-rose hover:bg-rose/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
                    >
                      登入
                    </Link>
                    <Link
                      href="/register"
                      className="px-2.5 py-1 rounded-full text-[0.8rem] font-medium transition-all duration-250 text-espresso-light hover:text-rose hover:bg-rose/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50"
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
              style={{ background: menuOpen ? "var(--color-linen-dark)" : "transparent" }}
              aria-label="選單"
              aria-expanded={menuOpen}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-[1.5px] rounded-full transition-all duration-250 origin-center"
                  style={{
                    width: i === 1 && !menuOpen ? 12 : 16,
                    background: "var(--color-espresso)",
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

      {/* 獨立購物車按鈕 — 登入後才顯示 */}
      {user && !isAuthPage && (
        <Link
          href="/order"
          className="pointer-events-auto relative flex items-center justify-center w-[40px] h-[40px] rounded-full transition-all duration-500 ease-out"
          style={{
            background: "rgba(248,243,235,0.92)",
            backdropFilter: "blur(16px) saturate(1.4)",
            WebkitBackdropFilter: "blur(16px) saturate(1.4)",
            border: "1px solid rgba(235,226,212,0.8)",
            boxShadow: s ? "0 6px 24px rgba(30,15,8,0.06), 0 1px 2px rgba(30,15,8,0.03)" : "0 4px 20px rgba(0,0,0,0.03)",
          }}
          aria-label={`購物車，${totalCount} 件商品`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-espresso-light)" }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <CartBadge count={totalCount} />
        </Link>
      )}

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
            {[
              { href: "/", label: "首頁" },
              { href: "/story", label: "果醬的故事" },
              ...(user ? [
                { href: "/order", label: "訂購" },
                { href: "/my-orders", label: "我的訂單" },
                ...(user.role === "admin" ? [{ href: "/admin", label: "後台管理" }] : []),
              ] : []),
            ].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`${mobileLinkClass(link.href)} animate-reveal-up`}
                style={{ animationDelay: `${0.05 + i * 0.04}s` }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="my-3" style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-linen-dark), transparent)" }} />
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-[0.8rem] text-espresso-light truncate max-w-[110px]">{user.name}</span>
              <button onClick={handleLogout} className="text-[0.8rem] text-espresso-light hover:text-rose active:text-rose-dark transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/50 rounded">登出</button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <Link href="/login" onClick={close} className={mobileLinkClass("/login")}>
                登入
              </Link>
              <Link href="/register" onClick={close} className={mobileLinkClass("/register")}>
                註冊
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
