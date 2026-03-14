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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-amber-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wide">
          JamForLove
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-amber-200 transition">
            首頁
          </Link>
          {user ? (
            <>
              <Link
                href="/order"
                className="hover:text-amber-200 transition"
              >
                訂購
              </Link>
              <Link
                href="/my-orders"
                className="hover:text-amber-200 transition"
              >
                我的訂單
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hover:text-amber-200 transition"
                >
                  後台管理
                </Link>
              )}
              <span className="text-amber-200">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-500 transition"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-amber-200 transition"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-500 transition"
              >
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
