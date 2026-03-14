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
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-brown py-24 md:py-36">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #d4a04a 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a23b5a 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="max-w-5xl mx-auto px-5 relative z-10 text-center">
          <p
            className="text-honey-light font-sans text-sm font-semibold tracking-[0.3em] uppercase mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Handmade with Love
          </p>
          <h1
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-cream leading-tight mb-8 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Jam For Love
          </h1>
          <p
            className="text-cream/90 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            嚴選當季新鮮水果，不添加人工色素與防腐劑。
            <br className="hidden md:block" />
            每一口，都是用愛熬出的幸福滋味。
          </p>
          <Link
            href="/order"
            className="inline-block mt-10 bg-berry text-white px-8 py-4 rounded-full font-semibold hover:bg-berry-dark hover:shadow-lg active:scale-[0.97] transition-all duration-200 text-lg animate-fade-up"
            style={{ animationDelay: "0.55s" }}
          >
            立即訂購
          </Link>
        </div>
      </section>

      {/* 品牌故事 */}
      <section className="max-w-3xl mx-auto px-5 py-20 text-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <p className="text-berry/40 text-2xl mb-4">· · ·</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-brown mb-6">
          用愛製作，用心傳遞
        </h2>
        <p className="text-warm-brown-light leading-loose text-lg">
          我們相信，最好的果醬來自最簡單的原料——新鮮水果、天然糖分、和滿滿的用心。
          每一批果醬都是小量手工熬煮，保留水果最天然的風味與色澤。
          從產地到你的餐桌，我們堅持不添加任何人工成分。
        </p>
      </section>

      {/* 產品區 */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-cream-dark" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-brown shrink-0">
            我們的果醬
          </h2>
          <div className="h-px flex-1 bg-cream-dark" />
        </div>

        {allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4 animate-gentle-float">🍓</p>
            <p className="text-warm-brown-light text-lg">
              新口味正在熬煮中，敬請期待...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block animate-fade-up hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-cream-dark flex items-center justify-center text-6xl">
                      🍓
                    </div>
                  )}
                  <div className="absolute inset-0 bg-warm-brown/0 group-hover:bg-warm-brown/10 transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-xl font-bold text-warm-brown group-hover:text-berry transition-colors">
                  {product.name}
                </h3>
                <p className="text-warm-brown-light text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-berry font-bold text-lg mt-2">
                  NT$ {product.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-dark py-12 text-center">
        <p className="font-serif text-warm-brown text-lg font-bold mb-2">
          Jam For Love
        </p>
        <p className="text-warm-brown-light text-sm mb-4">
          用愛製作的手工果醬
        </p>
        <p className="text-warm-brown-light/50 text-xs">
          以{" "}
          <span className="inline-block hover:scale-125 transition-transform duration-200 cursor-default" title="用滿滿的愛心">
            ❤️
          </span>
          {" "}手工熬煮 · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
