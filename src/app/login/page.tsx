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
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* 左側品牌宣言 — 不對稱佈局 + 毛玻璃裝飾 */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-linen">
        {/* 毛玻璃漸層光球 */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: 420,
            height: 420,
            background: "var(--color-rose)",
            filter: "blur(100px)",
            top: "-8%",
            left: "-5%",
          }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: "var(--color-sage)",
            filter: "blur(80px)",
            bottom: "5%",
            right: "0%",
          }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: 200,
            height: 200,
            background: "var(--color-honey)",
            filter: "blur(70px)",
            top: "45%",
            left: "55%",
          }}
        />

        {/* 品牌內容 */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* 頂部 Logo */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose" />
            <span
              className="text-espresso-light text-base"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontStyle: "italic",
              }}
            >
              Jam For Love
            </span>
          </div>

          {/* 中間大文案 */}
          <div className="animate-reveal-up">
            <h2 className="font-serif text-espresso leading-[1.15] mb-6"
              style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
            >
              用<span className="text-rose">愛</span>手工熬煮
              <br />
              每一瓶果醬
            </h2>
            <p className="text-espresso-light/50 text-base leading-relaxed max-w-sm">
              嚴選當季新鮮水果，不加人工色素與防腐劑，每一口都是自然的甜蜜。
            </p>
          </div>

          {/* 底部版權 */}
          <p className="text-espresso-light/30 text-xs">
            &copy; 2025 Jam For Love
          </p>
        </div>
      </div>

      {/* 右側登入表單 — 毛玻璃卡片 */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
        {/* 背景漸層 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, var(--color-linen) 0%, var(--color-parchment) 40%, var(--color-linen-dark) 100%)",
          }}
        />
        {/* 右側裝飾光球 */}
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: 280,
            height: 280,
            background: "var(--color-rose)",
            filter: "blur(80px)",
            bottom: "-10%",
            right: "-5%",
          }}
        />

        {/* 毛玻璃表單卡片 */}
        <div
          className="relative z-10 w-full max-w-sm animate-reveal-up"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "1.25rem",
            boxShadow: "0 8px 48px rgba(30, 15, 8, 0.06)",
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
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3.5 text-espresso text-[0.9375rem] outline-none transition-all placeholder:text-espresso-light/30 focus:border-rose focus:bg-white/80 focus:shadow-[0_0_0_3px_var(--color-rose-muted)]"
                required
              />
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
              <p className="text-rose text-sm font-medium" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose text-white font-semibold text-[0.9375rem] rounded-xl transition-all hover:bg-rose-dark hover:shadow-[0_4px_20px_rgba(196,80,106,0.3)] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? "登入中..." : "登入"}
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
