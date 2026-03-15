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
      {/* 左側裝飾 — 只在桌面顯示 */}
      <div className="hidden lg:flex lg:w-[45%] bg-rose items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, white 0%, transparent 50%), radial-gradient(circle at 70% 70%, white 0%, transparent 40%)",
            }}
          />
        </div>
        <div className="relative text-center px-12">
          <h2
            className="text-white leading-[0.9] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(3rem, 5vw, 5rem)",
            }}
          >
            Jam
            <br />
            For Love
          </h2>
          <p className="text-white/70 text-sm tracking-[0.2em] uppercase">
            Handmade with Love
          </p>
        </div>
      </div>

      {/* 右側表單 */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-reveal-up">
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
              歡迎回來
            </h1>
            <p className="text-espresso-light/60 text-sm">
              登入以查看訂單或訂購果醬
            </p>
          </div>

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
                className="input-field"
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
                className="input-field"
                required
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-espresso-light/50 hover:text-rose transition-colors"
                >
                  忘記密碼？
                </Link>
              </div>
            </div>
            {error && (
              <p className="text-rose text-sm font-medium" role="alert">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5"
            >
              {loading ? "登入中..." : "登入"}
            </button>
          </form>

          <p className="text-center text-sm text-espresso-light/60 mt-10">
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
