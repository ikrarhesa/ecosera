import type { Product } from "../types/product";

const KEY = "ecosera_cart";

export type CartItem = {
  product: Product;
  quantity: number;
};

export function getCart(): CartItem[] {
  try {
    const str = localStorage.getItem(KEY);
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const idx = cart.findIndex(c => c.product.id === item.product.id);
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}
