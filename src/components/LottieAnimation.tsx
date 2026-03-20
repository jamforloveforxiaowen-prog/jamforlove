"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const DotLottieReact = dynamic(
  () =>
    import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

type DotLottieProps = ComponentProps<typeof DotLottieReact>;

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function LottieAnimation({
  src,
  loop = true,
  autoplay = true,
  speed = 1,
  className = "",
  style,
}: LottieAnimationProps) {
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      className={className}
      style={style}
    />
  );
}

// 預設動畫 URL 集中管理
export const LOTTIE_URLS = {
  // 愛心浮動
  heart: "https://lottie.host/44d7aec3-1543-41ba-9aab-9be84f743d0a/xZ0BeBJt3o.lottie",
  // 空購物車
  emptyCart: "https://lottie.host/c5d29225-0c4f-429b-b46b-090acd216979/iVHIeB5YWH.lottie",
  // 下單成功
  success: "https://lottie.host/647c5f3f-7e80-4c68-89a4-4e5a60ce1a0a/7r5lMSc8ZE.json",
  // 慶祝彩帶
  confetti: "https://lottie.host/395f0e7d-b105-4c77-8c06-5a388d7cd78e/lchIiQQbHx.json",
  // 404 找不到頁面
  notFound: "https://lottie.host/ec3faaba-5b6a-42fd-be91-5dc37017a04a/zSwgM6PzmZ.lottie",
  // 載入中
  loading: "https://lottie.host/23be50a5-0ed2-4c71-91c4-8865b656cb91/Qnkhz7Yf5Q.lottie",
  // 烹飪/料理
  cooking: "https://lottie.host/000a6f23-2874-438b-a14e-7af8f81623be/BjOdUXpDA3.lottie",
};
