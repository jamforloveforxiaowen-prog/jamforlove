import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true));

  return (
    <div>
      {/* ── Hero ─────────────────────────── */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full py-20 md:py-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
            {/* 左側文字 */}
            <div className="md:col-span-7 order-2 md:order-1">
              <p
                className="text-rose text-xs font-semibold tracking-[0.35em] uppercase mb-8 animate-reveal"
                style={{ animationDelay: "0.1s" }}
              >
                Handmade with Love
              </p>
              <h1
                className="leading-[0.85] mb-8 animate-reveal-up"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(4rem, 10vw, 9rem)",
                  color: "var(--color-espresso)",
                  animationDelay: "0.2s",
                }}
              >
                Jam
                <br />
                <span className="text-rose">For Love</span>
              </h1>
              <p
                className="font-serif text-espresso-light text-xl md:text-2xl leading-relaxed mb-4 max-w-lg animate-reveal-up"
                style={{ animationDelay: "0.4s" }}
              >
                嚴選當季新鮮水果，不添加人工色素與防腐劑。
              </p>
              <p
                className="text-espresso-light/60 leading-relaxed mb-10 max-w-md animate-reveal-up"
                style={{ animationDelay: "0.5s" }}
              >
                每一口，都是用愛熬出的幸福滋味。
              </p>
              <div
                className="animate-reveal-up"
                style={{ animationDelay: "0.65s" }}
              >
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
            </div>

            {/* 右側 Logo */}
            <div className="md:col-span-5 order-1 md:order-2 flex justify-center md:justify-end">
              <div
                className="relative animate-reveal-scale"
                style={{ animationDelay: "0.3s" }}
              >
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
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-[40px] md:h-[60px]"
        >
          <path
            d="M0 40C240 10 480 70 720 40C960 10 1200 70 1440 40V80H0V40Z"
            fill="var(--color-rose)"
          />
        </svg>
      </div>

      {/* ── 品牌故事 ─────────────────────── */}
      <section className="bg-rose text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.1)" }}
          >
            用愛製作，用心傳遞
          </h2>
          <p className="text-white/80 text-lg leading-loose max-w-xl mx-auto">
            我們相信，最好的果醬來自最簡單的原料——新鮮水果、天然糖分、和滿滿的用心。
            每一批果醬都是小量手工熬煮，保留水果最天然的風味與色澤。
          </p>
        </div>
      </section>

      {/* ── 波浪分隔（下） ────────────────── */}
      <div className="w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-[40px] md:h-[60px]"
        >
          <path
            d="M0 0H1440V40C1200 70 960 10 720 40C480 70 240 10 0 40V0Z"
            fill="var(--color-rose)"
          />
        </svg>
      </div>

      {/* ── 產品區 ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="mb-14">
          <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Our Jams
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
            我們的果醬
          </h2>
          <div className="w-16 h-[2px] bg-rose mt-5" />
        </div>

        {allProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-5 animate-float">
              <span role="img" aria-label="草莓">🍓</span>
            </p>
            <p className="text-espresso-light text-lg font-serif">
              新口味正在熬煮中，敬請期待...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {allProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block animate-reveal-up"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-5 bg-linen-dark">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      🍓
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="font-serif text-lg font-bold text-espresso group-hover:text-rose transition-colors duration-200 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-espresso-light/60 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                <p
                  className="text-rose font-semibold mt-3 text-lg"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  NT$ {product.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ───────────────────────── */}
      <footer className="border-t border-linen-dark/60">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col items-center gap-5">
          <Image
            src="/logo.jpg"
            alt="Jam For Love"
            width={48}
            height={48}
            className="rounded-full"
          />
          <p
            className="text-espresso text-lg tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Jam For Love
          </p>
          <p className="text-espresso-light/40 text-xs tracking-wide">
            用愛手工熬煮 &middot; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
