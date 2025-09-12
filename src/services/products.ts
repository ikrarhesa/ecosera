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
 * Produk terkait berdasarkan kategori + kemiripan tag.
 * - Prioritas: kategori sama (+2 poin)
 * - Bonus: setiap tag sama +1 (maks 3)
 * - Featured & stok ikut mengurutkan
 */
export async function getRelatedProducts(
  category: string,
  excludeId?: string,
  limit = 8
): Promise<Product[]> {
  const all = await getAllProducts();

  const base = all.filter(p => p.id !== excludeId);

  const score = (p: Product): number => {
    let sc = 0;
    if (category && p.category === category) sc += 2;

    // cari shared tags kalau ada referensi produk utama
    let shared = 0;
    if (excludeId) {
      const main = indexById?.get(excludeId) ?? all.find(x => x.id === excludeId);
      if (main?.tags?.length && p.tags?.length) {
        const set = new Set(main.tags.map(t => t.toLowerCase()));
        for (const t of p.tags) {
          if (set.has((t ?? "").toLowerCase())) {
            shared++;
            if (shared >= 3) break;
          }
        }
      }
    }
    sc += shared; // +1 per shared tag (maks 3)

    // kecilkan skor jika out of stock
    if ((p.stock ?? 0) <= 0) sc -= 2;

    return sc;
  };

  return base
    .map(p => ({ p, s: score(p) }))
    .filter(x => x.s > -2) // buang yang sangat tidak relevan
    .sort((a, b) => {
      // sort by score desc, lalu featured, lalu stok, lalu rating
      if (b.s !== a.s) return b.s - a.s;
      const fa = (a.p as any).featured ? 1 : 0;
      const fb = (b.p as any).featured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      const sa = a.p.stock ?? 0;
      const sb = b.p.stock ?? 0;
      if (sb !== sa) return sb - sa;
      const ra = a.p.rating ?? 0;
      const rb = b.p.rating ?? 0;
      return rb - ra;
    })
    .slice(0, limit)
    .map(x => x.p);
}

/** Helper: ambil per kategori langsung (tanpa ranking tag) */
export async function getProductsByCategory(category: string, limit = 24): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.category === category).slice(0, limit);
}
