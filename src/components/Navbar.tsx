"use client";

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

  return (
    <nav className="border-b border-cream-dark bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="group/logo font-serif text-2xl font-bold text-warm-brown tracking-tight hover:text-berry transition-colors"
        >
          Jam For{" "}
          <span className="inline-block group-hover/logo:scale-110 transition-transform duration-200">
            Love
          </span>
        </Link>

        {/* 桌面版選單 */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-warm-brown-light hover:text-berry transition-colors"
          >
            首頁
          </Link>
          {user ? (
            <>
              <Link
                href="/order"
                className="text-warm-brown-light hover:text-berry transition-colors"
              >
                訂購
              </Link>
              <Link
                href="/my-orders"
                className="text-warm-brown-light hover:text-berry transition-colors"
              >
                我的訂單
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-warm-brown-light hover:text-berry transition-colors"
                >
                  後台管理
                </Link>
              )}
              <span className="text-warm-brown/60 text-xs">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-warm-brown-light hover:text-berry transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-warm-brown-light hover:text-berry transition-colors"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="bg-berry text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-berry-dark transition-colors"
              >
                註冊
              </Link>
            </>
          )}
        </div>

        {/* 手機版漢堡選單 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5"
          aria-label="選單"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-5 h-0.5 bg-warm-brown transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-warm-brown transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-warm-brown transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* 手機版展開選單 */}
      {menuOpen && (
        <div className="md:hidden border-t border-cream-dark bg-cream px-5 py-3 space-y-1 animate-slide-down">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
          >
            首頁
          </Link>
          {user ? (
            <>
              <Link
                href="/order"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
              >
                訂購
              </Link>
              <Link
                href="/my-orders"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
              >
                我的訂單
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
                >
                  後台管理
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
              >
                登入
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-warm-brown-light hover:text-berry transition-colors font-medium"
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
