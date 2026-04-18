"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch {
      setError("網路連線失敗，請稍後再試");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen -mt-14 pt-14 relative overflow-hidden flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(135deg, #1e0f08 0%, #2a1a10 50%, #3d2418 100%)",
      }}
    >
      {/* 裝飾光暈 */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 500,
          height: 500,
          background: "var(--color-honey)",
          filter: "blur(140px)",
          top: "-15%",
          left: "-10%",
        }}
      />
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: 400,
          height: 400,
          background: "var(--color-rose)",
          filter: "blur(120px)",
          bottom: "-10%",
          right: "-10%",
        }}
      />

      {/* 毛玻璃卡片 */}
      <div
        className="w-full max-w-sm animate-reveal-up relative z-10"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "1.5rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          padding: "2.5rem 2.25rem",
        }}
      >
        {/* 標題 */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, var(--color-honey), #b08428)",
              boxShadow: "0 8px 24px rgba(200,149,48,0.4)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-honey text-[0.6875rem] font-semibold tracking-[0.25em] uppercase mb-2">
            Admin Portal
          </p>
          <h1 className="font-serif text-2xl font-bold text-white mb-1.5">
            管理員登入
          </h1>
          <p className="text-white/40 text-[0.8125rem]">
            僅限授權管理者使用
          </p>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              管理員帳號
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white text-lg outline-none transition-all placeholder:text-white/25 focus:border-honey focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(200,149,48,0.2)]"
              autoFocus
              required
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              密碼
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 pr-12 text-white text-lg outline-none transition-all placeholder:text-white/25 focus:border-honey focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(200,149,48,0.2)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-rose-light text-sm font-medium animate-shake" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-espresso font-semibold text-[0.9375rem] rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
            style={{
              background: "linear-gradient(135deg, var(--color-honey), #b08428)",
              boxShadow: "0 8px 24px rgba(200,149,48,0.3)",
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-espresso/30 border-t-espresso rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
                登入中...
              </span>
            ) : "登入後台"}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-7">
          <Link
            href="/login"
            className="hover:text-white transition-colors"
          >
            ← 返回一般登入
          </Link>
        </p>
      </div>
    </div>
  );
}
