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
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-warm-brown mb-2">
            加入我們
          </h1>
          <p className="text-warm-brown-light text-sm">
            註冊帳號，開始享受手工果醬
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-brown mb-2">
              帳號
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
              placeholder="3-20 個字元"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-brown mb-2">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
              placeholder="至少 6 個字元"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-brown mb-2">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-cream-dark bg-white rounded-xl px-4 py-3 text-warm-brown focus:outline-none focus:ring-2 focus:ring-berry/30 focus:border-berry transition"
              required
            />
          </div>
          {error && <p className="text-berry text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-berry text-white py-3 rounded-full font-semibold hover:bg-berry-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "註冊中..." : "註冊"}
          </button>
        </form>

        <p className="text-center text-sm text-warm-brown-light mt-8">
          已有帳號？{" "}
          <Link href="/login" className="text-berry font-medium hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
