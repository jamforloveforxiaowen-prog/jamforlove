import Image from "next/image";
import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";
import AboutSection from "@/components/AboutSection";

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

      {/* ── Banner 輪播 ─────────────────── */}
      <BannerCarousel />

      {/* ── 關於我們 ───────────────────── */}
      <AboutSection />

    </div>
  );
}
