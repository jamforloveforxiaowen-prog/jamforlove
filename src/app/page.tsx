import Image from "next/image";
import Link from "next/link";

export default function HomePage() {

  return (
    <div>
      {/* ── Hero ─────────────────────────── */}
      <section className="min-h-[calc(100vh-3.5rem)] flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full py-20 md:py-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
            {/* 左側文字 */}
            <div className="md:col-span-7 order-2 md:order-1">
              <p className="text-rose text-xs font-semibold tracking-[0.35em] uppercase mb-8">
                Handmade with Love
              </p>
              <h1
                className="leading-[0.85] mb-8"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(4rem, 10vw, 9rem)",
                  color: "var(--color-espresso)",
                }}
              >
                Jam
                <br />
                <span className="text-rose">For Love</span>
              </h1>
              <p className="font-serif text-espresso-light text-xl md:text-2xl leading-relaxed mb-4 max-w-lg">
                嚴選當季新鮮水果，不添加人工色素與防腐劑。
              </p>
              <p className="text-espresso-light/60 leading-relaxed mb-10 max-w-md">
                每一口，都是用愛熬出的幸福滋味。
              </p>
              <Link href="/order" className="btn-primary text-base px-10 py-4">
                立即訂購
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="ml-1"
                >
                  <path
                    d="M3 8h10m0 0L9 4m4 4L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* 右側 Logo */}
            <div className="md:col-span-5 order-1 md:order-2 flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-6 bg-rose/[0.06] rounded-full blur-2xl" />
                <Image
                  src="/logo.jpg"
                  alt="Jam For Love"
                  width={340}
                  height={340}
                  className="relative rounded-full shadow-2xl shadow-espresso/10 w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[340px] lg:h-[340px]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 有機波浪分隔 ──────────────────── */}
      <div className="w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-[50px] md:h-[80px]"
        >
          <path
            d="M0 60C180 20 360 90 540 50C720 10 900 80 1080 40C1260 0 1380 60 1440 40V120H0V60Z"
            fill="var(--color-rose)"
          />
        </svg>
      </div>

      {/* ── 品牌故事 ─────────────────────── */}
      <section className="story-section text-white relative overflow-hidden">
        {/* 引號裝飾 */}
        <div className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 pointer-events-none z-10 select-none">
          <span
            className="text-white/[0.07] block leading-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(8rem, 20vw, 16rem)", fontStyle: "italic" }}
            aria-hidden="true"
          >
            &ldquo;
          </span>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-24 md:py-36 text-center relative z-10">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, textShadow: "0 2px 30px rgba(0,0,0,0.15)" }}
          >
            用愛製作，用心傳遞
          </h2>
          <div className="w-12 h-[1.5px] bg-white/40 mx-auto my-8" />
          <p className="text-white/75 text-lg md:text-xl leading-loose max-w-xl mx-auto font-serif">
            我們相信，最好的果醬來自最簡單的原料——新鮮水果、天然糖分、和滿滿的用心。
          </p>
          <p className="text-white/55 text-base leading-loose max-w-lg mx-auto mt-4">
            每一批果醬都是小量手工熬煮，保留水果最天然的風味與色澤。
          </p>
        </div>
      </section>

      {/* ── 波浪分隔（下） ────────────────── */}
      <div className="w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-[50px] md:h-[80px]"
        >
          <path
            d="M0 0H1440V60C1260 100 1080 20 900 60C720 100 540 30 360 70C180 110 60 30 0 60V0Z"
            fill="var(--color-rose)"
          />
        </svg>
      </div>

      {/* ── 特色標籤 ───────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { icon: "🍊", text: "當季新鮮水果" },
              { icon: "🫙", text: "小量手工熬煮" },
              { icon: "🌿", text: "無人工添加物" },
              { icon: "💛", text: "用愛傳遞溫暖" },
            ].map((item) => (
              <div key={item.text} className="feature-pill">
                <span className="pill-icon">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
