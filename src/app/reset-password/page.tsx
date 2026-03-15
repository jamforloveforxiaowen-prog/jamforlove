"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center animate-reveal-up">
          <h1 className="font-serif text-2xl font-bold text-espresso mb-3">
            連結無效
          </h1>
          <p className="text-espresso-light/60 text-sm mb-8">
            此重設密碼連結無效，請重新申請。
          </p>
          <Link href="/forgot-password" className="btn-primary">
            重新申請
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("兩次密碼輸入不一致");
      return;
    }

    if (password.length < 6) {
      setError("密碼至少需要 6 個字元");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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

    setSuccess(true);
  }

  if (success) {
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
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-espresso mb-3">
            密碼已重設
          </h1>
          <p className="text-espresso-light/60 text-sm mb-8">
            您的密碼已成功更新，請使用新密碼登入。
          </p>
          <button
            onClick={() => router.push("/login")}
            className="btn-primary"
          >
            前往登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-reveal-up">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
            設定新密碼
          </h1>
          <p className="text-espresso-light/60 text-sm">
            請輸入您的新密碼
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-espresso mb-2"
            >
              新密碼
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="至少 6 個字元"
              minLength={6}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-espresso mb-2"
            >
              確認新密碼
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="再次輸入新密碼"
              required
            />
          </div>
          {error && (
            <p className="text-rose text-sm font-medium" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3.5"
          >
            {loading ? "更新中..." : "更新密碼"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-espresso-light/50 text-sm">載入中...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
