"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
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
      const res = await fetch("/api/auth/login", {
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
    // 管理員直接進後台，一般用戶進首頁
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    router.push(meData.user?.role === "admin" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen -mt-14 pt-14 relative overflow-hidden flex"
      style={{
        background:
          "linear-gradient(135deg, var(--color-linen) 0%, var(--color-parchment) 30%, var(--color-rose-light) 60%, var(--color-rose) 100%)",
      }}
    >
      {/* 全螢幕漸層光球裝飾 — 散佈整個背景 */}
      <div
        className="absolute rounded-full opacity-40"
        style={{
          width: 500,
          height: 500,
          background: "var(--color-rose)",
          filter: "blur(120px)",
          top: "-12%",
          left: "-8%",
        }}
      />
      <div
        className="absolute rounded-full opacity-25"
        style={{
          width: 350,
          height: 350,
          background: "var(--color-honey)",
          filter: "blur(90px)",
          top: "15%",
          right: "5%",
        }}
      />
      <div
        className="absolute rounded-full opacity-25"
        style={{
          width: 400,
          height: 400,
          background: "var(--color-sage)",
          filter: "blur(100px)",
          bottom: "-5%",
          left: "20%",
        }}
      />
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 300,
          height: 300,
          background: "var(--color-rose-dark)",
          filter: "blur(80px)",
          bottom: "10%",
          right: "-5%",
        }}
      />
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: 200,
          height: 200,
          background: "var(--color-linen)",
          filter: "blur(60px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* 左側品牌宣言 — 桌面版，垂直水平置中 */}
      <div className="hidden lg:flex lg:w-[48%] items-center justify-center relative z-10">
        <div className="animate-reveal-up text-center px-12 xl:px-16 max-w-lg">
          {/* 大文案 */}
          <h2
            className="font-serif text-espresso leading-[1.15] mb-6"
            style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
          >
            用<span className="text-rose-dark">愛</span>手工熬煮
            <br />
            每一瓶果醬
          </h2>
          <p className="text-espresso-light/60 text-base leading-relaxed max-w-sm mx-auto mb-10">
            嚴選當季新鮮水果，不加人工色素與防腐劑，每一口都是自然的甜蜜。
          </p>

          {/* 版權 */}
          <p className="text-espresso-light/30 text-xs">
            &copy; 2025 Jam For Love
          </p>
        </div>
      </div>

      {/* 右側（或居中）登入表單 — 毛玻璃卡片 */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div
          className="w-full max-w-sm animate-reveal-up"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.45)",
            borderRadius: "1.5rem",
            boxShadow:
              "0 8px 48px rgba(30, 15, 8, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
            padding: "2.5rem 2.25rem",
          }}
        >
          {/* 手機版 Logo */}
          <div className="lg:hidden text-center mb-6">
            <span
              className="text-rose text-2xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontStyle: "italic",
              }}
            >
              Jam For Love
            </span>
            <p className="text-espresso-light/40 text-[0.6875rem] tracking-[0.2em] uppercase mt-1">
              Handmade with Love
            </p>
          </div>

          {/* 標題區 */}
          <div className="mb-8">
            <p className="text-rose text-[0.6875rem] font-semibold tracking-[0.2em] uppercase mb-2">
              帳號登入
            </p>
            <h1 className="font-serif text-2xl font-bold text-espresso mb-1.5">
              歡迎回來
            </h1>
            <p className="text-espresso-light/50 text-[0.8125rem]">
              登入以查看訂單或訂購果醬
            </p>
          </div>

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-espresso mb-2"
              >
                帳號
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3.5 text-espresso text-[0.9375rem] outline-none transition-all placeholder:text-espresso-light/30 focus:border-rose focus:bg-white/80 focus:shadow-[0_0_0_3px_var(--color-rose-muted)]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-espresso mb-2"
              >
                密碼
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3.5 pr-12 text-espresso text-[0.9375rem] outline-none transition-all placeholder:text-espresso-light/30 focus:border-rose focus:bg-white/80 focus:shadow-[0_0_0_3px_var(--color-rose-muted)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-espresso-light/40 hover:text-espresso transition-colors"
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
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-espresso-light/40 hover:text-rose transition-colors"
                >
                  忘記密碼？
                </Link>
              </div>
            </div>
            {error && (
              <p className="text-rose text-sm font-medium animate-shake" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose text-white font-semibold text-[0.9375rem] rounded-xl transition-all hover:bg-rose-dark hover:shadow-[0_4px_20px_rgba(196,80,106,0.3)] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
                  登入中...
                </span>
              ) : "登入"}
            </button>
          </form>

          <p className="text-center text-sm text-espresso-light/50 mt-7">
            還沒有帳號？{" "}
            <Link
              href="/register"
              className="text-rose font-medium hover:text-rose-dark transition-colors"
            >
              註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
