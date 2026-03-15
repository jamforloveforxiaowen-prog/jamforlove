"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* 左側裝飾 */}
      <div className="hidden lg:flex lg:w-[45%] bg-wine items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 30%, #c4506a 0%, transparent 50%), radial-gradient(circle at 30% 80%, #d4a04a 0%, transparent 40%)",
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
          <p className="text-white/60 text-sm tracking-[0.2em] uppercase">
            Handmade with Love
          </p>
        </div>
      </div>

      {/* 右側表單 */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-reveal-up">
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
              加入我們
            </h1>
            <p className="text-espresso-light/60 text-sm">
              註冊帳號，開始享受手工果醬
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="reg-username"
                className="block text-sm font-medium text-espresso mb-2"
              >
                帳號
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="3-20 個字元"
                required
              />
            </div>
            <div>
              <label
                htmlFor="reg-password"
                className="block text-sm font-medium text-espresso mb-2"
              >
                密碼
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="至少 6 個字元"
                required
              />
            </div>
            <div>
              <label
                htmlFor="reg-name"
                className="block text-sm font-medium text-espresso mb-2"
              >
                姓名
              </label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            {error && (
              <p className="text-rose text-sm font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5"
            >
              {loading ? "註冊中..." : "註冊"}
            </button>
          </form>

          <p className="text-center text-sm text-espresso-light/60 mt-10">
            已有帳號？{" "}
            <Link
              href="/login"
              className="text-rose font-medium hover:text-rose-dark transition-colors"
            >
              登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
