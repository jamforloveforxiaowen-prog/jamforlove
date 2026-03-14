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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-amber-700 hover:text-amber-900 text-sm mb-6 inline-block"
      >
        &larr; 回到首頁
      </Link>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {product.imageUrl ? (
            <div className="relative aspect-square">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square bg-amber-100 flex items-center justify-center text-amber-300 text-8xl">
              🍓
            </div>
          )}
          <div className="p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">
              {product.description || "暫無詳細說明"}
            </p>
            <p className="text-3xl font-bold text-amber-700 mb-8">
              NT$ {product.price}
            </p>
            <Link
              href="/order"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition font-medium text-center"
            >
              前往訂購
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
