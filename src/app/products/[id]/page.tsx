import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

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
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-espresso-light/60 hover:text-rose text-sm transition-colors duration-200 mb-10 py-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="group-hover:-translate-x-1 transition-transform duration-200"
        >
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        回到首頁
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* 產品圖片 */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-linen-dark animate-reveal-scale">
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
            <div className="absolute inset-0 flex items-center justify-center text-8xl">
              🍓
            </div>
          )}
        </div>

        {/* 產品資訊 */}
        <div className="py-2 md:py-8">
          <div className="animate-reveal-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-4">
              Handmade Jam
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso leading-tight mb-6">
              {product.name}
            </h1>
          </div>

          <div
            className="animate-reveal-up"
            style={{ animationDelay: "0.25s" }}
          >
            <p className="text-espresso-light/70 leading-loose text-base whitespace-pre-wrap mb-10 break-words">
              {product.description || "用心手作的好味道，等你來品嚐。"}
            </p>
          </div>

          <div
            className="animate-reveal-up"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex items-baseline gap-2 mb-10">
              <span
                className="text-rose text-4xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                NT$ {product.price}
              </span>
            </div>
            <AddToCartButton
              product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }}
            />
            <p className="mt-5 text-espresso-light/40 text-xs">
              每一罐都是小量手工熬煮，新鮮現做
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
