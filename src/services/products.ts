import type { Product } from "../types/product";

let cache: Product[] | null = null;

export async function getAllProducts(): Promise<Product[]> {
  if (cache) return cache;
  const data: Product[] = (await import("../data/products.json")).default as any;
  cache = data.filter(p => p.available !== false);
  return cache;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.featured);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find(p => p.id === id);
}

export async function searchProducts(q: string): Promise<Product[]> {
  const all = await getAllProducts();
  const s = q.trim().toLowerCase();
  if (!s) return all;
  return all.filter(
    p =>
      p.name.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s) ||
      (p.tags?.some(t => t.toLowerCase().includes(s)) ?? false)
  );
}
