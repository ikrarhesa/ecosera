import type { Product } from "../types/product";

let cache: Product[] | null = null;
let indexById: Map<string, Product> | null = null;

/** Load once from /data/products.json and cache (only available:true) */
export async function getAllProducts(): Promise<Product[]> {
  if (cache) return cache;

  const data: Product[] = (await import("../data/products.json")).default as any;
  // hanya produk available
  cache = data.filter((p: any) => p?.available !== false);
  indexById = new Map(cache.map(p => [p.id, p]));
  return cache;
}

/** Optional: panggil ini kalau kamu hot-replace data runtime */
export function invalidateProductsCache() {
  cache = null;
  indexById = null;
}

/** Featured flag dari JSON */
export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p: any) => !!p.featured);
}

/** Ambil by id. Konsisten return null jika tidak ada. */
export async function getProductById(id: string): Promise<Product | null> {
  if (indexById) {
    return indexById.get(id) ?? null;
  }
  const all = await getAllProducts();
  return all.find(p => p.id === id) ?? null;
}

/** Cari produk: nama, id, tags, category, sellerName, location */
export async function searchProducts(q: string): Promise<Product[]> {
  const all = await getAllProducts();
  const s = (q ?? "").trim().toLowerCase();
  if (!s) return all;

  const contains = (v?: string) => (v ? v.toLowerCase().includes(s) : false);

  return all.filter(p =>
    contains(p.name) ||
    contains(p.id) ||
    contains(p.category as any) ||
    contains(p.sellerName) ||
    contains(p.location) ||
    (p.tags?.some(t => (t ?? "").toLowerCase().includes(s)) ?? false)
  );
}

/**
 * Produk terka*
