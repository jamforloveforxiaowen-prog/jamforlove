"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name, email }),
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

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/8 px-4 py-3.5 text-linen text-[0.9375rem] outline-none transition-all placeholder:text-white/20 focus:border-rose focus:bg-white/12 focus:shadow-[0_0_0_3px_rgba(196,80,106,0.25)]";

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] relative overflow-hidden flex"
      style={{
        background:
          "linear-gradient(135deg, var(--color-wine) 0%, #2a1018 30%, #1a0a10 60%, var(--color-espresso) 100%)",
      }}
    >
      {/* 全螢幕裝飾光球 — 深色調 */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 500,
          height: 500,
          background: "var(--color-rose)",
          filter: "blur(130px)",
          top: "-10%",
          right: "-8%",
        }}
      />
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: 400,
          height: 400,
          background: "var(--color-honey)",
          filter: "blur(100px)",
          bottom: "-5%",
          left: "-5%",
        }}
      />
      <div
        className="absolute rounded-full opacity-12"
        style={{
          width: 300,
          height: 300,
          background: "var(--color-rose-light)",
          filter: "blur(90px)",
          top: "40%",
          left: "30%",
        }}
      />
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: 250,
          height: 250,
          background: "var(--color-sage)",
          filter: "blur(80px)",
          top: "10%",
          left: "50%",
        }}
      />
      <div
        className="absolute rounded-full opacity-8"
        style={{
          width: 200,
          height: 200,
          background: "var(--color-honey-light)",
          filter: "blur(70px)",
          bottom: "15%",
          right: "25%",
        }}
      />

      {/* 左側品牌宣言 — 桌面版 */}
      <div className="hidden lg:flex lg:w-[48%] items-center justify-center relative z-10">
        <div className="animate-reveal-up text-center px-12 xl:px-16 max-w-lg">
          <h2
            className="font-serif text-linen leading-[1.15] mb-6"
            style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
          >
            開啟你的
            <br />
            <span className="text-rose-light">果醬旅程</span>
          </h2>
          <p className="text-white/40 text-base leading-relaxed max-w-sm mx-auto mb-10">
            加入 Jam For Love，探索季節限定口味，享受從產地到餐桌的手作溫度。
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-rose-light text-2xl font-bold font-serif">100%</div>
              <div className="text-white/30 text-xs mt-1">天然成分</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-honey-light text-2xl font-bold font-serif">20+</div>
              <div className="text-white/30 text-xs mt-1">獨家口味</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-sage-light text-2xl font-bold font-serif">小批</div>
              <div className="text-white/30 text-xs mt-1">手工熬煮</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右側註冊表單 — 深色毛玻璃卡片 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div
          className="w-full max-w-md animate-reveal-up"
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "1.5rem",
            boxShadow:
              "0 8px 48px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            padding: "2.25rem 2rem",
          }}
        >
          {/* 手機版 Logo */}
          <div className="lg:hidden text-center mb-5">
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
            <p className="text-white/30 text-[0.6875rem] tracking-[0.2em] uppercase mt-1">
              Handmade with Love
            </p>
          </div>

          {/* 標題區 */}
          <div className="mb-7">
            <p className="text-rose-light text-[0.6875rem] font-semibold tracking-[0.2em] uppercase mb-2">
              建立帳號
            </p>
            <h1 className="font-serif text-2xl font-bold text-linen mb-1.5">
              加入我們
            </h1>
            <p className="text-white/40 text-[0.8125rem]">
              註冊帳號，開始享受手工果醬
            </p>
          </div>

          {/* 表單 — 兩欄式 */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="reg-username"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  帳號
                </label>
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="3-20 個字元"
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  密碼
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="至少 6 個字元"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  姓名
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="用於密碼重設"
                  required
                />
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
              className="w-full py-4 bg-rose text-white font-semibold text-[0.9375rem] rounded-xl transition-all hover:bg-rose-dark hover:shadow-[0_4px_20px_rgba(196,80,106,0.4)] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
                  註冊中...
                </span>
              ) : "註冊"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            已有帳號？{" "}
            <Link
              href="/login"
              className="text-rose-light font-medium hover:text-rose transition-colors"
            >
              登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
