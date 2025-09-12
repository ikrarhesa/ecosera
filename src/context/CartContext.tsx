import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { id: string; name: string; price: number; qty: number; thumb?: string; sellerName?: string };

type CartCtx = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ecosera.cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const api: CartCtx = useMemo(() => ({
    items,
    addToCart(item, qty = 1) {
      setItems((prev) => {
        const i = prev.findIndex(p => p.id === item.id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: copy[i].qty + qty };
          return copy;
        }
        return [...prev, { ...item, qty }];
      });
    },
    removeFromCart(id) {
      setItems((prev) => prev.filter(p => p.id !== id));
    },
    updateQty(id, qty) {
      setItems((prev) => {
        if (qty <= 0) return prev.filter(p => p.id !== id);
        return prev.map(p => (p.id === id ? { ...p, qty } : p));
      });
    },
    clearCart() {
      setItems([]);
    },
  }), [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
