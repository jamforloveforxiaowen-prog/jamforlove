"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  name: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLink =
    "text-espresso-light hover:text-rose transition-colors duration-200";

  return (
    <nav className="sticky top-0 z-50 bg-linen/85 backdrop-blur-md border-b border-linen-dark/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.jpg"
            alt="Jam For Love"
            width={36}
            height={36}
            className="rounded-full group-hover:scale-105 transition-transform duration-300"
          />
          <span
            className="text-xl tracking-tight text-espresso group-hover:text-rose transition-colors duration-200"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Jam For Love
          </span>
        </Link>

        {/* 桌面版選單 */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/" className={navLink}>
            首頁
          </Link>
          {user ? (
            <>
              <Link href="/order" className={navLink}>
                訂購
              </Link>
              <Link href="/my-orders" className={navLink}>
                我的訂單
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className={navLink}>
                  後台管理
                </Link>
              )}
              <span className="text-espresso-light/40 text-xs">
                {user.name}
              </span>
              <button onClick={handleLogout} className={navLink}>
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>
                登入
              </Link>
              <Link
                href="/register"
                className="btn-primary !py-2 !px-5 !text-xs"
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
            className={`block w-[18px] h-[1.5px] bg-espresso transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-espresso transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-espresso transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* 手機版展開選單 */}
      {menuOpen && (
        <div className="md:hidden border-t border-linen-dark/40 bg-linen px-6 py-4 space-y-1 animate-slide-down">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
          >
            首頁
          </Link>
          {user ? (
            <>
              <Link
                href="/order"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
              >
                訂購
              </Link>
              <Link
                href="/my-orders"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
              >
                我的訂單
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
                >
                  後台管理
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
              >
                登入
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-espresso-light hover:text-rose transition-colors"
              >
                註冊
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
