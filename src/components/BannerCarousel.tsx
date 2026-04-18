"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 0,
    title: "用愛製作，用心傳遞",
    subtitle: "最好的果醬來自最簡單的原料——新鮮水果、天然糖分、和滿滿的用心。",
    imageUrl: "",
  },
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(FALLBACK_BANNERS);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchDelta, setTouchDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data: Banner[]) => {
        if (Array.isArray(data) && data.length > 0) setBanners(data);
      })
      .catch(() => {});
  }, []);

  const count = banners.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % count) + count) % count);
  }, [count]);

  // 自動輪播
  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => goTo(current + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, count, goTo]);

  function handleTouchStart(x: number) {
    setTouchStart(x);
    setDragging(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleTouchMove(x: number) {
    if (!dragging) return;
    setTouchDelta(x - touchStart);
  }

  function handleTouchEnd() {
    setDragging(false);
    if (Math.abs(touchDelta) > 50) {
      goTo(touchDelta < 0 ? current + 1 : current - 1);
    }
    setTouchDelta(0);
  }

  return (
    <section className="w-full">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "21/9" }}
        onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => handleTouchStart(e.clientX)}
        onMouseMove={(e) => handleTouchMove(e.clientX)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => { if (dragging) handleTouchEnd(); }}
      >
        {/* 滑動軌道 */}
        <div
          className="flex h-full"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(calc(-${current * (100 / count)}% + ${touchDelta}px))`,
            transition: dragging ? "none" : "transform 0.5s ease",
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative h-full flex items-center justify-center"
              style={{ width: `${100 / count}%` }}
            >
              {/* 背景 */}
              {banner.imageUrl ? (
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-dark) 50%, var(--color-wine) 100%)",
                  }}
                />
              )}

              {/* 文字 */}
              <div className="relative z-10 text-center px-6 max-w-3xl">
                {banner.title && (
                  <h2
                    className="text-white text-2xl md:text-4xl lg:text-5xl leading-[1.1] mb-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 300,
                      textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p
                    className="text-white/80 text-sm md:text-base lg:text-lg leading-relaxed font-serif max-w-xl mx-auto"
                    style={{ textShadow: "0 1px 10px rgba(0,0,0,0.3)" }}
                  >
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 左右箭頭（2 張以上才顯示） */}
        {count > 1 && (
          <>
            <button
              onClick={() => goTo(current - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-all z-20"
              aria-label="上一張"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M10 4l-4 4 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => goTo(current + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-all z-20"
              aria-label="下一張"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* 指示點（2 張以上才顯示） */}
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`第 ${i + 1} 張`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
