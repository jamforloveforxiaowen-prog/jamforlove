"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    setCooldown(60);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-reveal-up">
          <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-sage"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-espresso mb-3">
            重設連結已寄出
          </h1>
          <p className="text-espresso-light/60 text-sm leading-relaxed mb-8">
            如果此 Email 已註冊，您將收到一封包含重設密碼連結的信件。
            <br />
            請查收信箱（包含垃圾郵件資料夾）。
          </p>
          <Link href="/login" className="btn-secondary">
            返回登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-reveal-up">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
            忘記密碼
          </h1>
          <p className="text-espresso-light/60 text-sm">
            輸入註冊時使用的 Email，我們將寄送重設連結給您
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-espresso mb-2"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>
          {error && (
            <p className="text-rose text-sm font-medium" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="btn-primary w-full !py-3.5"
          >
            {loading ? "寄送中..." : cooldown > 0 ? `請等待 ${cooldown} 秒` : "寄送重設連結"}
          </button>
        </form>

        <p className="text-center text-sm text-espresso-light/60 mt-10">
          記起密碼了？{" "}
          <Link
            href="/login"
            className="text-rose font-medium hover:text-rose-dark transition-colors"
          >
            返回登入
          </Link>
        </p>
      </div>
    </div>
  );
}
