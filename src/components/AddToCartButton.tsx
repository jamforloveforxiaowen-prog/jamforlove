"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  product: { id: number; name: string; price: number; imageUrl: string };
  className?: string;
  size?: "sm" | "lg";
}

export default function AddToCartButton({ product, className, size = "lg" }: Props) {
  const { items, addItem, updateQuantity } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.productId === product.id);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  // 已在購物車中：顯示數量控制
  if (inCart) {
    const btnSize = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-lg";
    const qtySize = size === "sm" ? "w-6 text-sm" : "w-8 text-base";
    return (
      <div className={`flex items-center gap-1.5 ${className || ""}`}>
        <button
          onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
          className={`${btnSize} rounded-md border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all duration-150 flex items-center justify-center`}
        >
          −
        </button>
        <span className={`${qtySize} text-center font-semibold text-espresso tabular-nums`}>
          {inCart.quantity}
        </span>
        <button
          onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
          className={`${btnSize} rounded-md border border-linen-dark text-espresso-light hover:border-rose hover:text-rose active:scale-90 transition-all duration-150 flex items-center justify-center`}
        >
          +
        </button>
      </div>
    );
  }

  // 尚未加入：顯示加入按鈕
  return (
    <button
      onClick={handleAdd}
      className={size === "lg" ? `btn-primary text-base px-10 py-4 ${className || ""}` : `btn-primary-sm ${className || ""}`}
    >
      {added ? (
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          已加入
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          加入購物車
        </span>
      )}
    </button>
  );
}
