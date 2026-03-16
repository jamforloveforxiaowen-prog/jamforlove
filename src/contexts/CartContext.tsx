"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  addItem: (product: { id: number; name: string; price: number; imageUrl: string }, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "jamforlove-cart";

function readLocal(): CartItem[] {
  try {
    // 優先讀 localStorage，備援讀 sessionStorage（舊版遷移）
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) {
      const items = JSON.parse(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      sessionStorage.removeItem(STORAGE_KEY);
      return items;
    }
  } catch { /* ignore */ }
  return [];
}

function writeLocal(items: CartItem[]) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch { /* storage full */ }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const prevLoggedIn = useRef(false);

  // 檢查登入狀態 + 載入購物車
  const init = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const isLoggedIn = !!data.user;
      setLoggedIn(isLoggedIn);

      if (isLoggedIn && !prevLoggedIn.current) {
        // 剛登入：合併 localStorage 到 DB
        const localItems = readLocal();
        if (localItems.length > 0) {
          const mergeRes = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: localItems }),
          });
          const merged = await mergeRes.json();
          if (Array.isArray(merged)) {
            setItems(merged);
            writeLocal([]);
          }
        } else {
          const cartRes = await fetch("/api/cart");
          const cartData = await cartRes.json();
          if (Array.isArray(cartData)) setItems(cartData);
        }
      } else if (isLoggedIn) {
        // 已登入：從 DB 讀取
        const cartRes = await fetch("/api/cart");
        const cartData = await cartRes.json();
        if (Array.isArray(cartData)) setItems(cartData);
      } else {
        // 未登入：從 localStorage 讀取
        setItems(readLocal());
      }

      prevLoggedIn.current = isLoggedIn;
    } catch {
      setItems(readLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { init(); }, [pathname, init]);

  const addItem = useCallback(
    (product: { id: number; name: string; price: number; imageUrl: string }, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        const newQty = (existing?.quantity || 0) + quantity;
        const next = existing
          ? prev.map((i) => (i.productId === product.id ? { ...i, quantity: newQty } : i))
          : [...prev, { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl || "", quantity }];

        if (loggedIn) {
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, quantity: newQty }),
          });
        } else {
          writeLocal(next);
        }
        return next;
      });
    },
    [loggedIn]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      setItems((prev) => {
        const next = quantity <= 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));

        if (loggedIn) {
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });
        } else {
          writeLocal(next);
        }
        return next;
      });
    },
    [loggedIn]
  );

  const removeItem = useCallback(
    (productId: number) => updateQuantity(productId, 0),
    [updateQuantity]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    writeLocal([]);
    if (loggedIn) {
      fetch("/api/cart", { method: "DELETE" });
    }
  }, [loggedIn]);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, addItem, updateQuantity, removeItem, clearCart, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
