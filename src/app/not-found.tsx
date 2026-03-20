"use client";

import Link from "next/link";
import LottieAnimation, { LOTTIE_URLS } from "@/components/LottieAnimation";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <LottieAnimation
          src={LOTTIE_URLS.notFound}
          loop
          className="w-64 h-64 mx-auto mb-4"
        />
        <h1 className="font-serif text-3xl font-bold text-espresso mb-3">
          找不到這個頁面
        </h1>
        <p className="text-espresso-light/60 mb-8 leading-relaxed">
          這個頁面可能已經被移除，或是網址有誤。
          <br />
          不如回首頁看看有什麼好吃的果醬吧！
        </p>
        <Link href="/" className="btn-primary">
          回到首頁
        </Link>
      </div>
    </div>
  );
}
