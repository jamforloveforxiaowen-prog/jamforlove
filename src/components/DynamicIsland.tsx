"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface NewsItem {
  id: number;
  title: string;
}

export default function DynamicIsland() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: NewsItem[]) => {
        if (Array.isArray(data)) setNewsList(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const rotate = useCallback(() => {
    if (newsList.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
      setIsAnimating(false);
    }, 300);
  }, [newsList.length]);

  useEffect(() => {
    if (newsList.length <= 1) return;
    const interval = setInterval(rotate, 4000);
    return () => clearInterval(interval);
  }, [rotate, newsList.length]);

  const hasNews = newsList.length > 0;
  const displayText = hasNews ? newsList[currentIndex].title : "目前沒有最新消息";

  return (
    <Link
      href="/news"
      className="pointer-events-auto flex items-center gap-2.5 h-[40px] px-4 rounded-full text-white text-[0.8rem] font-medium no-underline transition-all duration-300 ease-out hover:-translate-y-0.5"
      style={{
        background: hasNews ? "rgba(30,15,8,0.88)" : "rgba(30,15,8,0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 4px 20px rgba(30,15,8,0.15)",
        maxWidth: "min(320px, 45vw)",
      }}
      aria-label={`最新消息：${displayText}`}
    >
      {/* 鈴鐺圖示 */}
      <span
        className="flex-shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full"
        style={{ background: hasNews ? "var(--color-rose)" : "rgba(255,255,255,0.2)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* 輪播文字 */}
      <span className="truncate overflow-hidden min-w-0">
        <span
          className="block truncate transition-all duration-300"
          style={{
            transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
            opacity: isAnimating ? 0 : 1,
          }}
        >
          {displayText}
        </span>
      </span>

      {/* 箭頭 */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="flex-shrink-0 opacity-50"
      >
        <path
          d="M6 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
