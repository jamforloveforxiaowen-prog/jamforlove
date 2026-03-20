"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import LottieAnimation, { LOTTIE_URLS } from "@/components/LottieAnimation";

interface StoryBlock {
  id: number;
  heading: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
}

export default function StoryPage() {
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/story")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlocks(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Our Story
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          果醬的故事
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5 origin-left animate-underline-grow" />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <LottieAnimation
            src={LOTTIE_URLS.loading}
            className="w-24 h-24 mx-auto mb-3"
          />
          <p className="text-espresso-light/50 text-sm">載入中...</p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <LottieAnimation
              src={LOTTIE_URLS.cooking}
              className="w-48 h-48 mx-auto mb-4"
            />
            <p className="text-espresso-light text-lg font-serif">
              Coming Soon — 敬請期待
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {blocks.map((block, i) => {
            const isEven = i % 2 === 0;
            const hasImage = !!block.imageUrl;

            return (
              <section
                key={block.id}
                className={`flex flex-col ${
                  hasImage
                    ? isEven
                      ? "md:flex-row"
                      : "md:flex-row-reverse"
                    : ""
                } gap-8 items-center`}
              >
                {hasImage && (
                  <ScrollReveal
                    direction={isEven ? "left" : "right"}
                    className="w-full md:w-1/2 shrink-0"
                  >
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src={block.imageUrl}
                        alt={block.heading || "果醬的故事"}
                        width={600}
                        height={400}
                        className="w-full object-cover ring-1 ring-linen-dark/60 hover:scale-[1.03] transition-transform duration-700 ease-out"
                      />
                    </div>
                  </ScrollReveal>
                )}
                <ScrollReveal
                  direction={hasImage ? (isEven ? "right" : "left") : "up"}
                  delay={hasImage ? 0.12 : 0}
                  className={hasImage ? "w-full md:w-1/2" : "w-full"}
                >
                  {block.heading && (
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-4">
                      {block.heading}
                    </h2>
                  )}
                  <p className="text-espresso-light leading-relaxed whitespace-pre-line">
                    {block.content}
                  </p>
                </ScrollReveal>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
