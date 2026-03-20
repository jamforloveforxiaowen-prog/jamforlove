"use client";

import LottieAnimation, { LOTTIE_URLS } from "./LottieAnimation";

interface HeroLottieProps {
  variant?: "heart" | "cooking";
}

export default function HeroLottie({ variant = "heart" }: HeroLottieProps) {
  if (variant === "cooking") {
    return (
      <LottieAnimation
        src={LOTTIE_URLS.cooking}
        className="w-40 h-40 mx-auto"
      />
    );
  }

  // 愛心浮動動畫，裝飾在 Logo 旁邊
  return (
    <div className="absolute -top-4 -right-4 w-20 h-20 pointer-events-none opacity-70">
      <LottieAnimation
        src={LOTTIE_URLS.heart}
        speed={0.7}
      />
    </div>
  );
}
