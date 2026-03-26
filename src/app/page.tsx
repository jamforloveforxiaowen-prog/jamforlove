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

      {/* ── Banner ─────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-dark) 50%, var(--color-wine) 100%)",
        }}
      >
        {/* 裝飾光球 */}
        <div
          className="absolute rounded-full opacity-20"
          style={{ width: 400, height: 400, background: "var(--color-honey-light)", filter: "blur(100px)", top: "-20%", right: "-5%" }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{ width: 300, height: 300, background: "var(--color-rose-light)", filter: "blur(80px)", bottom: "-15%", left: "10%" }}
        />

        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
          {/* 左側文字 */}
          <div className="flex-1 text-center md:text-left">
            <h2
              className="text-white text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-4"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
            >
              用愛製作，用心傳遞
            </h2>
            <div className="w-10 h-[1.5px] bg-white/30 mx-auto md:mx-0 my-5" />
            <p className="text-white/75 text-base md:text-lg leading-relaxed font-serif max-w-lg mx-auto md:mx-0">
              最好的果醬來自最簡單的原料——新鮮水果、天然糖分、和滿滿的用心。
            </p>
          </div>

          {/* 右側特色數據 */}
          <div className="flex gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-white text-2xl md:text-3xl font-bold font-serif">100%</div>
              <div className="text-white/40 text-xs mt-1">天然成分</div>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <div className="text-honey-light text-2xl md:text-3xl font-bold font-serif">20+</div>
              <div className="text-white/40 text-xs mt-1">獨家口味</div>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <div className="text-white text-2xl md:text-3xl font-bold font-serif">小批</div>
              <div className="text-white/40 text-xs mt-1">手工熬煮</div>
            </div>
          </div>
        </div>
      </section>

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
