"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* 左側品牌區 — 桌面版 */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end"
        style={{ background: "var(--color-rose)" }}
      >
        {/* 紋理疊加 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* 底部品牌內容 */}
        <div
          className="relative z-10 px-12 xl:px-16 pb-16 w-full auth-stagger"
        >
          <p
            className="text-white/50 text-[0.6875rem] font-semibold tracking-[0.3em] uppercase mb-4 auth-stagger-item"
          >
            Handmade with Love
          </p>
          <h2
            className="text-white leading-[1.05] mb-6 auth-stagger-item"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(3rem, 5vw, 4.5rem)",
            }}
          >
            Jam
            <br />
            For Love
          </h2>
          <div
            className="w-12 h-[2px] mb-6 auth-stagger-item"
            style={{ background: "rgba(255,255,255,0.3)" }}
          />
          <p className="text-white/60 text-[0.9375rem] leading-relaxed max-w-xs auth-stagger-item">
            嚴選當季新鮮水果，不加人工色素與防腐劑，每一口都是自然的甜蜜。
          </p>
        </div>
      </div>

      {/* 右側登入表單 */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-16"
        style={{ background: "var(--color-linen)" }}
      >
        <div className="w-full max-w-sm auth-stagger">
          {/* 手機版品牌 */}
          <div className="lg:hidden mb-10 auth-stagger-item">
            <span
              className="text-rose text-xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontStyle: "italic",
              }}
            >
              Jam For Love
            </span>
          </div>

          {/* 標題 */}
          <div className="mb-10 auth-stagger-item">
            <h1
              className="font-serif text-espresso mb-2"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}
            >
              歡迎回來
            </h1>
            <p className="text-espresso-light/50 text-[0.875rem]">
              登入以查看訂單或訂購果醬
            </p>
          </div>

          {/* 表單 */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="auth-stagger-item">
                <label
                  htmlFor="login-username"
                  className="block text-[0.8125rem] font-medium text-espresso-light mb-2"
                >
                  帳號
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-b-[1.5px] border-linen-dark bg-transparent px-0 py-3 text-espresso text-[0.9375rem] outline-none transition-all placeholder:text-espresso-light/25 focus:border-rose"
                  required
                />
              </div>
              <div className="auth-stagger-item">
                <label
                  htmlFor="login-password"
                  className="block text-[0.8125rem] font-medium text-espresso-light mb-2"
                >
                  密碼
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-[1.5px] border-linen-dark bg-transparent px-0 py-3 text-espresso text-[0.9375rem] outline-none transition-all placeholder:text-espresso-light/25 focus:border-rose"
                  required
                />
                <div className="mt-2.5 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-[0.75rem] text-espresso-light/35 hover:text-rose transition-colors"
                  >
                    忘記密碼？
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-rose text-sm font-medium mt-4 animate-shake" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-stagger-item w-full mt-8 py-3.5 bg-espresso text-linen font-semibold text-[0.9375rem] rounded-lg transition-all hover:bg-espresso-light active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-linen/30 border-t-linen rounded-full animate-spin"
                    style={{ animationDuration: "0.8s" }}
                  />
                  登入中...
                </span>
              ) : (
                "登入"
              )}
            </button>
          </form>

          <p className="text-[0.8125rem] text-espresso-light/40 mt-8 auth-stagger-item">
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
