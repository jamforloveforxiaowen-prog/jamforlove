import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) notFound();

  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.isActive, true)))
    .get();

  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-warm-brown-light hover:text-berry text-sm font-medium transition-colors mb-8"
      >
        <span>&larr;</span>
        <span>回到首頁</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-cream-dark flex items-center justify-center text-8xl">
              🍓
            </div>
          )}
        </div>

        <div className="py-4">
          <h1 className="font-serif text-4xl md:text-5xl font-black text-warm-brown leading-tight mb-6">
            {product.name}
          </h1>
          <p className="text-warm-brown-light leading-loose text-lg whitespace-pre-wrap mb-8">
            {product.description || "暫無詳細說明"}
          </p>
          <p className="font-serif text-4xl font-bold text-berry mb-10">
            NT$ {product.price}
          </p>
          <Link
            href="/order"
            className="inline-block bg-berry text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-berry-dark transition-colors"
          >
            前往訂購
          </Link>
        </div>
      </div>
    </div>
  );
}
