"use client";

import LottieAnimation, { LOTTIE_URLS } from "./LottieAnimation";

interface HeroLottieProps {
  variant?: "hero" | "cooking" | "story";
}

export default function HeroLottie({ variant = "hero" }: HeroLottieProps) {
  if (variant === "cooking") {
    return (
      <LottieAnimation
        src={LOTTIE_URLS.cooking}
        className="w-40 h-40 mx-auto"
      />
    );
  }

  if (variant === "story") {
    return (
      <div className="flex justify-center gap-6 mb-6">
        <LottieAnimation
          src={LOTTIE_URLS.heart}
          className="w-16 h-16 opacity-60"
          speed={0.6}
        />
        <LottieAnimation
          src={LOTTIE_URLS.heart}
          className="w-12 h-12 opacity-40 mt-3"
          speed={0.8}
        />
      </div>
    );
  }

  // Hero：多個裝飾動畫圍繞 Logo
  return (
    <>
      {/* 右上角 — 大愛心 */}
      <div className="absolute -top-8 -right-8 w-28 h-28 pointer-events-none animate-reveal-scale" style={{ animationDelay: "0.8s" }}>
        <LottieAnimation
          src={LOTTIE_URLS.heart}
          speed={0.6}
        />
      </div>

      {/* 左下角 — 小愛心 */}
      <div className="absolute -bottom-6 -left-10 w-20 h-20 pointer-events-none opacity-60 animate-reveal-scale" style={{ animationDelay: "1.2s" }}>
        <LottieAnimation
          src={LOTTIE_URLS.heart}
          speed={0.8}
        />
      </div>

      {/* 左上角 — 水果動畫 */}
      <div className="absolute -top-12 -left-14 w-24 h-24 pointer-events-none opacity-50 animate-reveal-scale hidden md:block" style={{ animationDelay: "1s" }}>
        <LottieAnimation
          src={LOTTIE_URLS.fruits}
          speed={0.5}
        />
      </div>

      {/* 右下角 — 小愛心 */}
      <div className="absolute -bottom-4 -right-12 w-16 h-16 pointer-events-none opacity-50 animate-reveal-scale hidden md:block" style={{ animationDelay: "1.4s" }}>
        <LottieAnimation
          src={LOTTIE_URLS.heart}
          speed={1}
        />
      </div>
    </>
  );
}
