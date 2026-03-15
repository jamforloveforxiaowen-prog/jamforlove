"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

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
    return isActive(href)
      ? "bg-white/20 text-white px-4 py-1.5 rounded-full font-medium"
      : "text-white/70 hover:text-white px-4 py-1.5 rounded-full transition-colors duration-200";
  }

  function mobileLinkClass(href: string) {
    return isActive(href)
      ? "block py-2.5 text-white font-medium"
      : "block py-2.5 text-white/70 hover:text-white transition-colors";
  }

  return (
    <nav className="sticky top-0 z-50 bg-rose">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.jpg"
            alt="Jam For Love"
            width={30}
            height={30}
            className="rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200"
          />
          <span
            className="text-lg text-white"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Jam For Love
          </span>
        </Link>

        {/* 桌面版選單 */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className={navLinkClass("/")}>
            首頁
          </Link>
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
              <span className="w-px h-4 bg-white/20 mx-2" />
              <span className="text-white/70 px-4 py-1.5 rounded-full max-w-[120px] truncate" title={user.name}>{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white px-4 py-1.5 rounded-full transition-colors duration-200"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <span className="w-px h-4 bg-white/20 mx-2" />
              <Link
                href="/login"
                className="text-white/70 hover:text-white px-3 py-1.5 rounded-full transition-colors duration-200"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="bg-white/15 hover:bg-white/25 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 backdrop-blur-sm"
              >
                註冊
              </Link>
            </>
          )}
        </div>

        {/* 手機版漢堡選單 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
          aria-label="選單"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-[18px] h-[1.5px] bg-white transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-white transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* 手機版展開選單 */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-rose px-6 py-4 space-y-1 animate-slide-down" aria-live="polite">
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
              <button
                onClick={handleLogout}
                className="block py-2.5 text-white/70 hover:text-white transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/login")}>
                登入
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/register")}>
                註冊
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
