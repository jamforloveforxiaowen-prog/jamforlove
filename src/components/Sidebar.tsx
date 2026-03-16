"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface User { id: number; username: string; role: string; name: string }

// 圖示元件
function IconHome({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconOrder({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconMyOrders({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconAdmin({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconLogin({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconRegister({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconLogout({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconCollapse({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function IconExpand({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl transition-all duration-200 relative"
      style={{
        padding: collapsed ? "10px" : "10px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? "var(--color-rose-muted)" : "transparent",
        color: active ? "var(--color-rose)" : "var(--color-espresso-light)",
      }}
    >
      <span className="shrink-0 transition-colors duration-200 group-hover:text-rose" style={{ color: active ? "var(--color-rose)" : undefined }}>
        {icon}
      </span>
      {!collapsed && (
        <span
          className="text-[0.85rem] font-medium tracking-wide transition-colors duration-200 group-hover:text-rose whitespace-nowrap"
          style={{ color: active ? "var(--color-rose)" : undefined }}
        >
          {label}
        </span>
      )}
      {/* 縮排模式下的 tooltip */}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2.5 py-1 rounded-lg text-[0.8rem] font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50"
          style={{ background: "var(--color-espresso)" }}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // 讀取 localStorage 的縮排狀態
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const sidebarWidth = collapsed ? 72 : 220;

  const navContent = (
    <>
      {/* Logo 區域 */}
      <div className="flex items-center gap-3 mb-6" style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "0" : "0 4px" }}>
        <Image
          src="/logo.jpg"
          alt="Jam For Love"
          width={36}
          height={36}
          className="rounded-full shrink-0"
          style={{ boxShadow: "0 2px 8px rgba(30,15,8,0.1)" }}
        />
        {!collapsed && (
          <span className="text-[1rem] font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-espresso)" }}>
            Jam For Love
          </span>
        )}
      </div>

      {/* 分隔線 */}
      <div className="mb-4" style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-linen-dark), transparent)" }} />

      {/* 導覽連結 */}
      <nav className="flex flex-col gap-1 flex-1">
        <NavItem href="/" icon={<IconHome />} label="首頁" active={isActive("/")} collapsed={collapsed} onClick={() => setMobileOpen(false)} />

        {user && (
          <>
            <NavItem href="/order" icon={<IconOrder />} label="訂購" active={isActive("/order")} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
            <NavItem href="/my-orders" icon={<IconMyOrders />} label="我的訂單" active={isActive("/my-orders")} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
            {user.role === "admin" && (
              <NavItem href="/admin" icon={<IconAdmin />} label="後台管理" active={isActive("/admin")} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
            )}
          </>
        )}

        {!user && !isAuthPage && (
          <>
            <NavItem href="/login" icon={<IconLogin />} label="登入" active={isActive("/login")} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
            <NavItem href="/register" icon={<IconRegister />} label="註冊" active={isActive("/register")} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
          </>
        )}
      </nav>

      {/* 底部：使用者資訊 + 縮排按鈕 */}
      <div className="mt-auto pt-4">
        <div className="mb-3" style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-linen-dark), transparent)" }} />

        {user && (
          <div className="mb-3" style={{ padding: collapsed ? "0" : "0 4px" }}>
            {collapsed ? (
              <button
                onClick={handleLogout}
                className="group flex items-center justify-center w-full rounded-xl transition-all duration-200 relative"
                style={{ padding: "10px" }}
                title={`${user.name} — 登出`}
              >
                <IconLogout />
                <span className="absolute left-full ml-2 px-2.5 py-1 rounded-lg text-[0.8rem] font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50"
                  style={{ background: "var(--color-espresso)" }}
                >
                  {user.name} — 登出
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[0.8rem] truncate max-w-[100px]" style={{ color: "var(--color-espresso-light)" }} title={user.name}>
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[0.8rem] transition-colors duration-200 hover:text-rose"
                  style={{ color: "var(--color-espresso-light)" }}
                >
                  登出
                </button>
              </div>
            )}
          </div>
        )}

        {/* 縮排切換按鈕（僅桌面版顯示） */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center justify-center w-full rounded-xl transition-all duration-200 hover:bg-linen-dark/50"
          style={{ padding: "8px", color: "var(--color-espresso-light)" }}
          title={collapsed ? "展開側邊欄" : "縮排側邊欄"}
        >
          {collapsed ? <IconExpand size={18} /> : <IconCollapse size={18} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 桌面版側邊欄 */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-out"
        style={{
          width: sidebarWidth,
          padding: collapsed ? "20px 12px" : "20px 16px",
          background: "rgba(248,243,235,0.95)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          borderRight: "1px solid var(--color-linen-dark)",
          boxShadow: "4px 0 24px rgba(30,15,8,0.04)",
        }}
      >
        {navContent}
      </aside>

      {/* 桌面版佔位元素 */}
      <div className="hidden md:block shrink-0 transition-all duration-300" style={{ width: sidebarWidth }} />

      {/* 手機版頂部欄 */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4"
        style={{
          background: "rgba(248,243,235,0.95)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          borderBottom: "1px solid var(--color-linen-dark)",
        }}
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Jam For Love" width={28} height={28} className="rounded-full" />
          <span className="text-[0.9rem] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-espresso)" }}>
            Jam For Love
          </span>
        </div>
        {!isAuthPage && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full transition-colors duration-200"
            style={{ background: mobileOpen ? "var(--color-linen-dark)" : "transparent" }}
            aria-label="選單"
            aria-expanded={mobileOpen}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
                style={{
                  width: i === 1 && !mobileOpen ? 14 : 18,
                  background: "var(--color-espresso)",
                  ...(mobileOpen && i === 0 ? { transform: "rotate(45deg) translateY(6.5px)" } : {}),
                  ...(mobileOpen && i === 1 ? { opacity: 0, transform: "scaleX(0)" } : {}),
                  ...(mobileOpen && i === 2 ? { transform: "rotate(-45deg) translateY(-6.5px)" } : {}),
                }}
              />
            ))}
          </button>
        )}
      </div>

      {/* 手機版側邊欄 overlay */}
      {mobileOpen && !isAuthPage && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileOpen(false)} />
          <aside
            className="md:hidden fixed top-14 left-0 bottom-0 z-50 flex flex-col animate-slide-in-left"
            style={{
              width: 260,
              padding: "20px 16px",
              background: "rgba(248,243,235,0.98)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              borderRight: "1px solid var(--color-linen-dark)",
              boxShadow: "4px 0 24px rgba(30,15,8,0.08)",
            }}
          >
            <nav className="flex flex-col gap-1 flex-1">
              <NavItem href="/" icon={<IconHome />} label="首頁" active={isActive("/")} collapsed={false} onClick={() => setMobileOpen(false)} />
              {user && (
                <>
                  <NavItem href="/order" icon={<IconOrder />} label="訂購" active={isActive("/order")} collapsed={false} onClick={() => setMobileOpen(false)} />
                  <NavItem href="/my-orders" icon={<IconMyOrders />} label="我的訂單" active={isActive("/my-orders")} collapsed={false} onClick={() => setMobileOpen(false)} />
                  {user.role === "admin" && (
                    <NavItem href="/admin" icon={<IconAdmin />} label="後台管理" active={isActive("/admin")} collapsed={false} onClick={() => setMobileOpen(false)} />
                  )}
                </>
              )}
              {!user && !isAuthPage && (
                <>
                  <NavItem href="/login" icon={<IconLogin />} label="登入" active={isActive("/login")} collapsed={false} onClick={() => setMobileOpen(false)} />
                  <NavItem href="/register" icon={<IconRegister />} label="註冊" active={isActive("/register")} collapsed={false} onClick={() => setMobileOpen(false)} />
                </>
              )}
            </nav>

            {user && (
              <div className="mt-auto pt-4">
                <div className="mb-3" style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--color-linen-dark), transparent)" }} />
                <div className="flex items-center justify-between px-1">
                  <span className="text-[0.8rem] truncate max-w-[120px]" style={{ color: "var(--color-espresso-light)" }}>{user.name}</span>
                  <button onClick={handleLogout} className="text-[0.8rem] hover:text-rose transition-colors duration-200" style={{ color: "var(--color-espresso-light)" }}>登出</button>
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      {/* 手機版佔位元素 */}
      <div className="md:hidden h-14" />
    </>
  );
}
