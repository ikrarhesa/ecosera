// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { Product } from "../pages/Home";

export type CartItem = Product & { qty: number };

type CartContextType = {
  items: CartItem[];
  addToCart: (p: Product, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (p: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === p.id);
      if (existing) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x));
      return [...prev, { ...p, qty }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((x) => x.id !== id);
      return prev.map((x) => (x.id === id ? { ...x, qty } : x));
    });
  };

  const removeFromCart = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
