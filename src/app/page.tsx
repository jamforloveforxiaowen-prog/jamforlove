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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-amber-900 mb-4">
          JamForLove
        </h1>
        <p className="text-lg text-amber-700 max-w-2xl mx-auto">
          用愛製作的手工果醬，嚴選當季新鮮水果，不添加人工色素與防腐劑，
          讓每一口都是天然的幸福滋味。
        </p>
      </section>

      {/* Products */}
      <section>
        <h2 className="text-2xl font-bold text-amber-900 mb-6">
          我們的果醬
        </h2>
        {allProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            目前沒有上架的產品，請稍後再來看看！
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition block group"
              >
                {product.imageUrl ? (
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-amber-100 flex items-center justify-center text-amber-300 text-6xl">
                    🍓
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-amber-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-amber-700 font-bold text-lg">
                    NT$ {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
