"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          News
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          最新消息
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      {loading ? (
        <p className="text-espresso-light/50 text-center py-16 text-sm">載入中...</p>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-5xl mb-6 animate-float">
              <span role="img" aria-label="即將推出">📣</span>
            </p>
            <p className="text-espresso-light text-lg font-serif">
              Coming Soon — 敬請期待
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-lg ring-1 ring-linen-dark/60 p-6 md:p-8"
            >
              <time className="text-xs text-espresso-light/40 block mb-2">
                {item.createdAt}
              </time>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-espresso mb-3">
                {item.title}
              </h2>
              <p className="text-espresso-light leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
